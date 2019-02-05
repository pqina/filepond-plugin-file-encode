/*
 * FilePondPluginFileEncode 2.1.1
 * Licensed under MIT, https://opensource.org/licenses/MIT
 * Please visit https://pqina.nl/filepond for details.
 */

/* eslint-disable */
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

    var encode = function encode(_ref2) {
      var name = _ref2.name,
        file = _ref2.file;
      return new Promise(function(resolve) {
        var worker = createWorker(DataURIWorker);
        worker.post({ file: file }, function(data) {
          resolve({ name: name, data: data });
          worker.terminate();
        });
      });
    };

    // holds base64 strings till can be moved to item
    var base64Cache = [];

    addFilter('SHOULD_PREPARE_OUTPUT', function() {
      return new Promise(function(resolve) {
        resolve(true);
      });
    });

    addFilter('COMPLETE_PREPARE_OUTPUT', function(file, _ref3) {
      var item = _ref3.item;
      return new Promise(function(resolve) {
        // if it's not a file or a list of files, continue
        if (!isFile(file) && !Array.isArray(file)) {
          return resolve(file);
        }

        // store metadata settings for this cache
        base64Cache[item.id] = {
          metadata: item.getMetadata(),
          imagedata: null
        };

        // wait for all file items to be encoded
        Promise.all(
          (file instanceof Blob ? [{ name: null, file: file }] : file).map(
            encode
          )
        ).then(function(imagedataItems) {
          base64Cache[item.id].imagedata =
            file instanceof Blob ? imagedataItems[0].data : imagedataItems;
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
          DID_PREPARE_OUTPUT: function DID_PREPARE_OUTPUT(_ref4) {
            var root = _ref4.root,
              action = _ref4.action;

            // only do this if is not uploading async
            if (query('IS_ASYNC')) {
              return;
            }

            var item = query('GET_ITEM', action.id);
            if (!item) return;

            // extract base64 string
            var cache = base64Cache[item.id];
            var metadata = cache.metadata;
            var data = cache.imagedata;

            // create JSON string from encoded data and stores in the hidden input field
            root.ref.data.value = JSON.stringify({
              id: item.id,
              name: item.file.name,
              type: item.file.type,
              size: item.file.size,
              metadata: metadata,
              data: data
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

  var isBrowser =
    typeof window !== 'undefined' && typeof window.document !== 'undefined';

  if (isBrowser) {
    document.dispatchEvent(
      new CustomEvent('FilePond:pluginloaded', { detail: plugin$1 })
    );
  }

  return plugin$1;
});
