import jessy from 'jessy';

const {isArray} = Array;

const maybeArray = (a) => isArray(a) ? a : [a];

const paths = [
    'scripts.wisdom',
    'scripts.wisdom:type',
    'changelog',
    ['changelog', false],
    ':version',
    'scripts:wisdom:build',
    ':commit',
    'tag',
    ['tag', false],
    ':release',
    '!private',
    'scripts.wisdom:done',
];

const check = (info) => (data) => {
    const [path, value = 'any'] = maybeArray(data);
    
    if (path.startsWith(':'))
        return true;
    
    const result = jessy(path, info);
    
    if (path.startsWith('!'))
        return !result;
    
    if (value === 'any')
        return Boolean(result);
    
    return result === value;
};

export const parse = (info) => {
    return paths.filter(check(info));
};

