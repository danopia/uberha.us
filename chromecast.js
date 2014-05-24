var nodecastor = require('nodecastor');
var node = new (require('./lib/node'))();
node.start('home.media', 'chromecast', function () {
  node.addProperty('app_id',   'string');
  node.addProperty('is_idle',  'number');
  node.addProperty('is_video', 'number');

  var device;

  // Discovery
  nodecastor.scan().on('online', function(d) {
    d.on('connect', function() {
      console.log(node.tag, 'Discovered', d.friendlyName);
      device = d;
    });
  }).on('offline', function(d) {
    console.log(node.tag, 'Lost touch of', d.friendlyName);

    if (device.friendlyName == d.friendlyName)
      device = null;
  }).start();

  // Querying
  var getApp = function (cb) {
    if (!device) return cb(null);

    device.status(function(err, s) {
      if (err) return cb(null);

      if (!s.applications.length) return cb(null);
      cb(s.applications[0].appId);
    });
  };

  var idleScreen = '00000000-0000-0000-0000-000000000000';
  var musicApps = [
    'GoogleMusic', // google play music
    'Pandora_App', // pandora
    'E31BF116',    // rdio
    'Songza_App',  // songza
  ];

  var seen = musicApps.join(',').split(',');
  seen.push(idleScreen);

  var update = function () {
    getApp(function (appId) {
      if (appId == null) return; // no data. not connected?

      var isIdle = (appId == idleScreen);
      var isVideo = !isIdle && (musicApps.indexOf(appId) === -1);

      if (seen.indexOf(appId) === -1) {
        seen.push(appId);
        console.log(this.tag, 'Unknown app', appId, 'active, assuming video');
      }

      node.setProperty('app_id',   appId);
      node.setProperty('is_idle',  isIdle);
      node.setProperty('is_video', isVideo);
    });
  };

  setInterval(update, 1000);
  update();
});
