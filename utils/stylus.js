var stylus = require('stylus')
  , nib = require('nib')
  , resolve = require('path').resolve;

module.exports = stylus.middleware({
  src: resolve('.')
, dest: resolve('.', 'public')
, compile: function (str, path) {
    return stylus(str)
      .set('filename', path)
      .set('warn', true)
      .set('compress', true)
      .use(nib())
  }
});