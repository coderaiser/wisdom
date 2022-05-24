const {isArray} = Array;

const maybeArray = (a) => isArray(a) ? a : [a];

export const traverse = async (paths, visitors) => {
    for (const current of paths) {
        const [path, value = true] = maybeArray(current);
        
        if (path === 'scripts.wisdom') {
            await visitors.wisdom();
            continue;
        }
        
        if (path === 'scripts.wisdom:type') {
            await visitors.type();
            continue;
        }
        
        if (path === 'changelog') {
            await visitors[`changelog:${value}`]();
            continue;
        }
        
        if (path === ':version') {
            await visitors.version();
            continue;
        }
        
        if (path === 'scripts.wisdom:build') {
            await visitors.build();
            continue;
        }
        
        if (path === ':commit') {
            await visitors.commit();
            continue;
        }
        
        if (path === 'tag') {
            await visitors[`path:${value}`]();
            continue;
        }
        
        if (path === ':release') {
            await visitors.release();
            continue;
        }
        
        if (path === '!private') {
            await visitors.publish();
            continue;
        }
        
        if (path === 'scripts.wisdom:done') {
            await visitors.done();
            continue;
        }
    }
};

