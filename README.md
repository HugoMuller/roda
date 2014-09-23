roda (ローダー)
==============

Simple plugins loader, which can load plugins inside directories.

-------

Installation
------------

    npm install roda

Usage
-----

    var plugins = require('roda')({
      include: /* files or directories to load */,
      exclude: /* files or directories NOT to load */,
      callback: /* function to apply on each loaded plugin */
    });
    
Assuming the following case: a project with a `plugins` directory containing custom plugins:

    sampleProject
    ├── plugins
    │   ├── pluginOne.js
    │   ├── pluginTwo.js
    │   ├── pluginThree.js
    │   ├── ...
    │   ├── excludeMe.js
    │   └── excludeThem
    │           ├── excludedOne.js
    │           ├── excludedTwo.js
    │           └── ...
    ├── node_modules
    │   └── ...
    ├── index.js
    └── package.json

#####Loading an entire directory
To load the entire directory, you can simply pass the directory path:

    var plugins = require('roda')(__dirname+'/plugins');
    // OR
    var plugins = require('roda')({ include: __dirname+'/plugins' });

#####Loading the current directory
To load the current directory, i.e., the directory from which you're requiring roda, simply omit the target:

    var plugins = require('roda')();
    // OR
    var plugins = require('roda')({
      exclude: /* something to exclude or nothing... */
    });

#####Excluding files and subdirectories
To load the directory, excluding one or several files, do as follow:

    var load = require('roda');
    var plugins;
    var target = __dirname+'/plugins';
    
    // excluding one file
    plugins = load({
      include: target,
      exclude: target+'/excludeMe.js'
    });
    
    // excluding several files and subdirectories
    plugins = load({
      include: target,
      exclude: [target+'/excludeMe.js', target+'/excludeThem']
    });
    
#####Accessing the plugins
Then, to access your plugins, simply do:

    plugins['pluginOne'].doSomething();
    plugins['pluginTwo'].doAnotherThing();
    plugins.pluginThree.doWhateverYouWant();
    
#####Passing a callback
You can pass a callback as well, if you want to do some extra stuff:

    var target = __dirname+'/plugins';
    var plugins = require('roda')({
      include: target,
      exclude: [target+'/excludeMe.js', target+'/excludeThem'],
      callback: function(plugin, pluginName){
        console.log('loading', pluginName, '...');
        plugin.doSomeStuff();
    }});

Warning
-------

Roda cannot load `should` module, because `should` extends the Object prototype by adding the `should` property.
If you try to load `should` with roda, it will result in a conflict when accessing it:

    plugins.should... what's that?

Running tests
-------------

Unit Tests are run with [mocha](http://visionmedia.github.io/mocha/).
You need to install this framework in order to run the tests:
    
    npm install mocha -g

Then, to run the tests, simply do:

    npm test

License
-------

[The MIT License](https://github.com/HugoMuller/roda/blob/master/LICENSE)
