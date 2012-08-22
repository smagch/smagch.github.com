var path = require('path')
  , fs = require('fs')
  , marked = require('marked')
  , hljs = require('highlight.js')
  , pagin = require('pagin')

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
 * pagin options
 */ 

var options = {
  dirname: 'posts'
, fn: function (content) {
    return marked(content.toString());
  }
};

module.exports = pagin.create(options);