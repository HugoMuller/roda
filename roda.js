'use strict';

/*
 * ローダー Rōdā (Loader)
 */
var fs = require('fs');
var path = require('path');

function extend(dest, source){
  for(var attr in source){
    if(source.hasOwnProperty(attr)) dest[attr] = source[attr];
  }
}

function shapeParams(params){
  params = params || {};
  
  if(typeof params === 'string') params = { include: [params] };
  
  if((Array.isArray(params.include) || typeof params.include === 'string') && params.include.length===0
    || !Array.isArray(params.include) && typeof  params.include !== 'string')
  {
    params.include = [path.dirname(module.parent.paths[0])];
  }else if(typeof params.include === 'string'){
    params.include = [params.include];
  }

  if(!params.exclude) params.exclude = [];
  else if(typeof params.exclude === 'string') params.exclude = [params.exclude];
  if(typeof params.callback !== 'function') params.callback = null;

  params.exclude.forEach(function(excluded, i){
    this[i] = path.normalize(excluded);
  }, params.exclude);
  
  return params;
}

function isFile(file, filename){
  return file.isFile() && /(.*)\.js$/.test(filename);
}

function requireFile(loaded, file, callback){
  var name = path.basename(file, '.js');
  try{
    loaded[name] = require(file);
    if(callback && loaded[name] !== null) callback(loaded[name], name);
  }catch(err){
    throw new Error('Roda ERROR while loading ' + file + ': ' + err.message);
  }
}

function requireDirectory(loaded, directory, params){
  fs
    .readdirSync(directory)
    .forEach(function(filename){
      var file = path.join(directory, filename);
      if(params.exclude.indexOf(file) !== -1) return;

      var stat = fs.statSync(file);
      if(isFile(stat, filename)){
        requireFile(loaded, file, params.callback);
      }else if(stat.isDirectory()){
        params.include = file;
        extend(loaded, load(params));
      }else{
        throw new Error('Roda ERROR while loading ' + file + ' is neither a directory nor a file');
      }
    });
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
function load(params){
  var loaded = {};
  params = shapeParams(params);
  
  params.include.forEach(function(target){
    target = path.normalize(target);
    if(params.exclude.indexOf(target) !== -1) return;
    if(!fs.existsSync(target)) throw new Error('Roda ERROR while loading ' + target + ': ' + target + ' does not exist');

    var stat = fs.statSync(target);
    if(isFile(stat, target)){
      requireFile(loaded, target, params.callback);
    }else if(stat.isDirectory()){
      requireDirectory(loaded, target, params);
    }else{
      throw new Error('Roda ERROR while loading ' + target + ': ' + target + ' is neither a directory nor a file');
    }
  });

  return loaded;
}

module.exports = load;
