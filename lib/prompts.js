import enquirer from 'enquirer';
import actions from 'enquirer/lib/combos.js';
import tryToCatch from 'try-to-catch';

const {Select, Confirm} = enquirer;

const custom = {
    h: 'left',
    j: 'down',
    k: 'up',
    l: 'right',
};

actions.keys = {
    ...actions.keys,
    ...custom,
};

export const choose = async () => {
    const prompt = new Select({
        name: 'version',
        message: 'What type of changes are you goint to publish 🎁 ?',
        choices: [
            'patch',
            'minor',
            'major',
        ],
    });
    
    return await run(prompt);
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
