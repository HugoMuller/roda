'use strict';

/*
 * ローダー Rōdā (Loader)
 */
var fs = require('fs');
var path = require('path');

function shapeParams(params){
  if((Array.isArray(params.include) || typeof params.include === 'string') && params.include.length===0
    || !Array.isArray(params.include) && typeof  params.include !== 'string')
  {
    params.include = [path.dirname(module.parent.paths[0])];
  }else if(typeof params.include === 'string'){
    params.include = [params.include];
  }

  if(!params.exclude) params.exclude = [];
  if(typeof params.exclude === 'string') params.exclude = [params.exclude];
  if(typeof params.callback !== 'function') params.callback = null;

  params.exclude.forEach(function(excluded, i){
    this[i] = path.normalize(excluded);
  }, params.exclude);
}

/**
 * require all the files in `paths` directory, excluding `excluded` directories.
 * if no callback, callback = require
 *
 * @param {object} params
 * {string|Array} params.include - a file/directory or an array of files/directories to load
 * {string|Array} params.exclude - a file/directory or an array of files/directories to exclude
 * {function} params.callback - a function to execute for each file to load (must contain require)
 * @returns {*} - modules
 */
exports.load = function load(params){
  var loaded = {};
  params = params || {};
  shapeParams(params);
  
  params.include.forEach(function(target){
    target = path.normalize(target);
    if(params.exclude.indexOf(target) !== -1) return;
    var exists = fs.existsSync(target);
    /* if the target is not a directory, try to require it.
     * if the target does not exists, it is perhaps a core module
     * or it is inside node_modules directory, so try to load it.
    */
    if(!exists || exists && !fs.statSync(target).isDirectory()){
      try{
        var name = path.basename(target, '.js');
        loaded[name] = require(target);
        if(params.callback && loaded[name] !== null) params.callback(loaded[name], target);
      }catch(err){
        console.error('Roda ERROR while loading', target, err.message);
      }
      return;
    }

    // if the target is a directory, read it and require each file in sub-directories if any.
    fs
      .readdirSync(target)
      .forEach(function(filename){
        var file = path.join(target, filename);
        if(params.exclude.indexOf(file) !== -1) return;

        try{
          var stat = fs.statSync(file);
          if(stat.isFile() && /(.*)\.js$/.test(filename)){
            var name = path.basename(filename, '.js');
            loaded[name] = require(file);
            if(params.callback && loaded[name] !== null) params.callback(loaded[name], name);
          }else if(stat.isDirectory()){
            params.include = file;
            load(params);
          }
        }catch(err){
          console.error('Roda ERROR while loading', file, err.message);
        }
      });
  });

  return loaded;
};
