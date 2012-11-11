#!/usr/bin/env node

/**
 * Module Dependencies
 */

var fs = require('fs')
  , path = require('path')
  , marked = require('marked')
  , hljs = require('highlight.js')
  , jade = require('jade')
  , argv = require('optimist')
      .demand(['template', 'src'])
      .usage('Usage: $0 --template hoge.jade --src ./foo')
      .describe('template', 'jade template for the post')
      .describe('src', 'markdown source directory for post')
      .argv;

/**
 * template for post
 */

var template = jade.compile(fs.readFileSync(argv.template), {
  filename: argv.template
});

/**
 * enable hightlighting
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
 * markdown renderer
 */

function renderMarkdown(content) {
  return marked(content.toString());
};

/**
 * render jade to target directory
 *   1. evaluate stdin to get options for jade rendering
 *   2. add options `.content` property compiling markdown file
 *   3. stdout rendered html file
 */

var buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) { buf += chunk; });
process.stdin.on('end', function () {
  var options = eval('(' + buf + ')');
  if (Array.isArray(options)) options = options[0];
  var filepath = path.resolve(argv.src, options.filename);
  var content = fs.readFileSync(filepath);
  options.content = renderMarkdown(content);
  var out = template({ post: options });
  console.log(out);
}).resume();