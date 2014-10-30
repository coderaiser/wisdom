(function() {
    'use strict';
    
    var fs          = require('fs'),
        changelog   = require('changelog-io'),
        Util        = require('util-io'),
        spawnify    = require('spawnify'),
        tryRequire  = require('tryrequire'),
        async       = require('async'),
        minor       = require('./minor'),
        
        Cmd         = [ 'git add package.json',
                        'git add ChangeLog',
                        'git commit -am "feature(package) v{{ version }}"',
                        'git tag v{{version}}',
                        'git push origin v{{version}}',
                        'git push origin master',
                        'npm publish'
                    ].join('&&'),
        
        MSG         = [ 'publish <version>',
                        'package: {{ name }} v{{ version }}'
                    ].join('\n');
        
        module.exports  = function(version, callback) {
            var cmd,
                info = tryRequire(process.cwd() + '/package');
            
            if (!info) {
                callback({
                    message: 'package.json not found.'
                });
            } else if (!version) {
                callback(null, Util.render(MSG, {
                    name    : info.name,
                    version : info.version
                }));
            } else {
                if (!version.indexOf('v'))
                    version = version.slice(1);
                else if (/major|minor|patch/.test(version))
                    version = minor(version, info.version);
                
                cmd = Util.render(Cmd, {
                    version: version
                });
                
                async.series([
                    function(callback) {
                        changelog(version, callback);
                    },
                    
                    function(callback) {
                        var json;
                        
                        info.version    = version;
                        json            = JSON.stringify(info, 0, 2) + '\n';
                        
                        fs.writeFile('package.json', json, callback);
                    },
                    function(callback) {
                        spawnify(cmd, function(error, json) {
                            var stdout;
                            
                            if (!error)
                                if (json.stderr)
                                    error   = Error(json.stderr);
                                else if (json.stdout)
                                    stdout = json.stdout;
                            
                            callback(error, stdout);
                        });
                    }
                ],
                
                function(error) {
                    if (error)
                        callback(error);
                });
                
            }
        };
})();
