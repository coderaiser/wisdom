import {execSync} from 'child_process';
import getEnv from './get-env.js';

export const publish = ({cwd, version}) => {
    execute(`npm publish`, version, cwd);
};

function execute(cmd, version, cwd) {
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
