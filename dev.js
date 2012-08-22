
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , stylus = require('stylus')
  , path = require('path')
  , nib = require('nib')
  , Pagin = require('./utils/blog')
  , moment = require('moment')
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

/**
 *
 */

//app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

/**
 * Router
 */

app.get('*/index.html', function (req, res, next) {

  var match = /^\/(.+)\.html$/.exec(req.url);
  res.render(match[1]);
});

/**
* show latest post
*/

app.get('/', function (req, res) {
  Pagin
  .list('*')
  .exec(function (err, results) {
    if (err) return next(err);
    // add formatted date

    results.sort(function (a, b) {
      if (moment(a.date) > moment(b.date)) return -1;
      return 1;
    });

    results.forEach(function (post) {
      var d = moment(post.date);
      post.yearMonth = d.format('MMMM YYYY');
      post.datetime = d.format('MMM Do YYYY');
    });

    var posts = _.groupBy(results, 'yearMonth');

    res.locals({
      posts: posts
    });

    res.render('blog');
  });
});

// app.get('/blog/:postDate', function (req, res, next) {
//   var postDate = req.params.postDate;
//   console.log('postDate : ' + postDate);
//   
//   Pagin.find({date: postDate}, function (err, results) {
//     if (err) return next(err);
//     // if date search not found, then move to `/blog/:postId`
//     if (!results.length) return next();
// 
//     res.locals({
//       posts: results
//     });
//     res.render('blog');
//   });
// });

/**
 * show post
 */

app.get('/posts/:postDate/:postId', function (req, res, next) {
  var name = req.params.postId;
  console.log('name : ' + name);
  // Pagin.findOnly(name, function (err, doc) {
  //   if (err) return next(err);
  //   res.locals({
  //     post: doc
  //   });
  //   console.log('render /blog/:postId');
  //   res.render('blog/post');
  // });
  Pagin
    .findOnly(name)
    //.siblings()
    .exec(function (err, doc) {
      if (err) return next(err);
      res.locals({
        post: doc
      });
      console.log('render /blog/:postId');
      // res.locals.use(blogList)
      // res.locals.use(siblings(name, 3))
      // res.locals.use(findOnly(name))

      // let's load blog list of the same year
      // 2010
      //   title1
      //   title2 * selected
      //   title3
      // 2011
      res.render('blog/post');
    });

});

app.get('*/', function (req, res, next) {
  var url = req.url;
  res.render(url.substr(1) + 'index')
});

// app.get('/blog/:postYear/:postMonth', function (req, res, next) {
//   var year = req.params.postYear
//     , month = req.params.postMonth;
//
//   Pagin.find({date: year + '-' + month}, function (err, results) {
//     if (err) return next(err);
//     if (!results.length) return next();
//
//     res.locals({
//       posts: results
//     });
//     res.render('blog/index');
//   });
// });

//app.get('/blog/:postYear/:postMonth', function (req, res, next) {})

http.createServer(app).listen(3000, function () {
  console.log('server start');
});
