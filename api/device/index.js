const express = require('express');
const router = express.Router();
const {exec} = require('child_process');

// create status route
router.get("/device/status", function(req, res) {
  var deviceName = 'THUNDERDOME';
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({deviceName}));
});

// GET DEVICE LOGS
router.get("/device/logs", function (req, res) {
  exec('tail logs -n 1000', function(err, stdout, stderr) {
    if (err){
      console.log(err);
      return res.status(500).json({"error" : err});
    }
    res.send(stdout);
  });
});

// SHUTDOWN DEVICE
// NOTE, this should not return a successful res since the device will be terminated.
router.post("/device/reboot", function (req, res) {
  exec('sudo reboot', function(err, stdout, stderr) {
    if (err) {
      console.log(err);
      return res.status(500).send({"error" : err});
    }
    res.send(stdout);
  });
});

// GET DEVICE NAME
router.put("/device/name", function(req, res) {
  var name = req.query.name;
  res.send("SUCCESS")
});


// Device Stats
router.get("/device/stats", function (req, res) {
  exec('./scripts/stat.sh', function(err, stdout, stderr) {
    if (err) {
      console.log(err);
      return res.status(500).json({"error" : err});
    }
    res.send(stdout);
  });
});

module.exports = router;
