import grizzly from 'grizzly';
import currify from 'currify';
import tryToCatch from 'try-to-catch';

const isUndefined = (a) => typeof a === 'undefined';

export default currify(setTag);

const rmScope = (a) => a.replace(/^@.*\//, '');

async function setTag(version, info, chlog, emitter, callback) {
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
    
    const [error] = await tryToCatch(grizzly, null, data);
    
    if (!error) {
        emitter.emit('data', 'release: ok\n');
        return callback();
    }
    
    emitter.emit('data', `Error releasing on github : ${error.message}. Trying again.\n`);
    await setTag(version, info, chlog, emitter, callback);
}

function getRepoName(json) {
    return json.repository.url
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

