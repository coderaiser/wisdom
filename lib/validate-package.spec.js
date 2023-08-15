import {
    EventEmitter,
    once,
} from 'events';
import {test} from 'supertape';
import montag from 'montag';
import {validatePackage} from './validate-package.js';

test('wisdom: validate--package', async (t) => {
    const emitter = new EventEmitter();
    
    const [[result]] = await Promise.all([
        once(emitter, 'data'),
        validatePackage({
            emitter,
            info: {},
            version: '1.0.0',
        }),
    ]);
    
    const expected = `'repository.url' should be defined`;
    
    t.equal(result, expected);
    t.end();
});

test('wisdom: validate-package: no "access" property', async (t) => {
    const emitter = new EventEmitter();
    
    const [[result]] = await Promise.all([
        once(emitter, 'data'),
        validatePackage({
            emitter,
            info: {
                name: '@putout/formatter-dump',
                repository: {
                    url: 'https://github.com/coderaiser/putout',
                },
            },
            version: '1.0.0',
        }),
    ]);
    
    const expected = `looks like '@putout/formatter-dump' has no 'access' property\n` + `packages should have 'access' property set to 'public' or 'restricted' inside 'publishConfig'\n`;
    
    t.equal(result, expected);
    t.end();
});

test('wisdom: validate-package: no "version" property', async (t) => {
    const emitter = new EventEmitter();
    
    const [[result]] = await Promise.all([
        once(emitter, 'data'),
        validatePackage({
            emitter,
            info: {
                name: '@putout/formatter-dump',
                publishConfig: {
                    access: 'public',
                },
                repository: {
                    url: 'https://github.com/coderaiser/putout',
                },
                version: '1.0.0',
            },
        }),
    ]);
    
    const expected = montag`
        publish <version>
        package: @putout/formatter-dump 1.0.0\n
    `;
    
    t.equal(result, expected);
    t.end();
});
