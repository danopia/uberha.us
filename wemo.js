var wemo = require('wemo');
var node = new (require('./lib/node'))();
node.start('home', 'outlets', function () {

  var client = wemo.Search();
  var switches =  {} ;
  var states   = {  };
  var waiting  =  {} ;
  console.log(node.tag, 'Looking for wemos...');
  client.on('found', function (device) {
    var name = device.friendlyName;
    
    console.log(node.tag, 'Found', name, 'at', device.ip);
    switches[name] = new wemo(device.ip, device.port);
    states[name] = (device.binaryState == '1');
    
    if (waiting[name]) {
      console.log(node.tag, 'Setting queued state to', name);
      setState(name, waiting[name] > 1);
      delete waiting[name];
    }
  });

  var setState = function (name, state) {
    if (state == states[name]) {
      console.log(node.tag, 'Dropping same state for', name, '-', state);
      
    } else if (switches[name]) {
      console.log(node.tag, 'Setting', name, 'state to', state);
      switches[name].setBinaryState(state ? 1 : 0, function (err, val) {
      });
        console.log(node.tag, 'State set');
      states[name] = state;
      
    } else {
      console.log(node.tag, 'Queueing setting', name, 'to', state);
      waiting[name] = state ? 2 : 1;
    }
  };
  
  node.subscribe(node.nodes['home.media.chromecast'], 'is_video', function (value) {
    if (value === undefined) return;
    
    setState('Projector', value);
  });
});

