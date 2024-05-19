import enquirer from 'enquirer';
import tryToCatch from 'try-to-catch';
import {choose as chooseCLI} from '@putout/cli-choose';

const {Confirm} = enquirer;

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
    
    return await run(prompt);
};

async function run(prompt) {
    const [, answer] = await tryToCatch(prompt.run.bind(prompt));
    return answer;
}
