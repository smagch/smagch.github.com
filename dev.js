
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , app = express()
  , blog = require('./utils/blog');

// Configuration

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(require('./utils/stylus'));
app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

/**
 * view locals
 */

app.locals(require('./utils/locals'));

/**
 * Router
 */

app.get('/', function (req, res) {
  res.render('home');
});

app.get('*/', function (req, res, next) {
  var url = req.url;
  res.render(url.substr(1) + 'index')
});

app.get('*/index.html', function (req, res, next) {

  var match = /^\/(.+)\.html$/.exec(req.url);
  res.render(match[1]);
});

app.get('/blog/:postId', function (req, res, next) {
  var name = req.params.postId;
  console.log('name : ' + name);
  blog(name, function (err, doc) {
    if (err) return next(err);
    res.locals(doc);
    res.render('blog/post');
  });
});

http.createServer(app).listen(3000, function () {
  console.log('server start');
});
