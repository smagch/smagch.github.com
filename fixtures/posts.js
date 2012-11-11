#!/usr/bin/env node

var fs = require('fs')
  , path = require('path')
  , moment = require('moment')
  , argv = require('optimist').argv;

if (!argv.src) {
  throw new Error('src is required');
}

var json = fs.readdirSync(argv.src).map(function (filename) {
  var obj = {};
  var title = path.basename(filename);
  var match = /(\d{4}\-\d{2}\-\d{2})\-(.*)\.md/.exec(title);

  if (!match || !match[1] || !match[2]) {
    throw new Error('invalid filename : ' + filename);
  }

  var d = moment(match[1]);

  return {
    id: path.basename(filename, '.md')
  , title: match[2].replace(/\-/g, ' ')
  , date: match[1]
  , filename: filename
  , month: d.format('MMMM YYYY')
  , datetime: d.format('MMM Do YYYY') 
  };
}).sort(function (a, b) {
  return moment(a.date) < moment(b.date);
});

console.log(JSON.stringify({ posts: json }, null, 2));