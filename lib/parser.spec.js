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

test('wisdom: parser: private', (t) => {
    const info = {
        private: true,
    };
    
    const result = parse(info);
    const expected = [
        'changelog',
        ':version',
        ':commit',
        'tag',
        ':release',
    ];
    
    t.deepEqual(result, expected);
    t.end();
});

test('wisdom: parser: private: disabled', (t) => {
    const info = {
        private: false,
    };
    
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
