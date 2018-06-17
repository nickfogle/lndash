module.exports = function(app) {
  app.use('/api/bitcoin', require('./api/bitcoin'));
  app.use('/api/device', require('./api/device'));
  app.get("/", function(req, res) {
    res.sendFile(__dirname + '/views/dashboard.html');
  });
};
