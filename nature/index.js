var solar = require('./solar');

var node = new (require('./../node'))();
node.start('outside', 'nature', function () {
  node.addProperty('people_home',  'number', 0);
  node.addProperty('people_awake', 'number', 0);

});

		/* Current angular elevation of the sun */
		double now;
		r = systemtime_get_time(&now);
		if (r < 0) {
			fputs(_("Unable to read system time.\n"), stderr);
			method->free(&state);
			exit(EXIT_FAILURE);
		}

		double elevation = solar_elevation(now, lat, lon);
