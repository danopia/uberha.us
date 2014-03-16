var hue = require("node-hue-api"),
    HueApi = hue.HueApi,
    lightState = hue.lightState;

var ip = '192.168.1.148';
var user = '173b7ba927ae37972420dced2e2f10bb';
var api = new HueApi(ip, user);

api.lights(function(err, config) {
    if (err) throw err;
    console.log(config['lights'][0]);
});

state1 = lightState.create().on().hsl(0,   100, 95).effect('colorloop');
state2 = lightState.create().on().hsl(120, 100, 95).effect('colorloop');
state3 = lightState.create().on().hsl(240, 100, 95).effect('colorloop');

api.setLightState('1', state1).done();
api.setLightState('2', state2).done();
api.setLightState('3', state3).done();

/*setInterval(function () {
  api.setGroupLightState('0', state2);
  setTimeout(function () {
      api.setGroupLightState('0', state1);
  }, 500);
//}, 1000);*/

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

// --------------------------
// Using a promise
hue.locateBridges().then(displayBridges).done();
*/
