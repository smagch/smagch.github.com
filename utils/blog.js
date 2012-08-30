var path = require('path')
  , fs = require('fs')
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
 * markdown renderer
 */

exports.renderMarkdown = function (content) {
  return marked(content.toString());
};

/**
 * parse blog title
 */

exports.parseTitle = function (filename) {
  var obj = {};
  var title = path.basename(filename);
  var match = /(\d{4}\-\d{2}\-\d{2})\-(.*)\.md/.exec(title);

  if (!match || !match[1] || !match[2]) {
    throw new Error('invalid filename : ' + name);
  }

  return {
    name: match[2]
  , title: match[2].replace(/\-/g, ' ')
  , date: match[1]
  , filename: filename
  };
};
