var toml = require('toml');
var fs = require('fs');

var raw = fs.readFileSync('config.toml');
module.exports = toml.parse(raw);
