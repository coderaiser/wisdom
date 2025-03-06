import {test, stub} from 'supertape';
import {publish} from './publish.js';

test('wisdom: publish: latest', (t) => {
    const execute = stub();
    const version = '1.0.0';
    
    const cwd = '.';
    
    publish({
        version,
        cwd,
        execute,
    });
    
    const args = ['npm publish --tag latest', version, cwd];
    
    t.calledWith(execute, args);
    t.end();
});
