var hue = require("node-hue-api"),
    HueApi = hue.HueApi,
    lightState = hue.lightState;

var ip = '192.168.1.148';
var user = '173b7ba927ae37972420dced2e2f10bb'; // worthless outside of the lan
var api = new HueApi(ip, user);

var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.setPrompt('hue> ');
rl.prompt();

var strobe = false;
var dance = null;
rl.on('line', function (line) {
  var parts = line.split(' ');
  var cmd = parts.shift();

  if (strobe) {
    if (cmd == 'q') {
      strobe = false;
        api.setGroupLightState(0, lightState.create().brightness(90));
    } else if (cmd == '') {
      api.setGroupLightState(0, lightState.create().brightness(100).transition(0));
      setTimeout(function () {
        api.setGroupLightState(0, lightState.create().brightness(1).transition(0));
      }, 50);
    }
  }
  if (cmd == 'strobe') {
    strobe = true;
    api.setGroupLightState(0, lightState.create().brightness(1).on());
  }

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
      for (var l = 1; l <= 3; l++) {
        api.setLightState(l, lightState.create().on().transition(0).hsl(Math.round(Math.random() * 360), 100, 95).effect('none'));
      }
    }, 500);
  }

  if (cmd == 'random') {
    for (var l = 1; l <= 3; l++) {
      api.setLightState(l, lightState.create().on().hsl(Math.round(Math.random() * 360), 100, 95).effect('none'));
    }
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
