var hue = require('node-hue-api'),
    HueApi = hue.HueApi,
    lightState = hue.lightState;
var Generator = require('./generator').Generator;

var node = new (require('./../lib/node'))();
node.start('home.lighting', 'hue', function () {
  var api = new HueApi(node.config.ip, node.config.user);

  var state;

  function setNightlight() {
    api.setGroupLightState(0, lightState.create().brightness(1));
    api.setLightState(1, lightState.create().off());
    api.setLightState(2, lightState.create().off());
    api.setLightState(3, lightState.create().off());
    api.setLightState(4, lightState.create().off());
    api.setLightState(5, lightState.create().off());
    api.setLightState(6, lightState.create().on().brightness(1)); // hallway
    api.setLightState(7, lightState.create().on().brightness(1)); // coffee table
    api.setLightState(8, lightState.create().on().brightness(1)); // bathroom
    api.setLightState(9, lightState.create().off());
  }

  var sleepTimer;

  function stateMachine() {
    if (sleepTimer) {
      clearTimeout(sleepTimer);
      sleepTimer = null;
    }

    switch (state) {

    case 'night':
      console.log(node.tag, 'Setting night mode');
      sleepTimer = setTimeout(function () {
        api.setGroupLightState(0, lightState.create().alert());

        sleepTimer = setTimeout(function () {
          api.setGroupLightState(0, lightState.create().brightness(25));

          sleepTimer = setTimeout(setNightlight, 2.5*60*1000);
        }, 5*60*1000);
      }, 10*1000);

      api.setGroupLightState(0, lightState.create().brightness(25));
      break;

    case 'on':
      console.log(node.tag, 'Lights to full power');
      api.setGroupLightState(0, lightState.create().on().brightness(85));

      if (new Date().getHours() > 12) {
        api.setLightState(4, lightState.create().brightness(40));
        api.setLightState(5, lightState.create().brightness(40));
        api.setLightState(6, lightState.create().brightness(20));
      }
      break;

    case 'off':
      console.log(node.tag, 'Turning off lights');
      api.setGroupLightState(0, lightState.create().off());
      api.setLightState(7, lightState.create().on().brightness(1)); // coffee table
      break

    default:
      console.log(node.tag, 'Turning off lights - unknown state', state);
      api.setGroupLightState(0, lightState.create().off());
    }
  }

  node.listNodes(function (data) {
    var statement = data['home.stateful'];

    node.subscribe(statement, 'state', function (newState) {
      console.log(node.tag, 'State changed to', newState);
      state = newState;
      stateMachine();
    });
  });
});

