export const DataURIWorker = function() {
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
