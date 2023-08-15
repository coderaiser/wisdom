import {
    test,
    stub,
} from 'supertape';
import {createMockImport} from 'mock-import';
import {release} from './release.js';

const {
    mockImport,
    reImport,
    stopAll,
} = createMockImport(import.meta.url);

test('wisdom: release: emit', async (t) => {
    const version = 'v1.0.0';
    const count = 1;
    const info = {
        release: false,
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
    
    const expected = [
        'data',
        'release: false\n',
    ];
    
    t.calledWith(emit, expected);
    t.end();
});

test('wisdom: release: emit: no repository', async (t) => {
    const version = 'v1.0.0';
    const count = 1;
    const info = {};
    
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
    
    const expected = [
        'data',
        `Error releasing on github: no 'repository' field found in 'package.json'\n`,
    ];
    
    t.calledWith(emit, expected);
    t.end();
});

test('wisdom: release: repository.url: no chlog', async (t) => {
    const version = 'v1.0.0';
    const count = 1;
    const info = {
        name: 'wisdom',
        release: true,
        repository: {
            url: 'https://github.com/coderaiser/wisdom',
        },
    };
    
    const grizzly = stub().rejects(Error('Validation Failed: {"resource":"Release","code":"already_exists","field":"tag_name"}'));
    
    mockImport('grizzly', grizzly);
    
    const emit = stub();
    const emitter = {
        emit,
    };
    
    const callback = stub();
    
    const {release} = await reImport('./release');
    await release({
        version,
        info,
        chlog: stub(),
        emitter,
        count,
    }, callback);
    
    const expected = [
        'data',
        `Error releasing on github: Validation Failed: {"resource":"Release","code":"already_exists","field":"tag_name"}`,
    ];
    
    stopAll();
    
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
        },
    };
    
    const grizzly = stub().rejects(Error('Validation Failed: {"resource":"Release","code":"already_exists","field":"tag_name"}'));
    
    mockImport('grizzly', grizzly);
    
    const emit = stub();
    const emitter = {
        emit,
    };
    
    const callback = stub();
    
    const {release} = await reImport('./release');
    await release({
        version,
        info,
        chlog: stub().returns(''),
        emitter,
        count,
    }, callback);
    
    const expected = [
        'data',
        `Error releasing on github: Validation Failed: {"resource":"Release","code":"already_exists","field":"tag_name"}`,
    ];
    
    stopAll();
    
    t.calledWith(emit, expected);
    t.end();
});

test('wisdom: release: repository.url: no error', async (t) => {
    const version = 'v1.0.0';
    const count = 1;
    const info = {
        name: 'wisdom',
        release: true,
        repository: {
            url: 'https://github.com/coderaiser/wisdom',
        },
    };
    
    const grizzly = stub().resolves();
    
    mockImport('grizzly', grizzly);
    
    const emit = stub();
    const emitter = {
        emit,
    };
    
    const callback = stub();
    
    const {release} = await reImport('./release');
    await release({
        version,
        info,
        chlog: stub().returns(''),
        emitter,
        count,
    }, callback);
    
    const expected = [
        'data',
        `release: ok\n`,
    ];
    
    stopAll();
    
    t.calledWith(emit, expected);
    t.end();
});

test('wisdom: release: repository.url: exist', async (t) => {
    const version = 'v1.0.0';
    const count = 1;
    const info = {
        name: 'wisdom',
        release: true,
        repository: {
            url: 'https://github.com/coderaiser/wisdom',
        },
    };
    
    const grizzly = stub().resolves();
    
    mockImport('grizzly', grizzly);
    
    const emit = stub();
    const emitter = {
        emit,
    };
    
    const callback = stub();
    
    const {release} = await reImport('./release');
    await release({
        version,
        info,
        chlog: stub().returns(''),
        emitter,
        count,
    }, callback);
    
    const expected = [
        'data',
        `release: ok\n`,
    ];
    stopAll();
    
    t.calledWith(emit, expected);
    t.end();
});
