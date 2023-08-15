import {test} from 'supertape';
import {parseCommitType} from './parse-commit-type.js';

test('wisdom: parseCommitType: default', (t) => {
    const result = parseCommitType({});
    
    t.equal(result, ': package:');
    t.end();
});

test('wisdom: parseCommitType: paren', (t) => {
    const info = {
        commitType: 'paren',
    };
    
    const result = parseCommitType(info);
    
    t.equal(result, '(package)');
    t.end();
});

test('wisdom: parseCommitType: colon', (t) => {
    const info = {
        name: 'hello',
        commitType: 'colon',
    };
    
    const result = parseCommitType(info);
    
    t.equal(result, ': hello:');
    t.end();
});
