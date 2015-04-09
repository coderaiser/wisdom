(function() {
    'use strict';
    
    var EventEmitter= require('events').EventEmitter,
        
        versionio   = require('version-io'),
        changelog   = require('changelog-io'),
        rendy       = require('rendy'),
        spawnify    = require('spawnify'),
        async       = require('async'),
        minor       = require('minor'),
        prepend     = require('prepend'),
        grizzly     = require('grizzly'),
        readjson    = require('readjson'),
        jessy       = require('jessy'),
        
        Cmd         = [
            'git add --all',
            'git commit -m "chore(package) v{{ version }}"',
            'git pull --rebase',
            'git push origin master',
        ].join('&&'),
        
        CmdTag      = [
            'git tag v{{ version }}',
            'git push origin v{{ version }}'
        ].join('&&'),
        
        MSG         = [ 'publish <version>',
                        'package: {{ name }} v{{ version }}'
                    ].join('\n');
    
    module.exports  = function(version) {
        var emitter = new EventEmitter(),
            name    = process.cwd() + '/package.json';
        
        readjson(name, function(error, info) {
            var msg;
            
            if (error) {
                msg             = error.message;
                error.message   = 'Error reading package.json: ' + msg;
                emitter.emit('error', error);
            } else if (!version) {
                emitter.emit('data', rendy(MSG, {
                    name    : info.name,
                    version : info.version
                }));
            } else {
                publish(version, info, emitter);
            }
        });
        
        return emitter;
    };
        
    function publish(version, info, emitter) {
        var cmd,
            cmdTag,
            type        = '--',
            chlog       = '';
        
        if (!version.indexOf('v')) {
            version  = version.slice(1);
            type    += 'v' + version;
        } else if (/major|minor|patch/.test(version)) {
            type    += version;
            version  = minor(version, info.version);
        }
        
        cmd = rendy(Cmd, {
            version: version
        });
        
        cmdTag = rendy(CmdTag, {
            version: version
        });
        
        async.series([
            function beforePublish(callback) {
                var cmd     = jessy('scripts.wisdom', info);
                
                if (!cmd)
                    callback();
                else
                    runWisdom(type, emitter, callback);
            },
            
            function(callback) {
                var isUndefined = typeof info.changelog === 'undefined';
                
                if (!isUndefined && !info.changelog) {
                    console.error('changelog: false');
                    callback();
                } else {
                    changelog(version, function(error, data) {
                        if (error) {
                            callback(error);
                        } else {
                            prepend('ChangeLog', data, callback);
                            
                            chlog = rmLines(data, 2);
                            chlog = markdown(chlog);
                        }
                    });
                }
            },
            
            function(callback) {
                versionio(version, callback);
            },
            
            function(callback) {
                versionio(version, {name: 'bower'}, function(error) {
                    if (error && error.code !== 'ENOENT')
                        console.error(error);
                    
                    callback();
                });
            },
            
            function(callback) {
               execute(cmd, emitter, callback);
            },
            
            function release(callback) {
                var isUndefined = typeof info.release === 'undefined';
                
                if (!isUndefined && !info.release) {
                    console.error('release: false');
                    npmPublish(callback);
                } else {
                    execute(cmdTag, emitter, callback);
                }
            },
            
            function publish(callback) {
                var v       = 'v' + version,
                    repo    = getRepoName(info),
                    owner   = getOwner(info),
                    data    = {
                        owner       : owner,
                        repo        : repo,
                        tag_name    : v,
                        name        : info.name + ' ' + v,
                        body        : chlog
                    };
                
                grizzly(null, data, function(error) {
                    if (!error)
                        emitter.emit('data', 'release: ok');
                    else {
                        console.log('Error releasing on github. Trying again.');
                        publish(callback);
                    }
                    
                    callback(error);
                });
            },
            
            npmPublish.bind(null, info, emitter),
            
        ], function(error) {
            if (error)
                emitter.emit('error', error);
            
            emitter.emit('exit');
        });
        
        return emitter;
    }
    
    function npmPublish(info, emitter, callback) {
        if (!info.private)
            execute('npm publish', emitter, callback);
    }
    
    function execute(cmd, emitter, callback) {
        var rejected,
            spawn = spawnify(cmd);
        
        spawn.on('error', function(error) {
            rejected = ~error.message.indexOf('rejected');
            
            emitter.emit('error', error);
            
            if (rejected)
                callback(error);
        });
        
        spawn.on('data', function(data) {
            emitter.emit('data', data);
        });
        
        spawn.on('exit', function() {
            spawn = null;
            
            if (!rejected)
                callback();
        });
    }
    
    function runWisdom(type, emitter, callback) {
        var isError,
            spawn = spawnify('npm run wisdom -- ' + type);
        
        spawn.on('error', function(error) {
            isError = true;
            emitter.emit('error', error);
        });
        
        spawn.on('data', function(data) {
            emitter.emit('data', data);
        });
        
        spawn.on('close', function() {
            var error;
            
            if (isError)
                error = Error('before publish');
            
            callback(error);
        });
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
    
    function getOwner(json) {
        var FROM_OWNER   = 3,
            WITHOUT_REPO = -1;
        
        return json.repository.url
            .split('/')
            .slice(FROM_OWNER, WITHOUT_REPO)
            .pop();
    }
})();
