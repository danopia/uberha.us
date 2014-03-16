var spawn = require('child_process').spawn;
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
});
