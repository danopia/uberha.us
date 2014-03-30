var input = require('./input');
var Node = require('./../node');

var node = new Node();
node.start('home.sensors', 'occupancy');

input.getStations(function (stations) {
  //console.log(stations);
});
