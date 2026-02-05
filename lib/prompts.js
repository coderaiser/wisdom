import enquirer from 'enquirer';
import {tryToCatch} from 'try-to-catch';
import {choose as chooseCLI} from '@putout/cli-choose';
import {initKeypressListen} from '@putout/cli-choose/keypress';

const {Confirm} = enquirer;

initKeypressListen();

export const choose = async () => {
    const choices = [
        'patch',
        'minor',
        'major',
    ];
    
    return await chooseCLI('What type of changes are you going to publish 🎁 ?', choices);
};

export const ask = async (name, version) => {
    const prompt = new Confirm({
        name: 'question',
        message: `Are you sure that you want to publish major version of '${name}': v${version}?`,
    });
    
    const [, answer] = await tryToCatch(run, prompt);
    return answer;
};

async function run(prompt) {
    const [, answer] = await tryToCatch(prompt.run.bind(prompt));
    return answer;
}
