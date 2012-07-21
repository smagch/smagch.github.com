var path = require('path')
  , glob = require('glob')
  , moment = require('moment')
  , fs = require('fs')
  , marked = require('marked')
  , hljs = require('highlight.js')
  , postFormat = /\d{4}\-\d{2}\-\d{2}\-(.*)\.md/;

/**
 * enable hightlighting
 */

marked.setOptions({
  gfm: true
, pedantic: false
, sanitize: false
, highlight: function (code, lang) {
    if (lang) {
      return hljs.highlight(lang, code).value;
    }

    return hljs.highlightAuto(code).value;
  }
});

/**
 * glob options
 * use relative path for test
 */

var defaults = {
  cwd: path.resolve('.')
};

/**
 * blog file resolver
 *
 * return obj with callback
 *   obj.title {String}
 *   obj.date {Date}
 *   obj.content {String} html rendered by marked
 *
 * @param {String}
 * @param {Object} - optional
 * @param {Function}
 */

module.exports = function (name, options, done) {
  if (typeof options === 'function') {
    done = options;
    options = defaults;
  }

  glob('posts/*' + name + '.md', options, function (err, results) {
    if (err) return done(err);
    if (!results.length) return done(new Error('no such post : ' + name));
    if (results.length !== 1) return done(new Error('duplicate post title'));

    var obj = {}
      , filepath = path.resolve(options.cwd, results[0])
      , base = path.basename(results[0])
      , match = postFormat.exec(base)

    if (!match[1] || name != match[1]) {
      return done(new Error('name format should be like `YYYY-MM-DD-{name}.md`'));
    }

    obj.title = name.replace(/\-/g, ' ');
    obj.date = moment(base, 'YYYY-MM-DD').toDate();

    fs.readFile(filepath, function (err, content) {
      if (err) return done(err);
      obj.content = marked(content.toString());
      done(null, obj);
    });
  });
};