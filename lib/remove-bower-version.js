'use strict';

const readjson = require('readjson');
const writejson = require('writejson');

const name = 'bower.json';

module.exports = (emitter, callback) => {
    readjson(name, (error, json) => {
        if (error && error.code !== 'ENOENT')
            return emitter.emit('error', error);
        
        if (error || !json.version)
            return callback();
        
        emitter.emit('data', 'bower.version is deprecated (https://github.com/bower/spec/blob/master/json.md#version). Removing...\n');
        delete json.version;
        writejson(name, json, {space: 2}, callback);
    });
};

