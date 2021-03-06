import {promisify} from 'util';
import path from 'path';
import {execSync} from 'child_process';
import {EventEmitter} from 'events';

import tryCatch from 'try-catch';
import tryToCatch from 'try-to-catch';
import versionio from 'version-io';
import changelog from 'changelog-io';
import rendy from 'rendy';
import series from 'async/series.js';
import minor from 'minor';
import jessy from 'jessy';
import {readPackageUpAsync} from 'read-pkg-up';
import fullstore from 'fullstore';
import currify from 'currify';

import _prepend from 'prepend';

const prepend = promisify(_prepend);

import checkAccess from './check-access.js';

import runWisdom from './run-wisdom.js';
import release from './release.js';
import getEnv from './get-env.js';

const isUndefined = (a) => typeof a === 'undefined';

const Cmd = [
    'git add --all',
    'git commit -m "chore(package) v{{ version }}"',
    'git pull --rebase',
    'git push origin {{ branch }}',
].join('&&');

const CmdTag = [
    'git tag v{{ version }}',
    'git push origin v{{ version }}',
].join('&&');

const chlogStore = fullstore();
const InfoDirStore = fullstore();

const setInfoDir = (data) => {
    const dir = path.dirname(data.path);
    
    InfoDirStore(dir);
    
    return data;
};

const getPkg = (data) => data.packageJson;

export default (version) => {
    const emitter = new EventEmitter();
    
    const onError = (e) => {
        const error = Error(`Error reading package.json: ${e.message}`);
        emitter.emit('error', error);
    };
    
    const start = currify((version, emitter, info) => {
        if (info.name.includes('@') && checkAccess(info))
            return emitter.emit(
                'data',
                `looks like ${info.name} has no access property\n` +
                `packages should have "access" property set to "public" or "restricted"\n`,
            );
        
        if (!version)
            return emitter.emit(
                'data',
                `publish <version>\n` +
                `package: ${ info.name } ${ info.version }\n`,
            );
        
        publish(version, info, emitter);
    });
    
    readPackageUpAsync()
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
        branch: info.branch || 'master',
    });
    
    const cmdTag = rendy(CmdTag, {
        version,
    });
    
    series([
        async function beforePublish() {
            const cmd = jessy('scripts.wisdom', info);
            
            if (!cmd)
                return;
            
            await runWisdom('wisdom', '', version, info, emitter);
        },
        
        async function beforePublishType() {
            const cmd = jessy('scripts.wisdom:type', info);
            
            if (!cmd)
                return;
            
            await runWisdom('wisdom:type', type, version, info, emitter);
        },
        
        async () => {
            if (!isUndefined(info.changelog) && !info.changelog) {
                emitter.emit('data', 'changelog: false\n');
                return;
            }
            
            const [error, data] = await tryToCatch(changelog, version);
            
            if (error) {
                error.message += '\n';
                throw error;
            }
            
            const name = path.join(InfoDirStore(), 'ChangeLog');
            
            await prepend(name, data);
            
            const value = rmLines(data, 2);
            chlogStore(markdown(value));
        },
        
        async () => {
            await versionio(version);
        },
        
        (callback) => {
            execute(cmd, version, emitter, callback);
        },
        
        function tag(callback) {
            const isNoTag = !info.tag && !isUndefined(info.tag);
            
            if (isNoTag) {
                emitter.emit('data', 'tag: false\n');
                return callback();
            }
            
            execute(cmdTag, version, emitter, callback);
        },
        
        release(version, info, chlogStore, emitter),
        
        function npmPublish(callback) {
            if (info.private)
                return callback();
            
            execute(`npm publish`, version, emitter, callback);
        },
        
        async function afterPublish() {
            const cmd = jessy('scripts.wisdom:done', info);
            
            if (!cmd)
                return;
            
            await runWisdom('wisdom:done', '', version, info, emitter);
        },
    ], (error) => {
        if (error)
            emitter.emit('error', error);
        
        emitter.emit('exit');
    });
    
    return emitter;
}

function execute(cmd, version, emitter, callback) {
    const stdio = [0, 1, 2, 'pipe'];
    
    const [e] = tryCatch(execSync, cmd, {
        env: getEnv(version),
        cwd: InfoDirStore(),
        stdio,
    });
    
    callback(e);
}

function rmLines(str, count) {
    return str
        .split('\n')
        .slice(count)
        .join('\n');
}

function markdown(str) {
    return str
        .replace(/\bfix\b:/g, '## 🐞 fix')
        .replace(/\bfeature\b:/g, '## 🔥 feature');
}

