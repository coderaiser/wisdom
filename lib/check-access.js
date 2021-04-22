import jessy from 'jessy';

export default (info) => {
    return typeof jessy('publishConfig.access', info) === 'undefined';
};

