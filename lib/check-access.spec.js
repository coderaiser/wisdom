import {test} from 'supertape';
import checkAccess from './check-access.js';

test('wisdom: check-access', (t) => {
    const result = checkAccess({
        publishConfig: {
            access: true,
        },
    });
    
    t.notOk(result);
    t.end();
});

test('wisdom: check-access: no', (t) => {
    const result = checkAccess({});
    
    t.ok(result);
    t.end();
});
