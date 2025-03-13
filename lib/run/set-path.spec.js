import {test} from 'supertape';
import {setPath} from './set-path.js';

test('wisdom: run: setPath', (t) => {
    const result = setPath('/bin');
    const expected = 'node_modules/.bin:/bin';
    
    t.equal(result, expected);
    t.end();
});
