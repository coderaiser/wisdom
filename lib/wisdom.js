'use strict';

var EventEmitter= require('events').EventEmitter;

var versionio = require('version-io');
var changelog = require('changelog-io');
var rendy = require('rendy');
var spawnify = require('spawnify/legacy');
var series = require('async/series');
var minor = require('minor');
var prepend = require('prepend');
var grizzly = require('grizzly');
var readjson = require('readjson');
var writejson = require('writejson');
var jessy = require('jessy/legacy');

var Cmd = [
    'git add --all',
    'git commit -m "chore(package) v{{ version }}"',
    'git pull --rebase',
    'git push origin {{ branch }}',
].join('&&');

var CmdTag = [
    'git tag v{{ version }}',
    'git push origin v{{ version }}'
].join('&&');

var MSG = [
    'publish <version>',
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
        version: version,
        branch: info.branch || 'master'
    });
    
    cmdTag = rendy(CmdTag, {
        version: version
    });
    
    series([
        function beforePublish(callback) {
            var cmd = jessy('scripts.wisdom', info);
            
            if (!cmd)
                return callback();
            
            runWisdom('wisdom', type, version, emitter, callback);
        },
        
        function(callback) {
            var isUndefined = typeof info.changelog === 'undefined';
            
            if (!isUndefined && !info.changelog) {
                emitter.emit('data', 'changelog: false\n');
                callback();
            } else {
                changelog(version, function(error, data) {
                    if (error) {
                        error.message += '\n';
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
            readjson('bower.json', function(error, json) {
                if (error && error.code !== 'ENOENT')
                    return emitter.emit('error', error);
                
                if (error || !json.version) {
                    callback();
                } else {
                    emitter.emit('data', 'bower.version is deprecated (https://github.com/bower/spec/blob/master/json.md#version). Removing...\n');
                    delete json.version;
                    writejson('bower.json', json, {space: 2}, callback);
                }
            });
        },
        
        function(callback) {
           execute(cmd, version, emitter, callback);
        },
        
        function release(callback) {
            if (!info.release && info.release !== undefined) {
                emitter.emit('data', 'release: false\n');
                callback();
            } else {
                execute(cmdTag, version, emitter, callback);
            }
        },
        
        function publish(callback) {
            if (!info.release && info.release !== undefined)
                return callback();
            
            var v = 'v' + version;
            var data = {
                user: getUser(info),
                repo: getRepoName(info),
                tag: v,
                name: info.name + ' ' + v,
                body: chlog
            };
            
            grizzly(null, data, function(error) {
                if (!error) {
                    emitter.emit('data', 'release: ok\n');
                    callback();
                } else {
                    emitter.emit('data', 'Error releasing on github. Trying again.\n');
                    publish(callback);
                }
            });
        },
       
        function npmPublish(callback) {
            if (info.private)
                return callback();
            
            execute('npm publish', version, emitter, callback);
        },
        
        function afterPublish(callback) {
            var cmd = jessy('scripts.wisdom:done', info);
            
            if (!cmd)
                return callback();
            
            runWisdom('wisdom:done', null, version, emitter, callback);
        },
    ], function(error) {
        if (error)
            emitter.emit('error', error);
        
        emitter.emit('exit');
    });
    
    return emitter;
}

function getEnv(version) {
    var assign = Object.assing || objectAssign;
    
    return assign(process.env, {
        wisdom_version: version
    });
}

function execute(cmd, version, emitter, callback) {
    var rejected;
    
    var spawn = spawnify(cmd, {
        env: getEnv(version)
    });
    
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

function runWisdom(name, type, version, emitter, callback) {
    var isError;
    var array = ['npm', 'run', name];
    
    if (type)
        array = array.concat('--', type);
    
    var cmd     = array.join(' ');
    var spawn   = spawnify(cmd, {
        env: getEnv(version)
    });
    
    spawn.on('error', function(error) {
        isError = true;
        emitter.emit('error', error);
    });
    
    spawn.on('data', function(data) {
        emitter.emit('data', data);
    });
    
    spawn.on('close', function() {
        callback();
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
        .replace(/\bfix\b:/g, '## fix')
        .replace(/\bfeature\b:/g, '## feature');
}

function getRepoName(json) {
    return json.repository.url
        .split('/')
        .pop()
        .replace('.git', '');
}

function getUser(json) {
    var FROM_USER = 3;
    var WITHOUT_REPO = -1;
    
    return json.repository.url
        .split('/')
        .slice(FROM_USER, WITHOUT_REPO)
        .pop();
}

function objectAssign() {
     const o = {};
     
    [].forEach.call(arguments, (obj) => {
        Object.keys(obj).forEach((k) => {
            o[k] = obj[k];
        });
    });
    
    return o;
}

