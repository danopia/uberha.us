var input = require('./input');

var node = new (require('./../node'))();
node.start('home.sensors', 'occupancy', function () {
  node.addProperty('people_home',  'number');
  node.addProperty('people_awake', 'number');

  setInterval(function () {
    node.setProperty('people_home',  2);
    node.setProperty('people_awake', 1);
  }, 2500);
});

input.getStations(function (stations) {
  //console.log(stations);
});
