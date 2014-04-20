exports.stater = function (name, initial) {
  this.name   = name;
  this.state  = initial;

  this.tag    = '[statement/' + name + ']';
  this.inputs = {};
  this.engine = {};
};

// mech.when('state', function (inputs[, input[, oldVal]]) { ... });
exports.stater.prototype.when = function (state, handler) {
  this.engine[state] = handler;
};

// mech.mapOutput(node, 'state');
exports.stater.prototype.mapOutput = function (node, output) {
  node.addProperty(output || 'state', 'string', this.state);

  this.node = node;
  this.output = output;
};

// mech.mapInput(node, 'home.sensors.occupancy', 'danopia')
exports.stater.prototype.mapInput = function (node, address, input) {
  var other = node.nodes[address];

  if (!other)
    return console.log(node.tag, 'No node at address', address, '- not adding input', input);

  var self = this;
  node.subscribe(other, input, function (val) {
    self.input(val, input);
  });
};

// private
exports.stater.prototype.setState = function (newState) {
  console.log(this.tag, 'Changing state to', newState, 'from', this.state);
  this.state = newState;

  if (this.node) {
    this.node.setProperty(this.output, newState);
  } else {
    console.log(this.tag, 'Tossing away state change, not mapped anywhere');
  }
};

// private
exports.stater.prototype.input = function (newVal, input) {
  var oldVal = this.inputs[input];
  this.inputs[input] = newVal;

  if (!this.output) return;
  console.log(this.tag, 'Input', input, 'changed to', newVal, 'from', oldVal);

  var runner = this.engine[this.state];
  if (runner) {
    var newState = runner(this.inputs, input, oldVal) || this.state;

    if (newState == this.state) {
      console.log(this.tag, 'State remains', this.state);

    } else {
      this.setState(newState);
    }

  } else {
    console.log(this.tag, 'THE STATE MACHINE IS BROKEN! Lost at', this.state);
    console.log(this.tag, 'Committing suicide due to broken state.');
    process.exit(1);
  }
};
