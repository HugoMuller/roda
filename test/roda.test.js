'use strict';

var should = require('should');
var roda = require('../roda');

describe('<Unit Tests>', function(){
  describe('Module Roda', function(){
    describe('Method load', function(){
      it('should fail to load an nonexistent file', function(done){
        var loaded;
        var error;
        try{
          loaded = roda({ include: 'nonexistent' });          
        }catch(err){
          if(err) error = err;
        }finally{
          should.exist(error);
          should.not.exist(loaded);
          done();
        }
      });
      
      it('should load custom_modules directory', function(done){
        var loaded = roda(__dirname+'/../custom_modules');
        var keys_loaded = Object.keys(loaded);
        keys_loaded.length.should.eql(6);
        keys_loaded.should.eql(['excluded-B', 'excluded-C', 'excluded-A', 'module-A', 'module-B', 'module-C']);
        done();
      });

      it('should load custom_modules directory in another way', function(done){
        var loaded = roda({ include: __dirname+'/../custom_modules' });
        var keys_loaded = Object.keys(loaded);
        keys_loaded.length.should.eql(6);
        keys_loaded.should.eql(['excluded-B', 'excluded-C', 'excluded-A', 'module-A', 'module-B', 'module-C']);
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

      it('should load current directory if no arguments or no target passed', function(done){
        var loaded = roda();
        var keys_loaded = Object.keys(loaded);
        keys_loaded.length.should.eql(1);
        keys_loaded.should.eql(['roda.test']);
        done();
      });
    });
  });
});
