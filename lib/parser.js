import jessy from 'jessy';

const isUndefined = (a) => typeof a === 'undefined';

/*
Determine if value should be used according to conditional prefixes:
^  exist
!  disabled
:  always
-  not exist, or disabled
   not exist, or enabled
*/

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

const check = (info) => (path) => {
    if (path.startsWith(':'))
        return true;
    
    const cleanPath = path.replace(/[!^:-]/, '');
    const result = jessy(cleanPath, info);
    
    if (path.startsWith('-'))
        return !result || isUndefined(result);
    
    if (path.startsWith('!'))
        return !result && !isUndefined(result);
    
    if (path.startsWith('^'))
        return Boolean(result);
    
    return Boolean(result) || isUndefined(result);
};

export const parse = (info) => {
    return paths.filter(check(info));
};

