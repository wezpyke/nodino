'use strict';

var request = require('superagent');
var expect = require('expect.js');
var config = require(__dirname + '/../config')('test');
var host = 'http://localhost:' + config.port;

describe('Web app', function() {
  after(function(done) {
    var redis = require('redis-url').connect(config.redis);
    redis.flushall();
    done();
  });

  describe('GET /', function() {
    it('works', function(done) {
      request.get(host).end(function(res){
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        done();
      });
    });
  });

  describe('POST /', function() {
    it('responds with JSON data when URL is valid', function(done) {
      var url = 'http://google.com';

      request.post(host).send({url: url }).end(function(error, res) {
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        expect(res.body.error).not.to.exist;
        expect(res.body.data.url).to.equal(url);
        expect(res.body.data.id).to.exist;
        expect(res.body.data.host).to.exist;
        done();
      });
    });

    it('responds with JSON error when URL is not valid', function(done) {
      var url = 'wrong';

      request.post(host).send({url: url }).end(function(error, res) {
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        expect(res.body.error).to.exist;
        expect(res.body.data).not.to.exist;
        done();
      });
    });

  });

  describe('GET /:id', function() {
    var result;
    var url = 'http://google.com';

    beforeEach(function(done) {
      request.post(host).send({url: url }).end(function(error, res) {
        result = res.body.data.id;
        done();
      });
    });

    it('redirects to URL when id is found', function(done) {
      var redirects = [];

      request.get(host + '/' + result).redirects(1).on('redirect', function(res){
        redirects.push(res.headers.location);
      }).end(function(res) {
        expect(res).to.exist;
        expect(redirects[0]).to.equal(url);
        done();
      });
    });

    it('responds with 404 when is not found', function(done) {
      var redirects = [];

      request.get(host + '/abc').end(function(res) {
        expect(res).to.exist;
        expect(res.status).to.equal(404);
        done();
      });
    });

  });
});
