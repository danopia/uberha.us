var input = require('./input');

var node = new (require('./../node'))();
node.start('home.sensors', 'occupancy', function () {
  node.addProperty('people_home',  'number', 0);
  node.addProperty('people_awake', 'number', 0);

  var people = [
    {name: 'Daniel', phones: ['F8:A9:D0:0E:E1:31'], laptops: ['28:CF:E9:5A:26:41', '3C:77:E6:90:FB:45']},
    {name: 'Raynes', phones: ['04:F7:E4:14:C6:A4'], laptops: ['28:CF:E9:1E:6B:8D']}
  ];
  var lHome = 0, lAwake = 0;

  var refresh = function () {
    input.getStations(function (stations) {
      var home = 0, awake = 0;

      var macs = stations.map(function (station) {
        return station[0];
      });

      people.forEach(function (person) {
        var state = 0;

        person.phones.forEach(function (mac) {
          if (macs.indexOf(mac) != -1) state = 1;
        });
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

  setInterval(refresh, 2500);
  refresh();
});
