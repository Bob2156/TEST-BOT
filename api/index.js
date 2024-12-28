const app = require('../index');

module.exports = (req, res) => {
  app.ready(err => {
    if (err) throw err;
    app.server.emit('request', req, res);
  });
};
