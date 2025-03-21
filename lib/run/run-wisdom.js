import {execSync} from 'node:child_process';
import process from 'node:process';
import {join} from 'node:path';
import {statSync} from 'node:fs';
import redrun from 'redrun';
import envir from 'envir';
import parentDirectories from 'parent-directories';
import tryCatch from 'try-catch';
import getEnv from '../get-env.js';

const {PATH} = process.env;
const {cwd} = process;

export default async (name, type, version, info, emitter) => {
    const versionType = !type ? '' : ` ${type}`;
    const {scripts} = info;
    const cmd = await redrun(name, scripts) + versionType;
    
    emitter.emit('data', `> ${cmd}\n`);
    
    const env = {
        ...process.env,
        ...getEnv(version),
        npm_package_version: info.version,
        ...envir(PATH, nodeModulesDir(cwd()), info),
    };
    
    const stdio = [
        0,
        1,
        2,
        'pipe',
    ];
    
    execSync(cmd, {
        env,
        stdio,
    });
};

function nodeModulesDir(cwd) {
    for (const dir of parentDirectories(cwd)) {
        const nodeModulesPath = join(dir, 'node_modules');
        const [error] = tryCatch(statSync, nodeModulesPath);
        
        if (!error)
            return dir;
    }
    
    return cwd;
}
