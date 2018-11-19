'use strict';

module.exports = (info) => {
    return info.name.includes('@') && typeof info.access === 'undefined';
};

