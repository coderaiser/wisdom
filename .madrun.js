import {run, cutEnv} from 'madrun';

const testEnv = {};

export default {
    'test': () => [testEnv, `tape 'test/**/*.js' 'lib/**/*.spec.js'`],
    'coverage': async () => [testEnv, `c8 ${await cutEnv('test')}`],
    'report': () => 'c8 report --reporter=lcov',
    'wisdom': () => 'echo wisdom: $wisdom_version',
    'patch': () => 'node bin/wisdom.js patch',
    'minor': () => 'node bin/wisdom.js minor',
    'major': () => 'node bin/wisdom.js major',
    'wisdom:type': () => 'echo wisdom:type: $wisdom_version',
    'wisdom:done': () => 'npm i wisdom -g',
    'wisdom:build': () => 'echo "time for a build"',
    'lint': () => 'putout .',
    'fix:lint': () => run('lint', '--fix'),
};
