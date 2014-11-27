(function() {
    'use strict';
    
    var EventEmitter= require('events').EventEmitter,
    
        versionio   = require('version-io'),
        changelog   = require('changelog-io'),
        Util        = require('util-io'),
        spawnify    = require('spawnify'),
        tryRequire  = require('tryrequire'),
        async       = require('async'),
        minor       = require('minor'),
        
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
        
        module.exports  = function(version) {
            var cmd,
                emitter = new EventEmitter(),
                info    = tryRequire(process.cwd() + '/package');
            
            if (!info) {
                emitter.emit('error', Error('package.json not found'));
            } else if (!version) {
                emitter.emit('data', Util.render(MSG, {
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
                        versionio(version, callback);
                    },
                    function() {
                        var spawn = spawnify(cmd);
                        
                        spawn.on('error', function(error) {
                            emitter.emit('error', error);
                        });
                        
                        spawn.on('data', function(data) {
                            emitter.emit('data', data);
                        });
                        
                        spawn.on('exit', function() {
                            spawn = null;
                            emitter.emit('exit');
                        });
                    }
                ], function(error) {
                    if (error)
                        emitter.emit('error', error);
                });
                
            }
            
            return emitter;
        };
})();
