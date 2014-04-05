exports.vacant = function (inputs) {
  if (inputs.people_awake)
    return inputs.sun_is_set ? 'active_night' : 'active_day';
  if (inputs.people_home)
    return inputs.sun_is_set ? 'sleeping' : 'active_day';
};

exports.active_night = function (inputs) {
  if (!inputs.people_home)
    return 'vacant';
  if (!inputs.people_awake)
    return 'sleeping';
};

exports.active_day = function (inputs) {
  if (inputs.sun_is_set)
    return 'active_night';
  if (!inputs.people_home)
    return 'sleeping';
};

exports.sleeping = function (inputs) {
  if (inputs.people_awake)
    return 'active_night';
  if (!inputs.sun_is_set)
    return 'morning';
  if (!inputs.people_asleep)
    return 'vacant';
};

exports.morning = function (inputs) {
  if (inputs.people_awake)
    return 'active_day';
  if (!inputs.people_home)
    return 'vacant';
  if (inputs.sun_is_set)
    return 'sleeping';
}
