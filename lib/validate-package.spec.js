import {EventEmitter, once} from 'events';
import {test} from 'supertape';
import {validatePackage} from './validate-package.js';

test.only('wisdom: validate--package', async (t) => {
    const emitter = new EventEmitter();
    
    const [[result]] = await Promise.all([
        once(emitter, 'data'),
        validatePackage({
            emitter,
            info: {},
            version: '1.0.0',
        }),
    ]);
    
    const expected = '"repository.url" should be defined"';
    
    t.equal(result, expected);
    t.end();
});
