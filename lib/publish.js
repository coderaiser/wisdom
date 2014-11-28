(function() {
    'use strict';
    
    var EventEmitter= require('events').EventEmitter,
        
        versionio   = require('version-io'),
        changelog   = require('changelog-io'),
        Util        = require('util-io'),
        spawnify    = require('spawnify'),
        async       = require('async'),
        minor       = require('minor'),
        prepend     = require('prepend'),
        grizzly     = require('grizzly'),
        readjson    = require('readjson'),
        
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
        var emitter = new EventEmitter(),
            name    = process.cwd() + '/package.json';
        
        readjson(name, function(error, info) {
            if (!info)
                emitter.emit('error', Error('package.json not found'));
            else if (!version)
                emitter.emit('data', Util.render(MSG, {
                    name    : info.name,
                    version : info.version
                }));
            else
                publish(version, info, emitter);
        });
        
        return emitter;
    };
        
    function publish(version, info, emitter) {
        var cmd,
            chlog       = '';
        
        if (!version.indexOf('v'))
            version = version.slice(1);
        else if (/major|minor|patch/.test(version))
            version = minor(version, info.version);
        
        cmd = Util.render(Cmd, {
            version: version
        });
        
        async.series([
            function(callback) {
                changelog(version, function(error, data) {
                    if (error) {
                        callback(error);
                    } else {
                        prepend('ChangeLog', data, callback);
                        
                        chlog = rmLines(data, 2);
                        chlog = markdown(chlog);
                    }
                });
            },
            
            function(callback) {
                versionio(version, callback);
            },
            
            function(callback) {
                var done,
                    spawn = spawnify(cmd);
                
                spawn.on('error', function(error) {
                    if (!done) {
                        done = true;
                        callback();
                    }
                    
                    emitter.emit('error', error);
                });
                
                spawn.on('data', function(data) {
                    emitter.emit('data', data);
                });
                
                spawn.on('exit', function() {
                    spawn = null;
                    
                    if (!done) {
                        done = true;
                        callback();
                    }
                });
            },
            
            function (callback) {
                var v       = 'v' + version,
                    repo    = info.name,
                    owner   = info.author.split(' ')[0];
                
                grizzly(null, {
                    owner       : owner,
                    repo        : getRepoName(info),
                    tag_name    : v,
                    name        : repo + ' ' + v,
                    body        : chlog
                }, function(error) {
                    if (!error)
                        emitter.emit('data', 'release: ok');
                    
                    callback(error);
                });
            }
            
        ], function(error) {
            if (error)
                emitter.emit('error', error);
            
            emitter.emit('exit');
        });
        
        return emitter;
    }
        
    function rmLines(str, count) {
        return str
            .split('\n')
            .slice(count)
            .join('\n');
    }
    
    function markdown(str) {
        return str
            .replace(/fix:/g, '## fix')
            .replace(/feature:/g, '## feature');
    }
    
    function getRepoName(json) {
        return json.repository.url
            .split('/')
            .pop()
            .replace('.git', '');
    }
})();
