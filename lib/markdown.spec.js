import {test} from 'supertape';
import montag from 'montag';
import {markdown} from './markdown.js';

test('wisdom: markdown', (t) => {
    const str = montag`
        fix:
        - (wisdom) release
        
        feature:
        - (wisdom) release
    `;
    
    const result = markdown(str);
    
    const expected = montag`
        ## 🐞 fix
        
        - (wisdom) release
        
        ## 🔥 feature
        
        - (wisdom) release
    `;
    
    t.equal(result, expected);
    t.end();
});
