import {
    test,
    stub,
} from 'supertape';

import release from './release.js';

test('wisdom: release', (t) => {
    const version = 'v1.0.0';
    const count = 1;
    const info = {
        release: false,
    };
    
    const emitter = {
        emit: stub(),
    };
    
    const callback = stub();
    
    release({
        version,
        info,
        chlog: stub(),
        emitter,
        count,
    }, callback);
    
    t.calledWithNoArgs(callback);
    t.end();
});

