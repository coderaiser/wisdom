import redrun from 'redrun';
import envir from 'envir';
import getEnv from './get-env.js';
import {execSync} from 'child_process';

const {PATH} = process.env;
const {cwd} = process;

export default async (name, type, version, info, emitter) => {
    const versionType = !type ? '' : ` ${type}`;
    const {scripts} = info;
    const cmd = await redrun(name, scripts) + versionType;
    
    emitter.emit('data', `> ${cmd}\n`);
    
    const env = {
        ...process.env,
        ...envir(PATH, cwd(), info),
        ...getEnv(version),
        PATH,
        npm_package_version: info.version,
    };
    
    const stdio = [0, 1, 2, 'pipe'];
    
    execSync(cmd, {env, stdio});
};

