
var fs = require('fs')
  , path = require('path')
  , moment = require('moment')
  , Batch = require('batch')
  , decorate = require('./lib/utils').decorate
  , SimpleProtocol = require('./lib/simple-protocol');

var matcher = /^\d{4}\-\d{2}\-\d{2}\-.*\.md$/;
var postdir = path.join(__dirname, 'posts');

fs.readdir(postdir, function (err, files) {
  if (err) {
    console.error(err.message);
    console.error(err.stack);
    process.exit(1);
  }

  // filter out ".DS_Store" etc
  var posts = files.filter(function (filename) {
    return matcher.test(filename);
  }).reverse();

  var batch = new Batch();
  posts.forEach(function (filename) {
    batch.push(peekMetadata.bind(null, filename));
  });

  batch.end(function(err, data) {
    if (err) throw err;
    var meta = data.map(function (postMetadata) {
      return decorate(postMetadata);
    });
    var obj = {posts: meta};
    process.stdout.write(JSON.stringify(obj, null, 2));
  });
});

/**
 * peek JSON data
 */
function peekMetadata(filename, fn) {
  var done = false;
  var filepath = path.join(postdir, filename);
  var reader = fs.createReadStream(filepath);
  var parser = new SimpleProtocol();
  reader.pipe(parser);
  parser.on('header', function (meta) {
    done = true;
    reader.unpipe(parser);
    meta.filename = filename.replace(/\.md$/, '.html');
    fn(null, meta);
  });

  parser.on('finish', function () {
    if (!done) fn(new Error('stream error'));
  });
}