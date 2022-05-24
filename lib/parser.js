import jessy from 'jessy';

const {isArray} = Array;

const maybeArray = (a) => isArray(a) ? a : [a];

const isUndefined = (a) => typeof a === 'undefined';

const paths = [
    '^scripts.wisdom',
    '^scripts.wisdom:type',
    'changelog',
    '!changelog',
    ':version',
    '^scripts.wisdom:build',
    ':commit',
    'tag',
    '!tag',
    ':release',
    '-private',
    '^scripts.wisdom:done',
];

const check = (info) => (data) => {
    const [path] = maybeArray(data);
    
    if (path.startsWith(':'))
        return true;
    
    const cleanPath = path.replace(/[!^:]/, '');
    const result = jessy(cleanPath, info);
    
    if (path.startsWith('-'))
        return !result || isUndefined(result);
    
    if (path.startsWith('!'))
        return !result;
    
    if (path.startsWith('^'))
        return Boolean(result);
    
    return Boolean(result) || isUndefined(result);
};

export const parse = (info) => {
    return paths.filter(check(info));
};

