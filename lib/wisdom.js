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
import {ask} from './prompts.js';

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

export default (version, {dryRun, force}) => {
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
            force,
        });
    });
    
    readPackageUp()
        .then(setInfoDir)
        .then(getPkg)
        .then(start(version, emitter))
        .catch(onError);
    
    return emitter;
};

async function publish({version, info, emitter, dryRun, force}) {
    let type = '--';
    let nextVersion;
    
    if (version.startsWith('v')) {
        nextVersion = version.slice(1);
        type += `v${version}`;
    } else if (/major|minor|patch/.test(version)) {
        type += version;
        nextVersion = minor(version, info.version);
    }
    
    if (!force && version === 'major' && !await ask(info.name, nextVersion))
        return;
    
    const cmd = rendy(Cmd, {
        version: nextVersion,
        commitType: parseCommitType(info.commitType),
        branch: info.branch || 'master',
    });
    
    const cmdTag = rendy(CmdTag, {
        version: nextVersion,
    });
    
    const paths = parse(info);
    
    if (dryRun) {
        emitter.emit('data', `${paths.join('\n')}\n`);
        return;
    }
    
    const cwd = InfoDirStore();
    
    await run(paths, {
        type,
        changelog,
        cwd,
        info,
        emitter,
        chlogStore,
        cmd,
        cmdTag,
        InfoDirStore,
        version: nextVersion,
    });
    
    return emitter;
}

