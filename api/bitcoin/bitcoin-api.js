const {exec} = require('child_process');
var app = require('./index.js');

var OLD_BLOCK_COUNT = 500000

// set up rpc
var bitcoin = require.main.require('./lib/bitcoin');
var client = new bitcoin.Client({
  host: '0.0.0.0',
  port: '8333',
  user: 'lightning',
  pass: 'thunder'
});

// create status route
app.get("/bitcoin/status", function(req, res) {
  client.getInfo(function(err, result) {
    if(err && err.code == -28) {
      return res.status('200').json({"status": "Reindexing Chain"});
    }
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }

    if(result["blocks"] != null && result["blocks"] <  OLD_BLOCK_COUNT) {
      result["status"] = "Revalidating Chain: " + parseInt((result["blocks"] * 100)  / (OLD_BLOCK_COUNT )) + "%"
    }
    res.send(result);
  });
});

app.get("/bitcoin/address", function (req, res) {
    client.getAddressesByAccount('', function(err, result) {
      if (err) {
        console.log(err);
        return res.status(500).send("");
      }
      console.log(result);
      res.send(result);
    });
});


app.get("/bitcoin/clean", function (req, res) {
  exec('./scripts/clean_bitcoin.sh', function(err, stdout, stderr) {
    if (err){
      console.log(err);
      return res.status(500).json({"error" : err});
    }
    res.send(stdout);
  });
});

app.get("/bitcoin/enable", function (req, res) {
  exec('./scripts/start_bitcoin.sh', function(err, stdout, stderr) {
    if (err) {
      console.log(err);
      return res.status(500).json({"error": err});
    }
    res.send(stdout);
  });
});

app.get("/bitcoin/disable", function (req, res) {
  exec('./scripts/stop_bitcoin.sh', function(err, stdout, stderr) {
    if (err) {
      console.log('error', err);
      return res.status(500).json({"error" : err});
    }
    res.send(stdout);
  });
});

// create status route
app.get("/bitcoin/logs", function(req, res) {
  exec('tail -f /home/bitcoin/.bitcoin/debug.log -500', function(err, stdout, stderr) {
    if (err) {
      console.log(err);
      return res.status(500).json({"error": err});
    }
    res.send(stdout);
  });
});
