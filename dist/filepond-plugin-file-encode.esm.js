/*
 * FilePondPluginFileEncode 1.0.4
 * Licensed under MIT, https://opensource.org/licenses/MIT
 * Please visit https://pqina.nl/filepond for details.
 */
/**
 * DataURI Worker
 */
const DataURIWorker = function() {
  // route messages
  self.onmessage = e => {
    convert(e.data.message, response => {
      self.postMessage({ id: e.data.id, message: response });
    });
  };

  // convert file to data uri
  const convert = (options, cb) => {
    const { file } = options;

    const reader = new FileReader();
    reader.onloadend = () => {
      cb(reader.result.replace('data:', '').replace(/^.+,/, ''));
    };
    reader.readAsDataURL(file);
  };
};

var plugin$1 = ({ addFilter, utils }) => {
  // get quick reference to Type utils
  const { Type, createWorker, createRoute, applyFilterChain } = utils;

  addFilter(
    'SHOULD_PREPARE_OUTPUT',
    shouldPrepareOutput =>
      new Promise((resolve, reject) => {
        // should alway prepare output
        resolve(true);
      })
  );

  addFilter(
    'COMPLETE_PREPARE_OUTPUT',
    (file, { item }) =>
      new Promise((resolve, reject) => {
        const metadata = item.getMetadata();
        delete metadata.base64;

        const worker = createWorker(DataURIWorker);
        worker.post({ file }, data => {
          // store in item metadata
          item.setMetadata('base64', data);

          // done dealing with prepared output
          resolve(file);
        });
      })
  );

  // called for each view that is created right after the 'create' method
  addFilter('CREATE_VIEW', viewAPI => {
    // get reference to created view
    const { is, view, query } = viewAPI;

    // only hook up to item view
    if (!is('file-wrapper') || !query('GET_ALLOW_FILE_ENCODE')) {
      return;
    }

    view.registerWriter(
      createRoute({
        DID_LOAD_ITEM: ({ root, action }) => {
          // only do this if is not uploading async
          if (query('IS_ASYNC')) {
            return;
          }

          const item = query('GET_ITEM', action.id);

          // extract base64 string
          const metadata = item.getMetadata();
          const data = metadata.base64;
          delete metadata.base64;

          // create JSON string from encoded data and stores in the hidden input field
          root.ref.data.value = JSON.stringify({
            id: item.id,
            name: item.file.name,
            type: item.file.type,
            size: item.file.size,
            metadata: metadata,
            data
          });
        }
      })
    );
  });

  return {
    options: {
      // Enable or disable file encoding
      allowFileEncode: [true, Type.BOOLEAN]
    }
  };
};

if (typeof navigator !== 'undefined' && document) {
  // plugin has loaded
  document.dispatchEvent(
    new CustomEvent('FilePond:pluginloaded', { detail: plugin$1 })
  );
}

export default plugin$1;
