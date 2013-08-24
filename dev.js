
/**
 * Simple command-line which takes Simple Protocol document from stdin
 * And then 
 */
var fs = require('fs')
  , net = require('net')
  , marked = require('marked')
  , pygmentize = require('pygmentize-bundled')
  , jade = require('jade')
  , path = require('path')
  , SimpleProtocol = require('./lib/simple-protocol')
  , AsyncCache = require('async-cache');

var TEMPLATE_PATH = path.join(__dirname, 'templates');
var DEFAULT_TEMPLATE_NAME = 'post.jade';
var PORT = 3001;

/**
 * templates
 */
var templates = new AsyncCache({
  load: function (filename, fn) {
    var filepath = path.join(TEMPLATE_PATH, filename);
    function compile(data) {
      var options = { filename: filepath };
      return jade.compile(data.toString(), options);
    }

    fs.readFile(filepath, function (err, data) {
      if (err) return fn(err);
      fn(null, compile(data));
      console.log('compiled %s', filepath);
    });

    // watch file and reset template
    fs.watch(filepath, function () {
      console.log('re-compiling %s', filepath);
      templates.del(filename);
    });
  }
});

/**
 * pre-compile default template
 */
templates.get(DEFAULT_TEMPLATE_NAME, function (err, template) {
  if (err) throw err;
});

/**
 * enable hightlighting by highlight.js
 */
var markedOptions = {
  gfm: true
, pedantic: false
, sanitize: false
, highlight: function (code, lang, done) {
    if (!lang) return done(null, code);
    pygmentize({ lang: 'js', format: 'html', options: { nowrap: true }}, code, function (err, result) {
      if (err) return done(err);
      done(null, result.toString());
    });
  }
};

/**
 * tcp server which takes JSON-prepended markdown
 * and render blog with html format with jade template
 */
var server = net.createServer(function(socket) {
  var parser = new SimpleProtocol()
    , buffer = ''
    , meta = null
    , template
    , tick = 2;

  socket.pipe(parser);

  // get meta data which is pre-pended JSON
  parser.on('header', function (head) {
    console.log('got head');
    meta = head;
    if (meta.invalidate) {
      console.log('invalidate');
      templates.reset();
      socket.unpipe(parser);
      socket.end();
      return;
    }

    // get jade template
    var templateName = meta.template || DEFAULT_TEMPLATE_NAME;
    console.dir(meta);
    templates.get(templateName, function (err, _template) {
      if (err) throw err;
      console.log('got template %s', templateName);
      template = _template;
      --tick || write();
    });
  });

  parser.on('readable', function() {
    console.log('readable');
    --tick || write();
  });

  // when it has remaining buffer
  // when read stream finished
  parser.on('finish', function() {
    console.log('connction closed');
    if (buffer !== '') {
      throw new Error('stream error');
      process.exit(1);
    }
  });

  // write socket
  // when parser is readable && template is available
  function write() {
    var chunk;
    while (null !== (chunk = parser.read())) {
      buffer += chunk;
    }

    marked(buffer, markedOptions, function (err, content) {
      if (err) throw err;
      meta.content = content;
      var html = template(meta);
      buffer = '';
      socket.write(html);
      socket.end();
    });
  }
});

/**
 * listen port localhost 3000
 */
server.listen(PORT, function () {
  console.log('development server listening port %d', PORT);
});
