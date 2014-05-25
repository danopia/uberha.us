var solar = require('./solar');
var weather = require('./weather');

function getElev() {
  var ms = Math.round((+new Date()) / 1000);
  return solar.solar_elevation(ms, node.config.lat, node.config.long);
}

var node = new (require('./../lib/node'))();
node.start('outside', 'nature', function () {

  // solar
  var elev = Math.round(getElev() * 10) / 10;
  node.addProperty('solar_elev', 'number', elev);
  node.addProperty('sun_is_set', 'number', elev < 6);

  setInterval(function () {
    elev = Math.round(getElev() * 10) / 10;
    node.setProperty('solar_elev', elev);
    node.setProperty('sun_is_set', elev < 6);

    console.log(node.tag, 'Setting solar elevation to', elev);
  }, 2.5 * 60 * 1000);

  // weather
  node.addProperty('weather',  'string');
  node.addProperty('temp',     'number');
  node.addProperty('humidity', 'number');
  node.addProperty('clouds',   'number');
  node.addProperty('wind',     'number');

  var upWeather = function () {
    weather.fetch(node.config, function (json) {
      node.setProperty('weather',  json.weather[0].main);
      node.setProperty('temp',     json.main.temp);
      node.setProperty('humidity', json.main.humidity);
      node.setProperty('clouds',   json.clouds.all / 100);
      node.setProperty('wind',     json.wind.speed);

      console.log(node.tag, 'Weather information updated');
    });
  };

  setInterval(upWeather, 10 * 60 * 1000);
  upWeather();
});
