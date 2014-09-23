'use strict';

var should = require('should');
var roda = require('../roda');

describe('<Unit Tests>', function(){
  describe('Module Roda', function(){
    describe('Method load', function(){
      it('should return the core module path', function(done){
        var loaded = roda('path');
        Object.keys(loaded).should.eql(['path']);
        should.exist(loaded.path);
        (typeof loaded['path'].normalize === 'function').should.equal(true);
        done();
      });

      it('should return the module logbrok', function(done){
        var loaded = roda({ include: 'logbrok' });
        var logbrok = loaded['logbrok'](__filename);
        Object.keys(loaded).should.eql(['logbrok']);
        should.exist(loaded['logbrok']);
        (typeof logbrok.log === 'function').should.equal(true);
        done();
      });

      it('should load custom_modules directory, excluding excluded-*.js files', function(done){
        var dir = __dirname+'/../custom_modules';
        var loaded = roda({ include: dir, exclude: [dir+'/excluded-A.js', dir+'/excluded'] });
        var keys_loaded = Object.keys(loaded); 
        keys_loaded.length.should.eql(3);
        keys_loaded.should.eql(['module-A', 'module-B', 'module-C']);
        (typeof loaded['module-A'].me === 'function').should.equal(true);
        (typeof loaded['module-B'].me === 'function').should.equal(true);
        (typeof loaded['module-C'].me === 'function').should.equal(true);
        loaded['module-A'].me().should.equal('A');
        loaded['module-B'].me().should.equal('B');
        loaded['module-C'].me().should.equal('C');
        done();
      });
      
      it('should apply callback on each module loaded', function(done){
        var dir = __dirname+'/../custom_modules';
        var letters = {};
        var loaded = roda({
          include: dir,
          exclude: [dir+'/excluded-A.js', dir+'/excluded'],
          callback: function(module, moduleName){
            letters[moduleName] = module.me();
        }});
        var keys_letters = Object.keys(letters);
        keys_letters.length.should.eql(3);
        keys_letters.should.eql(['module-A', 'module-B', 'module-C']);
        letters['module-A'].should.equal('A');
        letters['module-B'].should.equal('B');
        letters['module-C'].should.equal('C');
        done();
      });

      it('should load logbrok and path', function(done){
        var loaded = roda({ include: ['path', 'logbrok', 'fs'], exclude: 'fs' });
        var module_names = Object.keys(loaded);
        module_names.length.should.equal(2);
        module_names.should.eql(['path', 'logbrok']);
        should.not.exist(loaded['fs']);
        should.exist(loaded['path']);
        should.exist(loaded['logbrok']);
        var logbrok = loaded['logbrok'](__filename);
        (typeof loaded['path'].normalize === 'function').should.equal(true);
        (typeof logbrok.log === 'function').should.equal(true);
        done();
      });

      it('should load current directory if no args or no target', function(done){
        var loaded = roda();
        var keys_loaded = Object.keys(loaded);
        keys_loaded.length.should.eql(1);
        keys_loaded.should.eql(['roda.test']);
        done();
      });
    });
  });
});
