#!/usr/bin/env node

(function() {
    'use strict';
    
    var fs          = require('fs'),
        spawnify    = require('spawnify'),
        Util        = require('util-io'),
        tryRequire  = require('tryrequire'),
        
        args        = process.argv.slice(2),
        
        Cmd         = [ 'npm version {{ version }} -m "feature(package) v%s"',
                        'git push origin master',
                        'npm publish'
                    ].join('&&'),
        
        MSG         = [ 'publish <version>',
                        'package: {{ name }} v{{ version }}'
                    ].join('\n'),
                    
        Info        = tryRequire('./package'),
        
        arg, cmd, version;
        
        arg = args[0];
        
        if (!args.length) {
            console.log(Util.render(MSG, {
                name    : Info.name,
                version : Info.version
            }));
        } else if (arg === '-v' || arg === '--v') {
            version = require('../package').version;
            console.log('v' + version);
        } else if (!Info)
            console.error('package.json not found.');
        else {
            if (arg[0] === 'v')
                version = arg.slice(1);
            else
                version = arg;
            
            cmd = Util.render(Cmd, {
                version: version
            });
            
            spawnify(cmd, function(error, json) {
                var err = error && error.message || json.stderr;
                
                if (err)
                    console.error(err);
                else
                    console.log(json.stdout);
            });
        }
    
})();
