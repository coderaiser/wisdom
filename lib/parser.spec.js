import {test} from 'supertape';
import {parse} from './parser.js';

test('wisdom: parser', (t) => {
    const info = {};
    
    const result = parse(info);
    const expected = [
        'changelog',
        ':version',
        ':commit',
        'tag',
        ':release',
        '-private',
    ];
    
    t.deepEqual(result, expected);
    t.end();
});

