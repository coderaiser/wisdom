'use strict';

const redrun = require('redrun');
const envir = require('envir');
const tryCatch = require('try-catch');
const getEnv = require('./get-env');
const {execSync} = require('child_process');
const {assign} = Object;

const PATH = process.env.PATH;
const cwd = process.cwd;

module.exports = (name, type, version, info, emitter, callback) => {
    const versionType = !type ? '' : ` ${type}`;
    const scripts = info.scripts;
    const cmd = redrun(name, scripts) + versionType;
    
    emitter.emit('data', `> ${cmd}\n`);
    
    const env = assign({}, process.env, envir(PATH, cwd(), info), getEnv(version), {
        PATH,
        npm_package_version: info.version,
    });
    
    const stdio = [0, 1, 2, 'pipe'];
    
    const [e] = tryCatch(execSync, cmd, {env, stdio});
    
    callback(e);
};

