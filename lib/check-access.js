'use strict';

const jessy = require('jessy');

module.exports = (info) => {
    return typeof jessy('publishConfig.access', info) === 'undefined';
};

