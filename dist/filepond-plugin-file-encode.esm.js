/*
 * FilePondPluginFileEncode 1.0.2
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
  const { Type, createWorker, createRoute } = utils;

  // called for each view that is created right after the 'create' method
  addFilter('CREATE_VIEW', viewAPI => {
    // get reference to created view
    const { is, view, query } = viewAPI;

    // only hook up to item view
    if (!is('file') || !query('GET_ALLOW_FILE_ENCODE')) {
      return;
    }

    // store data
    const didLoadItem = ({ root, action }) => {
      if (query('IS_ASYNC')) {
        return;
      }

      const item = query('GET_ITEM', action.id);

      createWorker(DataURIWorker).post({ file: item.file }, data => {
        root.ref.dataContainer.value = JSON.stringify({
          id: item.id,
          name: item.filename,
          type: item.fileType,
          size: item.fileSize,
          data
        });
      });
    };

    view.registerWriter(
      createRoute({
        DID_LOAD_ITEM: didLoadItem
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

if (document) {
  // plugin has loaded
  document.dispatchEvent(
    new CustomEvent('FilePond:pluginloaded', { detail: plugin$1 })
  );
}

export default plugin$1;
