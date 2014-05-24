var http = require('http');
var querystring = require('querystring');

exports.baseUrl = 'http://api.openweathermap.org/data/2.5/';

exports.fetch = function (loc, cb) {
  var params = JSON.parse(JSON.stringify(loc));
  params.units = 'metric';
  
  if (params.long) {
    params.lon = params.long;
    delete params.long;
  }
  
  var url = exports.baseUrl + 'weather?' + querystring.stringify(params);
  
  http.get(url, function (res) {
    var buff = '';
    res.on('data', function (chunk) {
      buff += chunk;
    }).setEncoding('utf8');
    
    res.on('end', function () {
      var json = JSON.parse(buff);

      cb && cb(json);
    });
  });
};

