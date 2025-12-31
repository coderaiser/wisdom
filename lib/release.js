import _grizzly from 'grizzly';
import {tryToCatch} from 'try-to-catch';
import {markdown} from './markdown.js';

const isUndefined = (a) => typeof a === 'undefined';
const rmScope = (a) => a.replace(/^@.*\//, '');

export async function release({version, info, chlog, emitter, count, grizzly = _grizzly}) {
    if (!info.release && !isUndefined(info.release)) {
        emitter.emit('data', 'release: false\n');
        return;
    }
    
    const tag = `v${version}`;
    
    if (!info.repository) {
        emitter.emit('data', `Error releasing on github: no 'repository' field found in 'package.json'\n`);
        return;
    }
    
    const user = getUser(info);
    const repo = getRepoName(info);
    
    emitter.emit('data', `${user}/${repo}@${tag}\n`);
    
    const name = rmScope(info.name) + ' ' + tag;
    const rawBody = chlog() || '';
    const body = markdown(rawBody);
    
    emitter.emit('data', rawBody);
    
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
        return;
    }
    
    if (count <= 0) {
        emitter.emit('data', `Error releasing on github: ${error.message}`);
        return;
    }
    
    --count;
    
    emitter.emit('data', `Error releasing on github: ${error.message}. ${count} tries left.\n`);
    
    return await release({
        version,
        info,
        chlog,
        emitter,
        count,
        grizzly,
    });
}

function getRepoName(json) {
    return json
        .repository
        .url
        .split('/')
        .pop()
        .replace('.git', '');
}

function getUser(json) {
    const FROM_USER = 3;
    const WITHOUT_REPO = -1;
    
    return json
        .repository
        .url
        .split('/')
        .slice(FROM_USER, WITHOUT_REPO)
        .pop();
}
