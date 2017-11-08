'use strict';

const grizzly = require('grizzly');
const jessy = require('jessy');
const isUndefined = (a) => typeof a === 'undefined';

module.exports = tag;

function tag(version, info, chlog, emitter, callback) {
    if (!info.release && !isUndefined(info.release))
        return callback();
    
    const tag = 'v' + version;
    const user = getUser(info);
    const repo = getRepoName(info);
    const name = info.name + ' ' + tag;
    const body = chlog;
    
    emitter.emit('data', `${user}/{repo}@${tag}\n`);
    emitter.emit('data', `${body}\n`);
    
    const data = {
        user,
        repo,
        tag,
        name,
        body,
    };
    
    grizzly(null, data, (error) => {
        if (!error) {
            emitter.emit('data', 'release: ok\n');
            return callback();
        }
        
        emitter.emit('data', 'Error releasing on github. Trying again.\n');
        tag(version, info, chlog, emitter, callback);
    });
}

function getRepoName(json) {
    return (jessy('repository.url', json) || '')
        .split('/')
        .pop()
        .replace('.git', '');
}

function getUser(json) {
    const FROM_USER = 3;
    const WITHOUT_REPO = -1;
    
    return json.repository.url
        .split('/')
        .slice(FROM_USER, WITHOUT_REPO)
        .pop();
}

