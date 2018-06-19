/*
 * FilePondPluginFileEncode 1.0.5
 * Licensed under MIT, https://opensource.org/licenses/MIT
 * Please visit https://pqina.nl/filepond for details.
 */
(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? (module.exports = factory())
    : typeof define === 'function' && define.amd
      ? define(factory)
      : (global.FilePondPluginFileEncode = factory());
})(this, function() {
  'use strict';

  /**
   * DataURI Worker
   */
  var DataURIWorker = function DataURIWorker() {
    // route messages
    self.onmessage = function(e) {
      convert(e.data.message, function(response) {
        self.postMessage({ id: e.data.id, message: response });
      });
    };

    // convert file to data uri
    var convert = function convert(options, cb) {
      var file = options.file;

      var reader = new FileReader();
      reader.onloadend = function() {
        cb(reader.result.replace('data:', '').replace(/^.+,/, ''));
      };
      reader.readAsDataURL(file);
    };
  };

  var plugin$1 = function(_ref) {
    var addFilter = _ref.addFilter,
      utils = _ref.utils;

    // get quick reference to Type utils
    var Type = utils.Type,
      createWorker = utils.createWorker,
      createRoute = utils.createRoute,
      isFile = utils.isFile;

    addFilter('SHOULD_PREPARE_OUTPUT', function(shouldPrepareOutput) {
      return new Promise(function(resolve, reject) {
        // should alway prepare output
        resolve(true);
      });
    });

    addFilter('COMPLETE_PREPARE_OUTPUT', function(file, _ref2) {
      var item = _ref2.item;
      return new Promise(function(resolve, reject) {
        // this is not a file, continue
        if (!isFile(file)) {
          resolve(file);
          return;
        }

        var metadata = item.getMetadata();
        delete metadata.base64;

        var worker = createWorker(DataURIWorker);
        worker.post({ file: file }, function(data) {
          // store in item metadata
          item.setMetadata('base64', data);

          // done dealing with prepared output
          resolve(file);
        });
      });
    });

    // called for each view that is created right after the 'create' method
    addFilter('CREATE_VIEW', function(viewAPI) {
      // get reference to created view
      var is = viewAPI.is,
        view = viewAPI.view,
        query = viewAPI.query;

      // only hook up to item view

      if (!is('file-wrapper') || !query('GET_ALLOW_FILE_ENCODE')) {
        return;
      }

      view.registerWriter(
        createRoute({
          DID_LOAD_ITEM: function DID_LOAD_ITEM(_ref3) {
            var root = _ref3.root,
              action = _ref3.action;

            // only do this if is not uploading async
            if (query('IS_ASYNC')) {
              return;
            }

            var item = query('GET_ITEM', action.id);

            // extract base64 string
            var metadata = item.getMetadata();
            var data = metadata.base64;
            delete metadata.base64;

            // create JSON string from encoded data and stores in the hidden input field
            root.ref.data.value = JSON.stringify({
              id: item.id,
              name: item.file.name,
              type: item.file.type,
              size: item.file.size,
              metadata: metadata,
              data: data
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

  return plugin$1;
});
