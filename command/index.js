var hue = require("node-hue-api"),
    HueApi = hue.HueApi,
    lightState = hue.lightState;

var ip = '192.168.1.148';
var user = 'c0ff1603d31754f4587db05ca753f'; // worthless outside of the lan
var hue = new HueApi(ip, user);

/*
  if (cmd == 'on') {
    if (parts.length) {
      api.setLightState(parts[0], lightState.create().on().brightness(95));
    } else {
      api.setGroupLightState(0, lightState.create().on().brightness(95));
    }
  }
  if (cmd == 'off') {
    if (parts.length) {
      api.setLightState(parts[0], lightState.create().off());
    } else {
      api.setGroupLightState(0, lightState.create().off());
    }
  }

  if (cmd == 'b') {
    if (parts.length > 1) {
      api.setLightState(parts[1], lightState.create().brightness(+parts[0]));
    } else {
      api.setGroupLightState(0, lightState.create().brightness(+parts[0]));
    }
  }

  if (cmd == 'link') {
    console.log(api.pressLinkButton());
  }

  if (cmd == 'alert') {
    api.setGroupLightState(0, lightState.create().alert());
  }
  if (cmd == 'ALERT') {
    api.setGroupLightState(0, lightState.create().alert(true)); // 10 times
  }

  if (cmd == 'colorloop') {
    var state1 = lightState.create().on().hsl(0,   100, 95).effect('none');
    var state2 = lightState.create().on().hsl(120, 100, 95).effect('none');
    var state3 = lightState.create().on().hsl(240, 100, 95).effect('none');
    api.setLightState(1, state1).done();
    api.setLightState(2, state2).done();
    api.setLightState(3, state3).done();
    api.setLightState(4, state1).done();
    api.setLightState(5, state2).done();
    api.setLightState(6, state3).done();

    setTimeout(function () {
      api.setGroupLightState(0, lightState.create().effect('colorloop'));
    }, 10);
  }

  if (dance) {
    clearInterval(dance);
    dance = null;
  }
  if (cmd == 'dance') {
    dance = setInterval(function () {
      for (var l = 1; l <= 6; l++) {
        api.setLightState(l, lightState.create().on().transition(0).hsl(Math.round(Math.random() * 360), 100, 95).effect('none'));
      }
    }, 800);
  }

  if (rgb) {
    clearInterval(rgb);
    rgb = null;
  }
  if (cmd == 'rgb') {
    var delay = +parts[0] || 100;

    var lightGen = new Generator([1, 2, 3, 4, 5, 6, 4]);
    var hueGen   = new Generator([0, 130, 250]);
    rgb = setInterval(function () {
      var light = lightGen.next();
      var hue = hueGen.next();

      console.log('Light', light, 'to', hue);
      api.setLightState(light, lightState.create().hsl(hue, 100, 95));
    }, delay);
  }

  if (cmd == 'random') {
    for (var l = 1; l <= 3; l++) {
      api.setLightState(l, lightState.create().hsl(Math.round(Math.random() * 360), 100, 95).transition(0));
    }
  }

  if (dance) {
    dance = null;
  }
  if (cmd == 'dance') {
    dance = setInterval(function () {
      for (var l = 1; l <= 3; l++) {
        api.setLightState(l, lightState.create().on().transition(0).hsl(Math.round(Math.random() * 360), 100, 95).effect('none'));
      }
    }, 500);
  }

  rl.prompt();
});

/*
var displayBridges = function(bridge) {
  var bridge = bridge[0];

  var huee = new hue.HueApi();

  var displayUserResult = function(result) {
      console.log("Created user: " + JSON.stringify(result));
  };

  var displayError = function(err) {
      console.log(err);
  };

  huee.registerUser(bridge.ipaddress, null, 'node shenanigans')
    .then(displayUserResult)
    .fail(displayError)
    .done();
};

hue.locateBridges().then(displayBridges).done();
*/








var spawn = require('child_process').spawn;

var sox = spawn('sox', ['-d', '-c', '1', '-b', '16', '-r', '16k', '-t', 'raw', '-']);
var lastpeak;
var peak;
var highest;
var peaks = [];
var cooloff = 0;
var hot = true;
var recording = false;
sox.stdout.on('data', function (chunk) {
  if (chunk.length != 8192)
    console.log(chunk.length);

  if (!hot) return;
  for (var i = 0; i < chunk.length; i += 4) {
    var samp = chunk.readInt16LE(i);

    if (cooloff) {
      cooloff--;

      if (!cooloff) {
        console.log('cooled off');
      }
    } else if (samp > 2000) {
      console.log(samp, lastpeak, peak, highest);
      if (!lastpeak) {
        lastpeak = 1;
        peak = 0;
        highest = samp;
      } else if (peak == 1 || peak == 3) {
        peaks.push(lastpeak);
        peak++;
        lastpeak = 1;
        console.log('lastpeaka', lastpeak);
      } else {
        highest = Math.max(highest, samp);
      }
    } else if (samp < -2000 && lastpeak) {
      if (peak == 0 || peak == 2 || peak == 4) {
        peaks.push(lastpeak);
        peak++;
        lastpeak = 1;
        console.log('lastpeakb', lastpeak);
      } else {
        highest = Math.max(highest, -samp);
      }
    } else if (lastpeak > 5) {
      console.log('timed out');
      console.log(lastpeak, peak, highest, peaks);
      trigger(peaks, highest);
      lastpeak = false;
      peaks = [];

      cooloff = 5000;
    } else if (lastpeak) {
      lastpeak++;
    }
  }
});

sox.stderr.on('data', function (d) {
  console.log(d);
}).setEncoding('utf8');

function trigger(peaks, highest) {
  if (peaks.length < 2) return;
  if (peaks[0] == 0 || peaks[0] > 2) return;
  if (peaks[1] == 0 || peaks[1] > 2) return;
  if (peaks[2] && (peaks[2] == 0 || peaks[2] > 2)) return;

  hot = false;
  var chirp = require('child_process').spawn('sox', ['command/trigger.wav', '-d']);
  chirp.on('close', function () {
    var sox = require('child_process').spawn('sox', ['-d', '-b', '16', 'cmd.wav']);
    recording = true;

    setTimeout(function () {
      recording = false;
      console.log('RECORDING TIMED OUT');
      sox.kill();
      upload('cmd.wav');
    }, 2500);
  });
};

function upload(filename) {

  var https = require('https');

  var options = {
    host: 'api.wit.ai',
    path: '/speech',
    method: 'POST',

    headers: {
      'Authorization': 'Bearer 6ZYQKRV4AQPHKU35XRCHDURTHAPLZR6W',
      'Content-type': 'audio/wav'
    }
  };

  var req = https.request(options, function(res) {
    var response = '';
    console.log(res.statusCode);

    res.on('data', function (chunk) {
      response += chunk;
    });

    res.on('end', function () {
      if (response[0] == 'S' && response.indexOf('failed')) {
        var chirp = require('child_process').spawn('sox', ['command/cmd_fail.wav', '-d']);
        chirp.on('close', function () {
          hot = true;
        });
        
      } else {
        var chirp = require('child_process').spawn('sox', ['command/cmd_ok.wav', '-d']);
        chirp.on('close', function () {
          hot = true;
        });

        handleObj(JSON.parse(response));
      }
    });
  });

  req.on('error', function(e) {
      console.log(e);
  });

  req.write(require('fs').readFileSync(filename));
  req.end();
}

function handleObj(data) {
  console.log('>>', data.msg_body);
  console.log('=>', data.outcome.intent, data.outcome.entities, data.outcome.confidence);

  if (data.outcome.confidence < 0.35) return false;

  var ents = data.outcome.entities;
  switch (data.outcome.intent) {

  case 'switch_lights':
    if (ents.on_off.value == 'off')
      hue.setGroupLightState(0, lightState.create().off());
    else
      hue.setGroupLightState(0, lightState.create().on());
    break;

  case 'set_brightness':
    hue.setGroupLightState(0, lightState.create().on().brightness(ents.brightness.value));
    break;

  default:
    console.log('unknown intent!');
  }
}
