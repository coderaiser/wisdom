'use strict';

const redrun = require('redrun');
const envir = require('envir');
const getEnv = require('./get-env');
const {execSync} = require('child_process');

const {PATH} = process.env;
const {cwd} = process;

module.exports = (name, type, version, info, emitter) => {
    const versionType = !type ? '' : ` ${type}`;
    const {scripts} = info;
    const cmd = redrun(name, scripts) + versionType;
    
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

