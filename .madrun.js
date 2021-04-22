import {run} from 'madrun';

export default {
    'wisdom': () => 'echo wisdom: $wisdom_version',
    'wisdom:type': () => 'echo wisdom:type: $wisdom_version',
    'wisdom:done': () => 'npm i wisdom -g',
    'lint': () => 'putout .',
    'fix:lint': () => run('lint', '--fix'),
};

