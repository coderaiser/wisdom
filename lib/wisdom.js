'use strict';

const path = require('path');
const EventEmitter= require('events').EventEmitter;

const versionio = require('version-io');
const changelog = require('changelog-io');
const rendy = require('rendy');
const spawnify = require('spawnify/legacy');
const series = require('async/series');
const minor = require('minor');
const prepend = require('prepend');
const grizzly = require('grizzly');
const readjson = require('readjson');
const writejson = require('writejson');
const jessy = require('jessy/legacy');
const readPkg = require('read-pkg-up');
const fullstore = require('fullstore');

const isUndefined = (a) => typeof a === 'undefined';

const Cmd = [
    'git add --all',
    'git commit -m "chore(package) v{{ version }}"',
    'git pull --rebase',
    'git push origin {{ branch }}',
].join('&&');

const CmdTag = [
    'git tag v{{ version }}',
    'git push origin v{{ version }}'
].join('&&');

const InfoData = fullstore();

const getPkg = (data) => data.pkg;

module.exports = (version) => {
    const emitter = new EventEmitter();
    
    readPkg()
        .then(InfoData)
        .then(getPkg)
        .then((info) => {
            if (!version)
                return emitter.emit('data',
                    `publish <version>\n` +
                    `package: ${ info.name } ${ info.version }`
                );
            
            publish(version, info, emitter);
        }).catch((error) => {
            error.message = `Error reading package.json: ${error.message}`;
            emitter.emit('error', error);
            return;
        });
    
    return emitter;
};

function publish(version, info, emitter) {
    let type = '--';
    let chlog = '';
    
    if (!version.indexOf('v')) {
        version = version.slice(1);
        type += 'v' + version;
    } else if (/major|minor|patch/.test(version)) {
        type += version;
        version = minor(version, info.version);
    }
    
    const cmd = rendy(Cmd, {
        version: version,
        branch: info.branch || 'master'
    });
    
    const cmdTag = rendy(CmdTag, {
        version: version
    });
    
    series([
        function beforePublish(callback) {
            const cmd = jessy('scripts.wisdom', info);
            
            if (!cmd)
                return callback();
            
            runWisdom('wisdom', type, version, emitter, callback);
        },
        
        (callback) => {
            if (!isUndefined(info.changelog) && !info.changelog) {
                emitter.emit('data', 'changelog: false\n');
                return callback();
            }
            
            changelog(version, (error, data) => {
                if (error) {
                    error.message += '\n';
                    callback(error);
                    return;
                }
                
                const dir = path.dirname(InfoData().path);
                const name = path.join(dir, 'ChangeLog');
                
                prepend(name, data, callback);
                
                chlog = rmLines(data, 2);
                chlog = markdown(chlog);
            });
        },
        
        (callback) => {
            versionio(version, callback);
        },
        
        (callback) => {
            readjson('bower.json', (error, json) => {
                if (error && error.code !== 'ENOENT')
                    return emitter.emit('error', error);
                
                if (error || !json.version)
                    return callback();
                
                emitter.emit('data', 'bower.version is deprecated (https://github.com/bower/spec/blob/master/json.md#version). Removing...\n');
                delete json.version;
                writejson('bower.json', json, {space: 2}, callback);
            });
        },
        
        (callback) => {
            execute(cmd, version, emitter, callback);
        },
        
        function release(callback) {
            if (!info.release && !isUndefined(info.release)) {
                emitter.emit('data', 'release: false\n');
                callback();
            } else {
                execute(cmdTag, version, emitter, callback);
            }
        },
        
        function publish(callback) {
            if (!info.release && !isUndefined(info.release))
                return callback();
            
            const v = 'v' + version;
            const data = {
                user: getUser(info),
                repo: getRepoName(info),
                tag: v,
                name: info.name + ' ' + v,
                body: chlog
            };
            
            grizzly(null, data, (error) => {
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
            const cmd = jessy('scripts.wisdom:done', info);
            
            if (!cmd)
                return callback();
            
            runWisdom('wisdom:done', null, version, emitter, callback);
        },
    ], (error) => {
        if (error)
            emitter.emit('error', error);
        
        emitter.emit('exit');
    });
    
    return emitter;
}

function getEnv(version) {
    return Object.assign(process.env, {
        wisdom_version: version,
        WISDOM_VERSION: version
    });
}

function execute(cmd, version, emitter, callback) {
    let rejected;
    
    const spawn = spawnify(cmd, {
        env: getEnv(version)
    });
    
    spawn.on('error', (error) => {
        rejected = ~error.message.indexOf('rejected');
        
        emitter.emit('error', error);
        
        if (rejected)
            callback(error);
    });
    
    spawn.on('data', (data) => {
        emitter.emit('data', data);
    });
    
    spawn.on('exit', () => {
        if (!rejected)
            callback();
    });
}

function runWisdom(name, type, version, emitter, callback) {
    let array = ['npm', 'run', name];
    
    if (type)
        array = array.concat('--', type);
    
    const cmd = array.join(' ');
    const spawn = spawnify(cmd, {
        env: getEnv(version)
    });
    
    spawn.on('error', (error) => {
        emitter.emit('error', error);
    });
    
    spawn.on('data', (data) => {
        emitter.emit('data', data);
    });
    
    spawn.on('close', callback);
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
    const FROM_USER = 3;
    const WITHOUT_REPO = -1;
    
    return json.repository.url
        .split('/')
        .slice(FROM_USER, WITHOUT_REPO)
        .pop();
}

