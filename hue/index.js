var hue = require('node-hue-api'),
    HueApi = hue.HueApi,
    lightState = hue.lightState;
var Generator = require('./generator').Generator;

var node = new (require('./../node'))();
node.start('home.lighting', 'hue', function () {
  var api = new HueApi(node.config.ip, node.config.user);

  var state;

  function setNightlight() {
    api.setGroupLightState(0, lightState.create().brightness(1));
    api.setLightState(1, lightState.create().off());
    api.setLightState(2, lightState.create().on().brightness(1)); // one living light
    api.setLightState(3, lightState.create().off());
    api.setLightState(4, lightState.create().off());
    api.setLightState(5, lightState.create().off());
    api.setLightState(6, lightState.create().on().brightness(1)); // hallway light
  }

  var sleepTimer;

  function stateMachine() {
    if (sleepTimer) {
      clearTimeout(sleepTimer);
      sleepTimer = null;
    }

    switch (state) {

    case 'sleeping':
      console.log('==>', 'Setting night mode');
      sleepTimer = setTimeout(function () {
        api.setGroupLightState(0, lightState.create().alert());

        sleepTimer = setTimeout(function () {
          api.setGroupLightState(0, lightState.create().brightness(25));

          sleepTimer = setTimeout(setNightlight, 2.5*60*1000);
        }, 5*60*1000);
      }, 10*1000);

      api.setGroupLightState(0, lightState.create().brightness(25));
      break;

    case 'active_night':
      console.log('==>', 'Lights to full power');
      api.setGroupLightState(0, lightState.create().on().brightness(85));

      if (new Date().getHours() > 12) {
        api.setLightState(4, lightState.create().brightness(40));
        api.setLightState(5, lightState.create().brightness(40));
        api.setLightState(6, lightState.create().brightness(20));
      }
      break;

    default:
      console.log('==>', 'Turning off lights - unknown state', state);
      api.setGroupLightState(0, lightState.create().off());
    }
  }

  node.listNodes(function (data) {
    var statement = data['home.statement'];

    node.subscribe(statement, 'state', function (newState) {
      console.log('[hue] State changed to', newState);
      state = newState;
      stateMachine();
    });
  });
});


/*
var strobe = false;
var pulse = false;
var dance = null;
var rgb = null;
rl.on('line', function (line) {
  var parts = line.split(' ');
  var cmd = parts.shift();

  if (pulse) {
    if (cmd == 'q') {
      pulse = false;
        api.setGroupLightState(0, lightState.create().brightness(90));
    } else if (cmd == '') {
      api.setGroupLightState(0, lightState.create().brightness(100).transition(0));
      setTimeout(function () {
        api.setGroupLightState(0, lightState.create().brightness(1).transition(0));
      }, 50);
    }
  }
  if (cmd == 'pulse') {
    pulse = true;
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
