#!/usr/bin/env node

'use strict';

const args = process.argv.slice(2);
const arg = args[0];

if (/^(-v|--v)$/.test(arg))
    return version();

if (!arg || /^(-h|--help)$/.test(arg))
    return help();

if (!/^(patch|minor|major)$/.test(arg))
    return console.error('\'%s\' is not a wisdom option. See \'wisdom --help\'', arg);

main();

function main() {
    const publish = require('..');
    
    publish(arg)
        .on('data', (a) => {
            process.stdout.write(a);
        })
        .on('error', (e) => {
            process.stderr.write(`${e.message}\n`);
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

