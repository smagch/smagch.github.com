
/**
 * Module Dependencies
 */

var fs = require('fs')
  , path = require('path')
  , optimist = require('optimist')
  , _ = require('underscore')
  , renderMarkdown = require('./utils').renderMarkdown;

var templateDir = path.join(__dirname, '../templates');

/**
 * parse args
 */

var argv = optimist
  .demand(['obj', 'src'])
  .argv;

/**
 * post options
 */

var posts = fs.readFileSync(argv.obj);
posts = JSON.parse(posts).posts;

/**
 * entry renderer
 */

function content(filename) {
  var filepath = path.resolve(argv.src, filename);
  var content = fs.readFileSync(filepath);
  return renderMarkdown(content);
};

/**
 * atom head
 */

var head = fs.readFileSync(path.join(templateDir, 'atom-head.html')).toString();
process.stdout.write(_.template(head, {}));

/**
 * atom content
 */

var contentTemplate = fs.readFileSync(path.join(templateDir, 'atom-content.html'));
contentTemplate = _.template(contentTemplate.toString());
posts.forEach(function (post) {
  var filepath = path.join(argv.src, post.filename);
  var content = fs.readFileSync(filepath);
  post.content = renderMarkdown(content.toString());
  process.stdout.write(contentTemplate({ post: post }));
});

/**
 * atom foot
 */

var foot = fs.readFileSync(path.join(templateDir, 'atom-foot.html'));
process.stdout.write(foot);