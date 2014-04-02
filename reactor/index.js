var http = require('http');
var crypto = require('crypto');
var fork = require('child_process').fork;

var config = require('./../config');

console.log('\n' + new Array(81).join('-'));

var nodes = {};

var endpoints = {};
endpoints['POST /node'] = function (req, res) {
  var node = {
    namespace: req.namespace,
    name: req.name,
    address: req.namespace + '.' + req.name,
    http: req.http,
    url: 'http://' + req.http.hostname + ':' + (req.http.port || 80) + '/',
    token: crypto.pseudoRandomBytes(15).toString('base64')
  };
  nodes[node.address] = node;

  console.log('[reactor]', 'Registered new', node.namespace, 'node at', node.url, '-', node.address);

  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(node));
  res.end();
};

endpoints['GET /nodes'] = function (req, res) {
  console.log('[reactor]', 'Listing', Object.keys(nodes).length, 'nodes');

  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(nodes));
  res.end();
};

var server = http.createServer(function (req, res) {
  console.log('[reactor]', req.connection.remoteAddress, req.method, req.url);

  var endpoint = endpoints[req.method + ' ' + req.url];
  if (!endpoint) {
    res.writeHead(404);
    return res.end();
  }

  if (req.method == 'GET' || req.method == 'HEAD') {
    endpoint(null, res);
  } else {
    var buffer = '';
    req.on('data', function (chunk) {
      buffer += chunk;
    }).setEncoding('utf8');

    req.on('end', function () {
      var json = buffer.length ? JSON.parse(buffer) : null;
      endpoint(json, res);
    });
  }
});

server.listen(config.reactor.port, function (err) {
  var toStart = config.reactor.nodes;
  var argv = ['' + config.reactor.port];

  var timer = setInterval(function () {
    fork(toStart.shift(), argv);

    if (!toStart.length)
      clearInterval(timer);
  }, 50);
});
