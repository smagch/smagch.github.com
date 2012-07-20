
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , app = express()
  , blogMiddleware = require('./utils/blog');

// Configuration

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(require('./utils/stylus'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(__dirname + '/public'));


// Routes
app.get('/', function (req, res) {
  res.render('home');
});

app.get('/blog/:postId', function (req, res, next) {
  var name = req.params.postId;
  console.log('id : ' + name);
  blogMiddleware(name, function (err, doc) {
    if (err) return next(err);
    res.locals(doc);
    res.render('blog/post');
  });
});

http.createServer(app).listen(3000, function () {
  console.log('server start');
});
