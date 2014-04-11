var input = require('./input');

var node = new (require('./../lib/node'))();
node.start('home.sensors', 'occupancy', function () {
  node.addProperty('people_home',  'number', 0);
  node.addProperty('people_awake', 'number', 0);

  var people = require('./../lib/config').users;
  var lHome = 0, lAwake = 0;

  var refresh = function () {
    input.getStations(function (stations) {
      var home = 0, awake = 0;

      var macs = stations.map(function (station) {
        return station[0];
      });

      people.forEach(function (person) {
        var state = 0;

        if (macs.indexOf(person.phone) != -1) state = 1;

        person.laptops.forEach(function (mac) {
          if (macs.indexOf(mac) != -1) state = 2;
        });

        if (state > 0) home++;
        if (state > 1) awake++;
      });

      if (home != lHome)
        node.setProperty('people_home',  home);
      if (awake != lAwake)
        node.setProperty('people_awake', awake);

      lHome = home;
      lAwake = awake;
    });
  };

  setInterval(refresh, node.config.update_interval);
  refresh();
});
