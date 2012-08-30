
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

/*

Fsquery('./posts')
  .children(':file')
  .sort()
  .each(function () {
    var d = moment(this.date);
    this.yearMonth = ...
    this.datetime = ...
  })
  .get(function (err, results) {
    
  })


*/
app.get('/', function (req, res, next) {
  console.log('GET /');

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
  .get(function (err, results) {
    if (err) return next(err);
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

/*

var options = {};
// default is fs.readFile

options.parse = function (err, done) {
  // this = '2011-10-11-hoge.md'
  // filename, dirname, extname
  done(null, {
    title: 
    date: 
    filename: 
  });
};

options.comparator = function () {
  return this.date;
};

var FsQuery = fsQuery(options);

// use glob

FsQuery
  .find(name)
  // .siblings().end()
  .prev(function () {
    this.parent().prev = this
  })
  .end()
  .read(function (err, content, done) {
    if (err) done(err);
    this.content = content;
    done(err, this);
  })
  .get(function (err, content) {
    if (err) throw err;
    [{
      title: 'hoge'
      date: '2011-10-11,
      content: 'fdsaffdsafkljadsfkjdsa',
      prev: {
        title: 'fdsa',
        date: '2011-10-10
      },
      next: {
        title: 'fdsaf',
        date: '2011-
      }
    }]
  });

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
