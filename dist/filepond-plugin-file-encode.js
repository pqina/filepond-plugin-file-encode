/*
 * FilePondPluginFileEncode 1.0.3
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
      applyFilterChain = utils.applyFilterChain;

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

      // store data
      var encodeItem = function encodeItem(_ref2) {
        var root = _ref2.root,
          action = _ref2.action;

        var item = query('GET_ITEM', action.id);

        var file = item.file;

        applyFilterChain('PREPARE_OUTPUT', file, {
          query: query,
          item: item
        })
          .then(function(file) {
            var worker = createWorker(DataURIWorker);

            worker.post({ file: file }, function(data) {
              root.ref.data.value = JSON.stringify({
                id: item.id,
                name: file.name,
                type: file.type,
                size: file.size,
                metadata: item.getMetadata(),
                data: data
              });
            });
          })
          .catch(function(error) {
            console.error(error);
          });
      };

      view.registerWriter(
        createRoute({
          DID_LOAD_ITEM: function DID_LOAD_ITEM(_ref3) {
            var root = _ref3.root,
              action = _ref3.action;

            // only do this if is not uploading async
            if (query('IS_ASYNC')) {
              return;
            }

            // we want to encode this item, but only when idling
            root.dispatch('FILE_ENCODE_ITEM', action, true);
          },
          FILE_ENCODE_ITEM: encodeItem
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

  return plugin$1;
});
