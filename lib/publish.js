import {execSync} from 'node:child_process';
import getEnv from './get-env.js';

export const publish = ({cwd, version, execute = _execute}) => {
    execute(`npm publish --tag latest`, version, cwd);
};

function _execute(cmd, version, cwd) {
    const stdio = [
        0,
        1,
        2,
        'pipe',
    ];
    
    execSync(cmd, {
        env: getEnv(version),
        cwd,
        stdio,
    });
}
