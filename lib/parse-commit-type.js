export const PAREN = '(package)';
export const COLON = ': package:';

export const parseCommitType = (type) => {
    type = type || 'paren';
    
    if (type === 'paren')
        return PAREN;
    
    return COLON;
};

