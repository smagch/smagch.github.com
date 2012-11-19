#!/usr/bin/env node

/**
 * Module Dependencies
 */

var fs = require('fs')
  , path = require('path')
  , jade = require('jade')
  , renderMarkdown = require('./utils').renderMarkdown
  , argv = require('optimist')
      .demand(['template', 'obj'])
      .usage("Usage: $0 --template hoge.jade --obj '{foo: 1}'")
      .describe('template', 'jade template for the post')
      .describe('obj', 'local options for template')
      .argv;

/**
 * template for post
 */

var template = jade.compile(fs.readFileSync(argv.template), {
  filename: argv.template
});

/**
 * evaluate options
 */

var options = eval('(' + argv.obj + ')');

/**
 * render jade to target directory
 *   1. get markdown from stdin
 *   2. add options `.content` property compiling markdown file
 *   3. stdout rendered html file
 */

var buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) { buf += chunk; });
process.stdin.on('end', function () {
  options.content = renderMarkdown(buf);
  var html = template({ post: options })
  process.stdout.write(html);
}).resume();