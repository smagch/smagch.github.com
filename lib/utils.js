
var moment = require('moment');

exports.decorate = function (data) {
  data.datetime = new Date(data.date).toISOString();
  var d = moment(data.date + '');
  data.month = d.format('MMMM YYYY');
  data.date = d.format('MMM Do YYYY');
  return data;
};
