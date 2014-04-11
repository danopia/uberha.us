var inputs = {
  sun_is_set: 0,

  people_home: 0,
  people_awake: 0
};

var state = 'vacant';
var engine = require('./states');

function change_input(input, newVal) {
  var oldVal = inputs[input];
  inputs[input] = newVal;
  console.log('[statement] Input', input, 'changed from', oldVal, 'to', newVal);

  var runner = engine[state];
  if (runner) {
    var newState = runner(inputs, input, oldVal) || state;
    if (newState == state) {
      console.log('[statement] State remains unchanged:', state);
    } else {
      console.log('[statement] Changing state to', newState, 'from', state);

      state = newState;
      node.setProperty('state', state);
    }
  } else {
    console.log('[STATEMENT] THE STATE MACHINE IS BROKEN! Lost at', state);
    console.log('[STATEMENT] Committing suicide due to broken state.');
    process.exit(1);
  }
}

var node = new (require('./../lib/node'))();
node.start('home', 'statement', function () {
  node.addProperty('state', 'string', state);

  node.listNodes(function (data) {
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
  });
});
