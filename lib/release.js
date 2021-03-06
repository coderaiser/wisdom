import grizzly from 'grizzly';
import jessy from 'jessy';
import currify from 'currify';

const isUndefined = (a) => typeof a === 'undefined';

export default currify(setTag);

const rmScope = (a) => a.replace(/^@.*\//, '');

function setTag(version, info, chlog, emitter, callback) {
    if (!info.release && !isUndefined(info.release)) {
        emitter.emit('data', 'release: false\n');
        return callback();
    }
    
    const tag = 'v' + version;
    const user = getUser(info);
    const repo = getRepoName(info);
    const name = rmScope(info.name) + ' ' + tag;
    const body = chlog() || '';
    
    emitter.emit('data', `${user}/${repo}@${tag}\n`);
    emitter.emit('data', body);
    
    const data = {
        user,
        repo,
        tag,
        name,
        body,
    };
    
    grizzly(null, data)
        .then(() => {
            emitter.emit('data', 'release: ok\n');
            callback();
        })
        .catch(() => {
            emitter.emit('data', 'Error releasing on github. Trying again.\n');
            setTag(version, info, chlog, emitter, callback);
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

