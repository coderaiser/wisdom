#!/usr/bin/env node

import wisdom from '../lib/wisdom.js';
import {createCommons} from 'simport';

const {require} = createCommons(import.meta.url);

const [arg] = process.argv.slice(2);

if (/^(-v|--v)$/.test(arg)) {
    version();
    process.exit();
}

if (!arg || /^(-h|--help)$/.test(arg)) {
    help();
    process.exit();
}

if (!/^(patch|minor|major)$/.test(arg)) {
    console.error('\'%s\' is not a wisdom option. See \'wisdom --help\'', arg);
    process.exit();
}

wisdom(arg)
    .on('data', (a) => {
        process.stdout.write(a);
    })
    .on('error', (e) => {
        process.stderr.write(`${e.message}\n`);
    });

function version() {
    console.log('v' + info().version);
}

function info() {
    return require('../package.json');
}

function help() {
    const bin = require('../json/bin.json');
    const usage = 'Usage: ' + info().name + ' [patch|minor|major]';
    
    console.log(usage);
    console.log('Options:');
    
    for (const name of Object.keys(bin)) {
        const line = '  ' + name + ' ' + bin[name];
        console.log(line);
    }
}

