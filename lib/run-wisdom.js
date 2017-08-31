'use strict';

const path = require('path');
const getEnv = require('./get-env');
const spawnify = require('spawnify');

const redrun = path.join(__dirname, '..', 'node_modules/.bin/redrun');

module.exports = (name, type, version, scripts, emitter, callback) => {
    const versionType = !type ? type : ` -- ${type}`;
    const cmd = `${redrun} ${name}${versionType}`;
    const spawn = spawnify(cmd, {
        env: getEnv(version)
    });
    
    spawn.on('error', (error) => {
        emitter.emit('error', error);
    });
    
    spawn.on('data', (data) => {
        emitter.emit('data', data);
    });
    
    spawn.on('close', callback);
};

