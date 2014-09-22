'use strict';

var should = require('should');
var roda = require('../roda');

describe('<Unit Tests>', function(){
  describe('Module Roda', function(){
    describe('Method load', function(){
      it('should return nothing and print an error', function(done){
        roda.load([]).should.containEql({});
        roda.load('').should.containEql({});
        roda.load(0).should.containEql({});
        done();
      });
      
      it('should return the core module path', function(done){
        var loaded = roda.load(['path']);
        Object.keys(loaded).should.eql(['path']);
        should.exist(loaded['path']);
        (typeof loaded['path'].normalize === 'function').should.equal(true);
        done();
      });

      it('should return the module logbrok', function(done){
        var loaded = roda.load('logbrok', function(m){
          return require(m)(__filename);
        });
        Object.keys(loaded).should.eql(['logbrok']);
        should.exist(loaded['logbrok']);
        (typeof loaded['logbrok'].log === 'function').should.equal(true);
        done();
      });
      
      it('should load custom_modules directory, excluding excluded-*.js files', function(done){
        var dir = __dirname+'/../custom_modules';
        var loaded = roda.load(dir, [dir+'/excluded-A.js', dir+'/exluded']);
        Object.keys(loaded).should.eql(['module-A', 'module-B', 'module-C']);
        (typeof loaded['module-A'].me === 'function').should.equal(true);
        (typeof loaded['module-B'].me === 'function').should.equal(true);
        (typeof loaded['module-C'].me === 'function').should.equal(true);
        loaded['module-A'].me().should.equal('A');
        loaded['module-B'].me().should.equal('B');
        loaded['module-C'].me().should.equal('C');
        done();
      });
    });
    
    describe('Method include', function(){
      it('should return the roda instance with one module path', function(done){
        roda.include('a')._included.should.eql(['a']);
        done();
      });
      
      it('should add several paths to the roda instance', function(done){
        roda.include('b', 'c', 'd')._included.should.eql(['a', 'b', 'c', 'd']);
        roda.include(['e', 'f'])._included.should.eql(['a', 'b', 'c', 'd', 'e', 'f']);
        done();
      });

      it('should do nothing if no argument', function(done){
        roda.include()._included.should.eql(['a', 'b', 'c', 'd', 'e', 'f']);
        done();
      });
    });

    describe('Method exclude', function(){
      it('should exclude two files', function(done){
        roda.exclude('b', 'd')._excluded.should.eql(['b', 'd']);
        roda.exclude(['c', 'e'])._excluded.should.eql(['b', 'd', 'c', 'e']);
        done();
      });
      
      it('should do nothing if no argument', function(done){
        roda.exclude()._excluded.should.eql(['b', 'd', 'c', 'e']);
        done();
      });
    });

    describe('Method exec', function(){
      before(function(ready){
        roda._included = [];
        roda._excluded = [];
        ready();
      });
      
      it('should load logbrok and path', function(done){
        var loaded = roda
          .include('path', 'logbrok', 'fs')
          .exclude('fs')
          .exec();
        var _loaded = Object.keys(loaded);
        _loaded.length.should.equal(2);
        _loaded.should.eql(['path', 'logbrok']);
        should.not.exist(loaded['fs']);
        should.exist(loaded['path']);
        should.exist(loaded['logbrok']);
        var _logbrok = loaded['logbrok'](__filename);
        (typeof loaded['path'].normalize === 'function').should.equal(true);
        (typeof _logbrok.log === 'function').should.equal(true);
        roda._included.should.eql([]);
        roda._excluded.should.eql([]);
        done();
      });
    });
  });
});
