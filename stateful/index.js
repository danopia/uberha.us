var uber = require('.');

var occMech = new uber.Statement('occupancy', 'vacant');

occMech.when('vacant', function (inputs) {
  if (inputs.people_awake)
    return inputs.sun_is_set ? 'active_night' : 'active_day';
  if (inputs.people_home)
    return (inputs.sun_is_set && new Date().getHours() < 12) ? 'sleeping' : 'active_day';
});

occMech.when('active_night', function (inputs) {
  if (!inputs.people_home)
    return 'vacant';
  if (!inputs.people_awake)
    return 'sleeping';
});

occMech.when('active_day', function (inputs) {
  if (inputs.sun_is_set)
    return 'active_night';
  if (!inputs.people_home)
    return 'vacant';
});

occMech.when('sleeping', function (inputs) {
  if (inputs.people_awake)
    return 'active_night';
  if (!inputs.sun_is_set)
    return 'morning';
  if (!inputs.people_asleep)
    return 'vacant';
});

occMech.when('morning', function (inputs) {
  if (inputs.people_awake)
    return 'active_day';
  if (!inputs.people_home)
    return 'vacant';
  if (inputs.sun_is_set)
    return 'sleeping';
});

var node = new uber.Node();
node.start('home', 'stateful', function () {
  occMech.mapInput(node, 'home.sensors.occupancy', 'people_home');
  occMech.mapInput(node, 'home.sensors.occupancy', 'people_awake');
  occMech.mapInput(node, 'outside.nature', 'sun_is_set');
  occMech.mapOutput(node, 'state');

/*  node.listNodes(function (data) {
    var occupancy = data['home.sensors.occupancy'];
    node.subscribe(occupancy, 'people_home', function (peopleHome) {
      change_input('people_home', peopleHome);
    });
    node.subscribe(occupancy, 'people_awake', function (peopleAwake) {
      change_input('people_awake', peopleAwake);
    });

    var nature = data['outside.nature'];
    node.subscribe(nature, 'sun_is_set', function (sunIsSet) {
      change_input('sun_is_set', sunIsSet);
    });
  });*/
});
