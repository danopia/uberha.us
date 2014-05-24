var uber = require('..');

var sOcc = new uber.Statement('occupancy', 'vacant');
sOcc.when('vacant', function (inputs) {
  if (inputs.people_awake || inputs.people_home)
    return 'active';
});
sOcc.when('active', function (inputs) {
  if (!inputs.people_home)
    return 'vacant';
  if (!inputs.people_awake)
    return 'inactive';
});
sOcc.when('inactive', function (inputs) {
  if (inputs.people_awake)
    return 'active';
  if (!inputs.people_asleep)
    return 'vacant';
});

var sTime = new uber.Statement('time', 'day');
sTime.when('day', function (inputs) {
  if (inputs.sun_is_set)
    return 'night';
});
sTime.when('night', function (inputs) {
  if (!inputs.sun_is_set)
    return 'day';
});

var sLights = new uber.Statement('lights', 'off');
sLights.when('off', function (inputs) {
  if (inputs.occupancy == 'active' && inputs.time == 'night')
    return 'on';
});
sLights.when('on', function (inputs) {
  if (inputs.occupancy == 'vacant' || inputs.time == 'day')
    return 'off';
});

var node = new uber.Node();
node.start('home', 'stateful', function () {
  sOcc.mapInput(node, 'home.sensors.occupancy', 'people_home');
  sOcc.mapInput(node, 'home.sensors.occupancy', 'people_awake');
  sOcc.mapOutput(node, 'occupancy');

  sTime.mapInput(node, 'outside.nature', 'sun_is_set');
  sTime.mapOutput(node, 'time');

  sLights.mapInput(node, 'home.stateful', 'occupancy');
  sLights.mapInput(node, 'home.stateful', 'time');
  sLights.mapOutput(node, 'state');
});
