'use strict';

const spawnify = require('spawnify');
const redrun = require('redrun');
const envir = require('envir');
const currify = require('currify/legacy');
const getEnv = require('./get-env');
const assign = Object.assign;

const PATH = process.env.PATH;
const cwd = process.cwd;

module.exports = (name, type, version, info, emitter, callback) => {
    const versionType = !type ? '' : ` ${type}`;
    const scripts = info.scripts;
    const cmd = redrun(name, scripts) + versionType;
    
    emitter.emit('data', `> ${cmd}\n`);
    
    const on = currify((event, data) => {
        emitter.emit(event, data);
    });
    
    const env = assign({}, process.env, envir(PATH, cwd(), info), getEnv(version), {
        PATH,
        npm_package_version: info.version,
    });
    
    spawnify(cmd, {env})
        .on('error', on('error'))
        .on('data', on('data'))
        .on('close', callback);
};

