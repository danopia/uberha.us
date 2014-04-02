var spawn = require('child_process').spawn;
var http = require('http');
var util = require('util');

var config = require('./../config');
var ddwrt = config.node.occupancy.ddwrt;
var routerUrl = util.format('http://%s:%s@%s/Info.live.htm', ddwrt.user, ddwrt.pass, ddwrt.ip);

exports.scanWifi = function (cb) {
  var proc = spawn('/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport', ['en1', 'scan']);

  var output = '';
  proc.stdout.on('data', function (data) {
    output += data;
  }).setEncoding('utf8');

  proc.on('close', function () {
    var lines = output.split('\n  ');
    lines.pop();
    lines.shift();
    var nets = lines.map(function (line) {
      return line.match(/ +(.+) ([0-9a-f:]+) ([\-0-9]+) +([0-9,+\-]+) +([YN]) +([A-Z0-9\-]+) (.+?) *$/).slice(1,8);
    });

    cb(nets);
  });
};

exports.getDDWRTstate = function (cb) {
  http.get(routerUrl, function (res) {
    if (res.statusCode != 200) {
      console.log('Router returned code', res.statusCode);
      return;
    }

    var raw = '';
    res.on('data', function (chunk) {
      raw += chunk;
    }).setEncoding('utf8');
    res.on('end', function () {
      var props = {};
      raw.replace(/\n$/, '').split('\n').forEach(function (line) {
        var match = line.match(/\{([a-z_]+)::(.*)\}/);

        if (match[2][0] == "'") {
          props[match[1]] = match[2].substr(1, match[2].length - 2).split("','");
        } else {
          props[match[1]] = match[2];
        }
      });
      cb(props);
    });
  }).on('error', function (e) {
    cb(null);
  });
};

exports.getStations = function (cb) {
  exports.getDDWRTstate(function (props) {
    if (!props) {
      return cb(null);
    };

    var aw = [];
    while (props.active_wireless.length) {
      aw.push(props.active_wireless.splice(0, 9));
    }
    cb(aw);
  })
};

exports.getMyMac = function (cb) {
  var proc = spawn('ifconfig', ['en1']);

  var output = '';
  proc.stdout.on('data', function (data) {
    output += data;
  }).setEncoding('utf8');

  proc.on('close', function () {
    cb(output.match(/ether ([0-9a-f:]+)/)[1]);
  });
};
