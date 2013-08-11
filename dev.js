
/**
 * Simple command-line which takes Simple Protocol document from stdin
 * And then 
 */
var fs = require('fs')
  , net = require('net')
  , marked = require('marked')
  , hljs = require('highlight.js')
  , jade = require('jade')
  , path = require('path')
  , SimpleProtocol = require('./lib/simple-protocol')
  , AsyncCache = require('async-cache');

var TEMPLATE_PATH = path.join(__dirname, 'templates');
var DEFAULT_TEMPLATE_NAME = 'post.jade';

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
      var data = fs.readFileSync();
      templates.set(filename, compile(data));
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
marked.setOptions({
  gfm: true
, pedantic: false
, sanitize: false
, highlight: function (code, lang) {
    if (lang) return hljs.highlight(lang, code).value;
    return hljs.highlightAuto(code).value;
  }
});

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
    console.error('got head');
    meta = head;
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

    meta.content = marked(buffer);
    var html = template(meta);
    socket.write(html);
    socket.end();
    buffer = '';
  }
});

/**
 * listen port localhost 3000
 */
server.listen(3000, function () {
  console.log('listening port 3000');
});
