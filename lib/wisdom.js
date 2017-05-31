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
const jessy = require('jessy/legacy');
const readPkg = require('read-pkg-up');
const fullstore = require('fullstore');
const currify = require('currify');

const removeBowerVersion = currify(require('./remove-bower-version'));

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

const InfoDir = fullstore();

const setInfoDir = (data) => {
    const dir = path.dirname(data.path);
    
    InfoDir(dir);
    
    return data;
};

const getPkg = (data) => data.pkg;

module.exports = (version) => {
    const emitter = new EventEmitter();
    
    const onError = (e) => {
        const error = Error(`Error reading package.json: ${e.message}`);
        emitter.emit('error', error);
    };
    
    const start = currify((version, emitter, info) => {
        if (!version)
            return emitter.emit('data',
                `publish <version>\n` +
                `package: ${ info.name } ${ info.version }`
            );
        
        publish(version, info, emitter);
    });
    
    readPkg()
        .then(setInfoDir)
        .then(getPkg)
        .then(start(version, emitter))
        .catch(onError);
    
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
                
                const name = path.join(InfoDir(), 'ChangeLog');
                
                prepend(name, data, callback);
                
                chlog = rmLines(data, 2);
                chlog = markdown(chlog);
            });
        },
        
        (callback) => {
            versionio(version, callback);
        },
        
        removeBowerVersion(emitter),
        
        (callback) => {
            execute(cmd, version, emitter, callback);
        },
        
        function release(callback) {
            const isNoRelease = !info.release && !isUndefined(info.release);
            
            if (isNoRelease) {
                emitter.emit('data', 'release: false\n');
                return callback();
            }
            
            execute(cmdTag, version, emitter, callback);
        },
        
        function publish(callback) {
            if (!info.release && !isUndefined(info.release))
                return callback();
            
            const tag = 'v' + version;
            const data = {
                user: getUser(info),
                repo: getRepoName(info),
                tag,
                name: info.name + ' ' + tag,
                body: chlog
            };
            
            grizzly(null, data, (error) => {
                if (!error) {
                    emitter.emit('data', 'release: ok\n');
                    return callback();
                }
                
                emitter.emit('data', 'Error releasing on github. Trying again.\n');
                publish(callback);
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
        env: getEnv(version),
        cwd: InfoDir(),
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
    return (jessy('repository.url', json) || '')
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

