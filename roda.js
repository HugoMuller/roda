'use strict';

/*
 * ローダー Rōdā (Loader)
 */
var fs = require('fs');
var path = require('path');

var Roda = function(){
  this._included = [];
  this._excluded = [];
};

/**
 * require all the files in `paths` directory, excluding `excluded` directories.
 * if no callback, callback = require
 *
 * @param {string|Array} paths - a file/directory or an array of files/directories to load
 * @param {string|Array} excluded - a file/directory or an array of files/directories to exclude
 * @param {function} callback - a function to execute for each file to load (must contain require)
 * @returns {*} - modules
 */
Roda.prototype.load = function(paths, excluded, callback){
  var loaded = {};

  if(Array.isArray(paths) && paths.length===0
    || typeof paths === 'string' && paths.length===0
    || !Array.isArray(paths) && typeof  paths !== 'string')
  {
    console.error('Roda ERROR: No module requested');
    return loaded;
  }else if(typeof paths === 'string') paths = [paths];
  
  if(!excluded){
    excluded = [];
    callback = require;
  }else if(typeof excluded === 'function'){
    callback = excluded;
    excluded = [];
  }else if(typeof callback !== 'function'){
    callback = require;
  }
  if(typeof excluded === 'string') excluded = [excluded];

  excluded.forEach(function(excl, i){
    this[i] = path.normalize(excl);
  }, excluded);

  var self = this;
  paths.forEach(function(onePath){
    onePath = path.normalize(onePath);
    if(excluded.indexOf(onePath) !== -1) return;
    var exists = fs.existsSync(onePath);
    if(!exists || exists && !fs.statSync(onePath).isDirectory()){
      try{
        loaded[onePath] = callback(onePath);
      }catch(err){
        console.error('Roda ERROR while loading', onePath, err.message);
      }
      return;
    }

    fs
      .readdirSync(onePath)
      .forEach(function(filename){
        var file = path.join(onePath, filename);
        if(excluded.indexOf(file) !== -1) return;
        
        try{
          var stat = fs.statSync(file);
          if(stat.isFile() && /(.*)\.js$/.test(filename)){
            loaded[filename.replace(/.js$/, '')] = callback(file);
          }else if(stat.isDirectory()){
            self.load(file, excluded, callback);
          }
        }catch(err){
          console.error('Roda ERROR while loading', file, err.message);
        }
      });
  });

  return loaded;
};

/**
 * Set the files/directories to load
 * 
 * @returns {Roda}
 */
Roda.prototype.include = function(){
  var _included = (Array.isArray(arguments[0])) ? arguments[0] : Array.prototype.slice.call(arguments);
  this._included = this._included.concat(_included);
  return this;
};

/**
 * Set the files/directories to exclude
 * 
 * @returns {Roda}
 */
Roda.prototype.exclude = function(){
  var _excluded = (Array.isArray(arguments[0])) ? arguments[0] : Array.prototype.slice.call(arguments);
  this._excluded = this._excluded.concat(_excluded);
  return this;
};

/**
 * @param callback
 * @returns {*}
 */
Roda.prototype.exec = function(callback){
  var loaded = this.load(this._included, this._excluded, callback);
  this._included = [];
  this._excluded = [];
  return loaded;
};

module.exports = new Roda();
