var http = require('http');

module.exports = function () {
  this.serverHost =  process.argv[3] || 'localhost';
  this.serverPort = +process.argv[2] || 80;

  this.properties = {};
  this.endpoints  = {};

  var self = this;
  this.httpd = http.createServer(function (req, res) {
    console.log(self.tag, req.connection.remoteAddress, req.method, req.url);

    var endpoint = self.endpoints[req.method + ' ' + req.url];
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
};

module.exports.prototype.start = function (namespace, name, cb) {
  this.port = 8000 + Math.round(Math.random() * 1000);
  this.tag = '[' + name + ']';
  this.config = require('./config').node[name];

  var self = this;
  this.httpd.listen(this.port, function (err) {
    self.sendPost('/node', {
      namespace: namespace,
      name: name,
      http: {hostname: 'localhost', port: self.port}
    }, function (data) {
      console.log(self.tag, 'Server acknowledged registration');

      self.info = data;
      self.listNodes(function (data) {
        self.nodes = data;
        cb && cb();
      });
    });
  });
}

module.exports.prototype.listNodes = function (cb) {
  this.sendGet('/nodes', function (data) { cb(data); });
};

module.exports.prototype.subscribe = function (remote, property, cb) {
  var self = this;

  this.sendPostTo(remote.http.hostname, remote.http.port,
    '/node/' + remote.address + '/' + property + '/hook',
    { token: this.info.token, http: this.info.http },
    function (res) {
      console.log(self.tag, 'Subscribed to', property, 'on', remote.address);
      cb(res.value);
    });

  var hookpoint = 'POST /node/' + remote.address + '/' + property;
  this.endpoints[hookpoint] = function (req, res) {
    cb(req.value);

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end();
  };
};

module.exports.prototype.addProperty = function (property, type, value) {
  var prop = this.properties[property] = {
    name: property,
    type: type,
    listeners: [],
    value: value
  };

  var hookpoint = 'POST /node/' + this.info.address + '/' + property + '/hook';
  this.endpoints[hookpoint] = function (req, res) {
    prop.listeners.push(req);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ value: prop.value, type: prop.type }));
  };
};

module.exports.prototype.setProperty = function (property, value) {
  var prop = this.properties[property];
  var old = prop.value;
  prop.value = value;

  if (old == value) return false; // only push out if it was changed

  var self = this;
  prop.listeners.forEach(function (listener) {
    self.sendPostTo(listener.http.hostname, listener.http.port,
      '/node/' + self.info.address + '/' + prop.name,
      { token: listener.token, type: prop.type, value: prop.value })
  });
};

//////////////////////////
// generic HTTP helpers

module.exports.prototype.sendPost = function (path, json, cb) {
  this.sendPostTo(this.serverHost, this.serverPort, path, json, cb);
};

module.exports.prototype.sendPostTo = function (host, port, path, json, cb) {
  var opts = { hostname: host, port: port, method: 'POST', path: path };
  var req = http.request(opts, function (res) {
    var buffer = '';
    res.on('data', function (chunk) {
      buffer += chunk;
    }).setEncoding('utf8');

    res.on('end', function () {
      var json = buffer.length ? JSON.parse(buffer) : null;
      cb && cb(json);
    });
  });

  req.write(JSON.stringify(json));
  req.end();
};

module.exports.prototype.sendGet = function (path, cb) {
  this.sendGetTo(this.serverHost, this.serverPort, path, cb);
};

module.exports.prototype.sendGetTo = function (host, port, path, cb) {
  var opts = { hostname: host, port: port, method: 'GET', path: path };
  var req = http.get(opts, function (res) {
    var buffer = '';
    res.on('data', function (chunk) {
      buffer += chunk;
    }).setEncoding('utf8');

    res.on('end', function () {
      var json = buffer.length ? JSON.parse(buffer) : null;
      cb && cb(json);
    })
  });
};
