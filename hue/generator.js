exports.Generator = function (sequence) {
  this.sequence = sequence;
  this.current = 0;
};

exports.Generator.prototype.next = function () {
  var val = this.sequence[this.current];

  if (++this.current >= this.sequence.length) {
    this.current = 0;
  }

  return val;
};
