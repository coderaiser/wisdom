'use strict';

const jessy = require('jessy');

module.exports = (info) => {
    return typeof jessy('info.publishConfig.access') === 'undefined';
};

