var inputs = {
  solar_elev: 0,
  sun_is_set: 0,

  people_home: 0,
  people_awake: 0
};

function change_input(input, newVal) {
  console.log('[statement]', 'Input', input, 'changed to', newVal);

  if (input == 'people_home' && !inputs.people_home && newVal) {
    console.log('Someone got home!');
    node.setProperty('occupied', true);
  } else if (input == 'people_home' && inputs.people_home && !newVal) {
    console.log('Everyone left!');
    node.setProperty('occupied', false);

  } else if (input == 'people_awake' && !inputs.people_awake && newVal) {
    console.log('Someone woke up!');
    node.setProperty('sleep_mode', false);
  } else if (input == 'people_awake' && inputs.people_awake && !newVal && inputs.people_home) {
    console.log('Everyone passed out');
    node.setProperty('sleep_mode', true);

  } else if (input == 'sun_is_set') {
    console.log('Sunset status:', newVal);
    node.setProperty('disable_lights', !newVal);

  }

  inputs[input] = newVal;
}

var node = new (require('./../node'))();
node.start('home', 'statement', function () {
  node.addProperty('occupied', 'number', false);
  node.addProperty('disable_lights', 'number', false);
  node.addProperty('sleep_mode', 'number', false);

  node.listNodes(function (data) {
    var occupancy = data['home.sensors.occupancy'];
    node.subscribe(occupancy, 'people_home', function (peopleHome) {
      change_input('people_home', peopleHome);
    });
    node.subscribe(occupancy, 'people_awake', function (peopleAwake) {
      change_input('people_awake', peopleAwake);
    });

    var nature = data['outside.nature'];
    node.subscribe(nature, 'solar_elev', function (solarElev) {
      change_input('solar_elev', solarElev);
    });
    node.subscribe(nature, 'sun_is_set', function (sunIsSet) {
      change_input('sun_is_set', sunIsSet);
    });
  });
});
