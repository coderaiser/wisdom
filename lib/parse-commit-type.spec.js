import {test} from 'supertape';
import {
    parseCommitType,
    PAREN,
    COLON,
} from './parse-commit-type.js';

test('wisdom: parseCommitType', (t) => {
    const result = parseCommitType();
    
    t.equal(result, PAREN);
    t.end();
});

test('wisdom: parseCommitType: paren', (t) => {
    const result = parseCommitType('paren');
    
    t.equal(result, PAREN);
    t.end();
});

test('wisdom: parseCommitType: colon', (t) => {
    const result = parseCommitType('colon');
    
    t.equal(result, COLON);
    t.end();
});
