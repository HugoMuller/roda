roda (ローダー)
==============

Simple plugins loader, which can load plugins inside directories.

-------

Installation
------------

    npm install roda

Usage
-----
    
Assuming we have a `plugins` containing your own plugins:

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

There are several ways to load the plugins `pluginOne.js`, `pluginTwo.js`, `pluginThree.js`.

###Method load(paths [, excluded [, callback]])

You can invoke the `load` method, with the target directory, the list of the files/directories to exclude,
and a callback to execute with each module.  
If you omit the callback, the basic `require` will be called.  
If you pass a callback, make sure you call at least require(module) inside, in order to load your modules.

    var roda = require('roda');
    var dir = __dirname+'/plugins';
    
    // These 3 calls do the same thing:
    var plugins = roda.load(dir, [dir+'excludeMe.js', dir+'/excludeThem']);
    // OR
    var plugins = roda.load([dir+'/pluginA.js', dir+'/pluginB.js', dir+'/pluginC.js']);
    //
    var plugins = roda.load(dir, [dir+'excludeMe.js', dir+'/excludeThem'], function(module){ return require(module); });
    
Then, to access your modules, simply do:

    plugins['module-A'].doSomething();
    plugins['module-B'].doAnotherThing();
    
If you pass a callback, make sure you return at least require(module), in order to load your modules and be able to access it later.

    var roda = require('roda');
    var dir = __dirname+'/plugins';
    
    var plugins = roda.load(dir, function(module){
      console.log('sample callback called with ', module);
      // some stuff
      return require(module);
      // OR for example
      return require(module)(/* some params */);
    });
    
###Chaining methods

If you prefer, you can chain special methods to load your modules.  
The result of this example is exactly the same as the previous one. 

    var roda = require('roda');
    var dir = __dirname+'/plugins';
    
    var plugins = roda
      .include(dir)
      .exclude([dir+'excludeMe.js', dir+'/excludeThem'])
      .exec(function(module){ return require(module); });

Warning
-------

This module loader cannot load `should` module.

Running tests
-------------

Unit Tests are run with [mocha](http://visionmedia.github.io/mocha/).
You need to install this framework in order to run the tests:
    
    npm install mocha -g

Then, to run the tests, simply do:

    npm test

Coming soon
-----------

This module can be improved somehow. It is not enough easy to use, in my opinion.
That's why I'm working on another version, simplier than this one. :D

License
-------

[The MIT License](https://github.com/HugoMuller/roda/blob/master/LICENSE)
