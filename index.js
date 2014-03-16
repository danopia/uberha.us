/*var spawn = require('child_process').spawn;
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

  console.log(nets);
});*/

require('http').get('http://root:tits@192.168.1.1/Info.live.htm', function (res) {
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

    console.log(props);
  });
}).on('error', function (e) {

});
