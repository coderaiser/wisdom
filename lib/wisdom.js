'use strict';

const path = require('path');
const EventEmitter= require('events').EventEmitter;

const versionio = require('version-io');
const changelog = require('changelog-io');
const rendy = require('rendy');
const spawnify = require('spawnify');
const series = require('async/series');
const minor = require('minor');
const prepend = require('prepend');
const jessy = require('jessy');
const readPkg = require('read-pkg-up');
const fullstore = require('fullstore');
const currify = require('currify/legacy');

const runWisdom = require('./run-wisdom');
const tag = currify(require('./tag'));
const getEnv = require('./get-env');

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

const chlog = fullstore();
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
    
    if (!version.indexOf('v')) {
        version = version.slice(1);
        type += 'v' + version;
    } else if (/major|minor|patch/.test(version)) {
        type += version;
        version = minor(version, info.version);
    }
    
    const cmd = rendy(Cmd, {
        version,
        branch: info.branch || 'master'
    });
    
    const cmdTag = rendy(CmdTag, {
        version,
    });
    
    series([
        function beforePublish(callback) {
            const cmd = jessy('scripts.wisdom', info);
            
            if (!cmd)
                return callback();
            
            runWisdom('wisdom', '', version, info, emitter, callback);
        },
        
        function beforePublishType(callback) {
            const cmd = jessy('scripts.wisdom:type', info);
            
            if (!cmd)
                return callback();
            
            runWisdom('wisdom:type', type, version, info, emitter, callback);
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
                
                const value = rmLines(data, 2);
                chlog(markdown(value));
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
        
        tag(version, info, chlog, emitter),
        
        function npmPublish(callback) {
            if (info.private)
                return callback();
            
            execute('npm publish --access=public', version, emitter, callback);
        },
        
        function afterPublish(callback) {
            const cmd = jessy('scripts.wisdom:done', info);
            
            if (!cmd)
                return callback();
            
            runWisdom('wisdom:done', '', version, info, emitter, callback);
        },
    ], (error) => {
        if (error)
            emitter.emit('error', error);
        
        emitter.emit('exit');
    });
    
    return emitter;
}

function execute(cmd, version, emitter, callback) {
    let rejected;
    
    const spawn = spawnify(cmd, {
        env: getEnv(version),
        cwd: InfoDir(),
        stdio: [0, 1, 2, 'pipe'],
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

