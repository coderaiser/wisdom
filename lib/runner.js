import {promisify} from 'node:util';
import path from 'node:path';
import {execSync} from 'node:child_process';
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
        'wisdom': async () => {
            await runWisdom('wisdom', '', version, info, emitter);
        },
        'type': async () => {
            await runWisdom('wisdom:type', type, version, info, emitter);
        },
        'changelog': async () => {
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
        '!changelog': () => {
            emitter.emit('data', 'changelog: false\n');
        },
        'version': async () => {
            await versionio(version);
        },
        'build': async () => {
            await runWisdom('wisdom:build', '', version, info, emitter);
        },
        'commit': () => {
            execute(cmd, version, cwd);
        },
        'tag': () => {
            execute(cmdTag, version, cwd);
        },
        '!tag': () => {
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
        'done': async () => {
            await runWisdom('wisdom:done', '', version, info, emitter);
        },
    });
    
    if (error)
        emitter.emit('error', error);
    
    emitter.emit('exit');
};

function execute(cmd, version, cwd) {
    const stdio = [
        0,
        1,
        2,
        'pipe',
    ];
    
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
