const express = require('express');
const app = express();

//after initializing the app, include all exposed api
require("./api")

//set static files
app.use(express.static('public'));

// set up root get
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/dashboard.html');
});

// listen for requests
var listener = app.listen(8080, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

// ensure we don't crash the server on exception
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});

// export express so that any files we include can add a route
module.exports = app
