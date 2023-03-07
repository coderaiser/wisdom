export const PAREN = '(package)';
export const COLON = ': package:';

export const parseCommitType = (type = 'colon') => {
    if (type === 'paren')
        return PAREN;
    
    return COLON;
};

