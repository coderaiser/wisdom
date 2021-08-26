import {run} from 'madrun';

export default {
    'test': () => `tape 'test/**/*.js' 'lib/**/*.spec.js'`,
    'coverage': async () => `c8 --exclude="lib/**/{fixture,*.spec.js}" ${await run('test')}`,
    'report': () => 'c8 report --reporter=lcov',
    'wisdom': () => 'echo wisdom: $wisdom_version',
    'patch': () => 'node bin/wisdom.js patch',
    'minor': () => 'node bin/wisdom.js minor',
    'major': () => 'node bin/wisdom.js major',
    'wisdom:type': () => 'echo wisdom:type: $wisdom_version',
    'wisdom:done': () => 'npm i wisdom -g',
    'lint': () => 'putout .',
    'fix:lint': () => run('lint', '--fix'),
};

