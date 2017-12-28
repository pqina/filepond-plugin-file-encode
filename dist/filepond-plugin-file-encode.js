/*
 * FilePondPluginFileEncode 1.0.1
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
      createRoute = utils.createRoute;

    // adds options to options register

    addFilter('SET_DEFAULT_OPTIONS', function(options) {
      return Object.assign(options, {
        // Enable or disable file encoding
        allowFileEncode: [true, Type.BOOLEAN]
      });
    });

    // called for each view that is created right after the 'create' method
    addFilter('CREATE_VIEW', function(viewAPI) {
      // get reference to created view
      var is = viewAPI.is,
        view = viewAPI.view,
        query = viewAPI.query;

      // only hook up to item view

      if (!is('file') || !query('GET_ALLOW_FILE_ENCODE')) {
        return;
      }

      // store data
      var didLoadItem = function didLoadItem(_ref2) {
        var root = _ref2.root,
          action = _ref2.action;

        if (query('IS_ASYNC')) {
          return;
        }

        var item = query('GET_ITEM', action.id);

        createWorker(DataURIWorker).post({ file: item.file }, function(data) {
          root.ref.dataContainer.value = JSON.stringify({
            id: item.id,
            name: item.filename,
            type: item.fileType,
            size: item.fileSize,
            data: data
          });
        });
      };

      view.registerWriter(
        createRoute({
          DID_LOAD_ITEM: didLoadItem
        })
      );
    });
  };

  if (document) {
    // plugin has loaded
    document.dispatchEvent(
      new CustomEvent('FilePond:pluginloaded', { detail: plugin$1 })
    );
  }

  return plugin$1;
});
