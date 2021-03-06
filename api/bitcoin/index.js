const express = require('express');
const router = express.Router();
const {exec} = require('child_process');
const bitcoin = require('../../lib/bitcoin');
const OLD_BLOCK_COUNT = 500000

// set up rpc
var client = new bitcoin.Client({
  host: '127.0.0.1',
  port: '8333',
  user: 'lightning',
  pass: 'thunder'
});

// create status route
router.get("/bitcoin/status", function(req, res) {
  client.getInfo(function(err, result) {
    console.log('getInfo result', result);
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
    res.send(result);
  });
});

router.get("/bitcoin/address", function (req, res) {
    client.getAddressesByAccount('', function(err, result) {
      if (err) {
        console.log(err);
        return res.status(500).send("");
      }
      console.log(result);
      res.send(result);
    });
});


router.get("/bitcoin/clean", function (req, res) {
  exec('./scripts/clean_bitcoin.sh', function(err, stdout, stderr) {
    if (err){
      console.log(err);
      return res.status(500).json({"error" : err});
    }
    res.send(stdout);
  });
});

router.get("/bitcoin/enable", function (req, res) {
  exec('./scripts/start_bitcoin.sh', function(err, stdout, stderr) {
    if (err) {
      console.log(err);
      return res.status(500).json({"error": err});
    }
    res.send(stdout);
  });
});

router.get("/bitcoin/disable", function (req, res) {
  exec('./scripts/stop_bitcoin.sh', function(err, stdout, stderr) {
    if (err) {
      console.log('error', err);
      return res.status(500).json({"error" : err});
    }
    res.send(stdout);
  });
});

// create status route
router.get("/bitcoin/logs", function(req, res) {
  exec('tail -f /home/bitcoin/.bitcoin/debug.log -500', function(err, stdout, stderr) {
    if (err) {
      console.log(err);
      return res.status(500).json({"error": err});
    }
    res.send(stdout);
  });
});

module.exports = router;
