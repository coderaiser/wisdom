#!/usr/bin/env node

'use strict';

const args = process.argv.slice(2);
const arg = args[0];

if (/^(-v|--v)$/.test(arg))
    version();
else if (!arg || /^(-h|--help)$/.test(arg))
    help();
else if (!/^(patch|minor|major)$/.test(arg))
    console.error('\'%s\' is not a wisdom option. See \'wisdom --help\'', arg);
else
    main();

function main() {
    const publish = require('..');
    
    publish(arg)
        .on('error', (error) => {
            process.stderr.write(error.message);
        })
        .on('data', (data) => {
            process.stdout.write(data);
        });
}

function version() {
    console.log('v' + info().version);
}

function info() {
    return require('../package');
}

function help() {
    const bin = require('../json/bin');
    const usage = 'Usage: ' + info().name + ' [patch|minor|major]';
    
    console.log(usage);
    console.log('Options:');
    
    Object.keys(bin).forEach((name) => {
        const line = '  ' + name + ' ' + bin[name];
        console.log(line);
    });
}

