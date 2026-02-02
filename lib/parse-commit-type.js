export const parseCommitType = (info) => {
    const {
        name = 'package',
        commitType = 'colon',
    } = info;
    
    if (commitType === 'paren')
        return `(${name})`;
    
    return `: ${name}:`;
};
