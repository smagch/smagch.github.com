
/**
 * Module Dependenies
 */

var fs = require('fs')
  , marked = require('marked')
  , hljs = require('highlight.js');

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
 * render gfm markdown with highlight
 */

exports.renderMarkdown = function (content) {
  return marked(content);
};