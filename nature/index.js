var solar = require('./solar');

function getElev() {
  var ms = Math.round((+new Date()) / 1000);
  return solar.solar_elevation(ms, node.config.lat, node.config.long);
}

var node = new (require('./../lib/node'))();
node.start('outside', 'nature', function () {

  var elev = getElev();
  node.addProperty('solar_elev', 'number', elev);
  node.addProperty('sun_is_set', 'number', elev < 6);

  setInterval(function () {
    elev = getElev();
    node.setProperty('solar_elev', elev);
    node.setProperty('sun_is_set', elev < 6);
    console.log(elev);
  }, 60 * 1000);
});
