/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , fs = require('fs')
  , stylus = require('stylus')
  , path = require('path')
  , nib = require('nib')
  , fsQuery = require('fsquery')
  , moment = require('moment')
  , blog = require('./utils/blog')
  , _ = require('underscore');

var app = express();

/**
 * view setup
 */

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

/**
 * css engine setup
 */

app.use(stylus.middleware({
  src: __dirname
, dest: path.resolve(__dirname, 'public')
, compile: function (str, path) {
    return stylus(str)
      .set('filename', path)
      .set('warn', true)
      .set('compress', true)
      .use(nib())
  }
}));

/**
 * add view locals
 */

app.locals(require('./utils/locals'));
app.use(app.router);
app.use(express.static(__dirname + '/public'));

/**
 * Routers
 */

app.get('*/index.html', function (req, res, next) {
  var match = /^\/(.+)\.html$/.exec(req.url);
  res.render(match[1]);
});

/**
* show latest post
*/





app.get('/', function (req, res, next) {
  fsQuery('posts').children()
  .map(blog.parseTitle)
  .sortBy(function (file) {
    return -1 * moment(file.date);
  })
  .map(function (post) {
    // add formatted date
    var d = moment(post.date);
    post.yearMonth = d.format('MMMM YYYY');
    post.datetime = d.format('MMM Do YYYY');
    return post;
  })
  .groupBy('yearMonth')
  .get(function (err, posts) {
    if (err) return next(err);
    res.render('blog', { posts: posts });
  });
});

/**
 * show post
 */

app.get('/posts/:postDate/:postId', function (req, res, next) {
  var name = req.params.postId;
  var date = req.params.postDate;

  fsQuery('posts').children(date + '-' + name + '*')
  .map(blog.parseTitle)
  .map(function (file, done) {
    fs.readFile(file.filename, function (err, content) {
      if (err) return done(err);
      file.content = blog.renderMarkdown(content);
      done(null, file);
    });
  })
  .get(function (err, doc) {
    if (err) return next(err);
    res.locals({
      post: doc[0]
    });
    res.render('blog/post');
  });
});

app.get('*/', function (req, res, next) {
  var url = req.url;
  res.render(url.substr(1) + 'index');
});

http.createServer(app).listen(3000, function () {
  console.log('server start');
});