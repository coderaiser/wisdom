import enquirer from 'enquirer';
import actions from 'enquirer/lib/combos.js';
import tryToCatch from 'try-to-catch';
import {choose as chooseCLI} from '@putout/cli-choose';

const {Select, Confirm} = enquirer;

export const choose = async () => {
    return chooseCLI('What type of changes are you goint to publish 🎁 ?', [
        'patch',
        'minor',
        'major',
    ]);
};

export const ask = async (name, version) => {
    const prompt = new Confirm({
        name: 'question',
        message: `Are you sure that you want to publish major version of '${name}': v${version}?`,
    });
    
    return await run(prompt);
};

async function run(prompt) {
    const [, answer] = await tryToCatch(prompt.run.bind(prompt));
    return answer;
}
