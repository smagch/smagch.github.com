var blog = require('../utils/blog')
  , moment = require('moment')
  , expect = require('expect.js')

describe('util.blog', function () {
  var options = {
    cwd: __dirname
  };

  it('should success', function (done) {
    blog('test-post', options, function (err, result) {
      if (err) return done(err);
      expect(result).to.be.ok();
      expect(result.date).to.eql(moment('2012-04-01', 'YYYY-MM-DD').toDate());
      expect(result.content).to.be.ok();
      expect(result.content).to.eql('<h1>this is a test post</h1>\n')
      done();
    });
  });

  it('should fail with duplicate namimg', function (done) {
    blog('fail', options, function (err, result) {
      expect(err).to.be.ok();
      done();
    });
  });

});