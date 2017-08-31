'use strict';

const path = require('path');
const spawnify = require('spawnify');
const redrun = require('redrun');
const env = require('redrun/lib/env');
const getEnv = require('./get-env');
const assign = Object.assign;

const dir = path.join(process.cwd(), 'node_modules', '.bin');
const PATH = env.path(process.env.PATH, path.delimiter, dir, path.sep);

module.exports = (name, type, version, info, emitter, callback) => {
    const versionType = !type ? '' : ` ${type}`;
    
    const scripts = info.scripts;
    const config = info.config;
    
    const envVars = assign({}, process.env, getEnv(version), env.config(config), {
        PATH,
        npm_package_version: info.version,
    });
    
    const cmd = redrun(name, scripts) + versionType;
    
    console.log('>', cmd);
    
    const spawn = spawnify(cmd, {
        env: envVars,
    });
    
    spawn.on('error', (error) => {
        emitter.emit('error', error);
    });
    
    spawn.on('data', (data) => {
        emitter.emit('data', data);
    });
    
    spawn.on('close', callback);
};

