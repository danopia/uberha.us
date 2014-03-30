var input = require('./input');
var Node = require('./../node');

var node = new Node();
node.start('home.sensors', 'occupancy', function () {
  node.addProperty('people_home', 'number');
  node.addProperty('people_awake', 'number');
});

input.getStations(function (stations) {
  //console.log(stations);
});
