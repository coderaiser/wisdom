import {
    test,
    stub,
} from 'supertape';

import {release} from './release.js';

test('wisdom: release: emit', async (t) => {
    const version = 'v1.0.0';
    const count = 1;
    const info = {
        release: false
    };
    
    const emit = stub();
    const emitter = {
        emit,
    };
    
    const callback = stub();
    
    await release({
        version,
        info,
        chlog: stub().returns('xxx'),
        emitter,
        count,
    }, callback);
    
    const expected = ['data', 'release: false\n'];
    
    t.calledWith(emit, expected);
    t.end();
});

test('wisdom: release: repository.url', async (t) => {
    const version = 'v1.0.0';
    const count = 1;
    const info = {
        name: 'wisdom',
        release: true,
        repository: {
            url: 'https://github.com/coderaiser/wisdom',
        }
    };
    
    const emit = stub();
    const emitter = {
        emit,
    };
    
    const callback = stub();
    
    await release({
        version,
        info,
        chlog: stub().returns('xxx'),
        emitter,
        count,
    }, callback);
    
    const expected = ['data', 'Error releasing on github : Validation Failed: {\"resource\":\"Release\",\"code\":\"already_exists\",\"field\":\"tag_name\"}'];
    
    t.calledWith(emit, expected);
    t.end();
});

