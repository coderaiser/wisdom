#!/usr/bin/env node

(function() {
    'use strict';
    
    var fs          = require('fs'),
        spawnify    = require('spawnify'),
        Util        = require('util-io'),
        
        args        = process.argv.slice(2),
        
        Cmd         = [ 'git add package.json',
                        'git commit -m "feature(package) v{{ version }}"',
                        'git push origin master',
                        'git tag v{{ version }}',
                        'git push origin v{{ version }}',
                        'npm publish'
                    ].join('&&'),
        
        MSG         = [ 'publish <version>',
                        'example: publish v1.0.0',
                        'current version: {{ version }}'
                    ].join('\n');
    
    get(function(error, json) {
        var data, arg, cmd, version;
        
        arg = args[0];
        
        if (error) {
            console.error(error.message);
        } else if (!args.length) {
            console.log(Util.render(MSG, {
                version: json.version
            }));
        } else if (arg === '-v' || arg === '---v') {
            version = require('../package').version;
            console.log('v' + version);
        } else if (isNaN(arg[1] - 0)) {
            console.error('Version should be number.');
        } else {
            
            if (isNaN(arg[0]) - 0)
                version = arg.slice(1);
            else
                version = arg;
            
            json.version = version;
            
            cmd     = Util.render(Cmd, {
                version: version
            });
            
            data    = JSON.stringify(json, 0, 2) + '\n';
            
            set(data, function(error) {
                if (error)
                    console.error(error.message);
                else
                    spawnify(cmd, function(error, json) {
                        var err = error && error.message;
                        
                        if (err ||  json.stderr)
                            console.error(err || json.stderr);
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
