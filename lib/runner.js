import {promisify} from 'util';
import path from 'path';
import {execSync} from 'child_process';

import tryCatch from 'try-catch';
import tryToCatch from 'try-to-catch';
import _prepend from 'prepend';
import versionio from 'version-io';
import changelog from 'changelog-io';

import getEnv from './get-env.js';
import {release} from './release.js';
import runWisdom from './run-wisdom.js';
import {traverse} from './traverse.js';

const prepend = promisify(_prepend);

export const run = async (paths, params) => {
    const {
        info,
        emitter,
        version,
        chlogStore,
        cmd,
        cmdTag,
        type,
        cwd,
    } = params;
    
    const [error] = await tryToCatch(traverse, paths, {
        'scripts.wisdom': async () => {
            await runWisdom('wisdom', '', version, info, emitter);
        },
        'scripts.wisdom:type': async () => {
            await runWisdom('wisdom:type', type, version, info, emitter);
        },
        'changelog:true': async () => {
            const [error, data] = tryCatch(changelog, version);
            
            if (error) {
                error.message += '\n';
                throw error;
            }
            
            const name = path.join(cwd, 'ChangeLog');
            
            await prepend(name, data);
            
            const value = rmLines(data, 2);
            chlogStore(value);
        },
        'changelog:false': () => {
            emitter.emit('data', 'changelog: false\n');
        },
        'version': async () => {
            await versionio(version);
        },
        'scripts.wisdom:build': async () => {
            await runWisdom('wisdom:build', '', version, info, emitter);
        },
        'commit': () => {
            execute(cmd, version, cwd);
        },
        'tag:true': () => {
            execute(cmdTag, version, cwd);
        },
        'tag:false': () => {
            emitter.emit('data', 'tag: false\n');
        },
        'release': async () => {
            await release({
                version,
                info,
                chlog: chlogStore,
                emitter,
                count: info.releaseTriesCount || 10,
            });
        },
        'publish': () => {
            execute(`npm publish`, version, cwd);
        },
        'scripts.wisdom:done': async () => {
            await runWisdom('wisdom:done', '', version, info, emitter);
        },
    });
    
    if (error)
        emitter.emit('error', error);
    
    emitter.emit('exit');
};

function execute(cmd, version, cwd) {
    const stdio = [0, 1, 2, 'pipe'];
    
    execSync(cmd, {
        env: getEnv(version),
        cwd,
        stdio,
    });
}

function rmLines(str, count) {
    return str
        .split('\n')
        .slice(count)
        .join('\n');
}
