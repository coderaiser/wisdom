#!/usr/bin/env node

(function() {
    'use strict';
    
    var fs          = require('fs'),
        spawnify    = require('spawnify'),
        Util        = require('util-io'),
        
        args        = process.argv.slice(2),
        
        Cmd         = [ 'git commit -am "feature(package) v{{ version }}"',
                        'git push origin master',
                        'git tag {{ version }}',
                        'git push origin {{ version }}',
                        'npm publish'
                    ].join('&&'),
        version;
    
    get(function(error, json) {
        var data, arg, cmd;
        
        if (error)
            console.error(error.message);
        else if (!args.length) {
            console.log(json.version);
        } else {
            arg = args[0];
            
            
            if (isNaN(version - 0))
                version = arg.slice(1);
            else
                version = arg;
            
            json.version = version;
            
            cmd     = Util.render(Cmd, {
                version: version
            });
            
            data    = JSON.stringify(json, 0, 2) + '\n';
            
            set(data, function() {
                if (error)
                    console.error(error.message);
                else
                    spawnify(Cmd, function(error, json) {
                        if (error || json.error)
                            console.error(error.message || json.error);
                        else
                            console.log(json.stdout);
                    });
            });
        }
    });
    
    function get(callback) {
        fs.readFile('package.json', {encoding:'utf8'}, function(error, data) {
            var json;
            
            if (!error)
                json = JSON.parse(data);
            
            callback(error, json);
        });
    }
    
    function set(data, callback) {
        fs.writeFile('package.json', data, callback);
    }
    
})();
