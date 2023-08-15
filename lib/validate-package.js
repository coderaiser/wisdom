import jessy from 'jessy';
import checkAccess from './check-access.js';

export const validatePackage = ({info, version, emitter}) => {
    if (!jessy('repository.url', info))
        return emitter.emit('data', `'repository.url' should be defined`);
    
    if (info.name.includes('@') && checkAccess(info))
        return emitter.emit('data', `looks like '${info.name}' has no 'access' property\n` + `packages should have 'access' property set to 'public' or 'restricted' inside 'publishConfig'\n`);
    
    if (!version)
        return emitter.emit('data', `publish <version>\n` + `package: ${info.name} ${info.version}\n`);
};
