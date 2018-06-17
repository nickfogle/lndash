const express = require('express');
const helmet = require('helmet');
const DDOS = require('ddos');
const PORT = process.env.PORT || 1337;
const app = express();

// Add rate limit
var ddos = new DDOS({burst:10, limit:15, errormessage:'STEP OFF ME'});
app.use(ddos.express);

// setup api routes
app.use('/api', require('./api/bitcoin'));
app.use('/api', require('./api/device'));

// Improve security
app.use(helmet({frameguard: {action: 'deny'}}));

// handle static html hosting
app.use(express.static('public'));
app.get('/', (req, res) => res.sendFile(__dirname + '/views/dashboard.html'));

// Start server
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// ensure we don't crash the server on exception
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});

exports = module.exports = app;
