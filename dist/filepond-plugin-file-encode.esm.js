/*
 * FilePondPluginFileEncode 2.0.0
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
  const { Type, createWorker, createRoute, isFile } = utils;

  // holds base64 strings till can be moved to item
  const base64Cache = [];

  addFilter(
    'SHOULD_PREPARE_OUTPUT',
    () =>
      new Promise(resolve => {
        resolve(true);
      })
  );

  addFilter(
    'COMPLETE_PREPARE_OUTPUT',
    (file, { item }) =>
      new Promise(resolve => {
        // this is not a file, continue
        if (!isFile(file)) {
          resolve(file);
          return;
        }

        // store metadata settings for this cache
        base64Cache[item.id] = {
          metadata: item.getMetadata(),
          imagedata: null
        };

        const worker = createWorker(DataURIWorker);
        worker.post({ file }, imagedata => {
          // store in item metadata
          base64Cache[item.id].imagedata = imagedata;

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
        DID_PREPARE_OUTPUT: ({ root, action }) => {
          // only do this if is not uploading async
          if (query('IS_ASYNC')) {
            return;
          }

          const item = query('GET_ITEM', action.id);

          // extract base64 string
          const cache = base64Cache[item.id];
          const metadata = cache.metadata;
          const data = cache.imagedata;

          // create JSON string from encoded data and stores in the hidden input field
          root.ref.data.value = JSON.stringify({
            id: item.id,
            name: item.file.name,
            type: item.file.type,
            size: item.file.size,
            metadata: metadata,
            data
          });

          // clear
          base64Cache[item.id].imagedata = null;
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

const isBrowser =
  typeof window !== 'undefined' && typeof window.document !== 'undefined';

if (isBrowser && document) {
  document.dispatchEvent(
    new CustomEvent('FilePond:pluginloaded', { detail: plugin$1 })
  );
}

export default plugin$1;
