import {jessy} from 'jessy';

export default (info) => typeof jessy('publishConfig.access', info) === 'undefined';
