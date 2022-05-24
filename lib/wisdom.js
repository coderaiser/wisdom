import path from 'path';
import {EventEmitter} from 'events';

import changelog from 'changelog-io';
import rendy from 'rendy';
import minor from 'minor';
import {readPackageUp} from 'read-pkg-up';
import fullstore from 'fullstore';
import currify from 'currify';

import {validatePackage} from './validate-package.js';
import {parseCommitType} from './parse-commit-type.js';
import {parse} from './parser.js';
import {run} from './runner.js';

const Cmd = [
    'git add --all',
    'git commit -m "chore{{ commitType }} v{{ version }}"',
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

export default (version, {dryRun}) => {
    const emitter = new EventEmitter();
    
    const onError = (e) => {
        const error = Error(`Error reading package.json: ${e.message}`);
        emitter.emit('error', error);
    };
    
    const start = currify(async (version, emitter, info) => {
        if (validatePackage({version, emitter, info}))
            return;
        
        await publish({
            version,
            info,
            emitter,
            dryRun,
        });
    });
    
    readPackageUp()
        .then(setInfoDir)
        .then(getPkg)
        .then(start(version, emitter))
        .catch(onError);
    
    return emitter;
};

async function publish({version, info, emitter, dryRun}) {
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
        commitType: parseCommitType(info.commitType),
        branch: info.branch || 'master',
    });
    
    const cmdTag = rendy(CmdTag, {
        version,
    });
    
    const paths = parse(info);
    
    if (dryRun) {
        emitter.emit('data', paths.join('\n'));
        return;
    }
    
    const cwd = InfoDirStore();
    
    await run(paths, {
        type,
        changelog,
        cwd,
        info,
        emitter,
        version,
        chlogStore,
        cmd,
        cmdTag,
        InfoDirStore,
    });
    
    return emitter;
}

