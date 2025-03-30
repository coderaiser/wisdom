#!/usr/bin/env node

import {createRequire} from 'node:module';
import process from 'node:process';
import wisdom from '../lib/wisdom.js';
import {choose} from '../lib/prompts.js';

const require = createRequire(import.meta.url);

const info = () => require('../package.json');

let [arg, option] = process.argv.slice(2);

if (arg === '--dry-run') {
    arg = '';
    option = '--dry-run';
}

if (!arg)
    arg = await choose();

if (/^(-v|--v)$/.test(arg)) {
    version();
    process.exit();
}

if (!arg || /^(-h|--help)$/.test(arg)) {
    help();
    process.exit();
}

if (/^(-v|--v)$/.test(arg)) {
    version();
    process.exit();
}

if (!/^(patch|minor|major)$/.test(arg)) {
    console.error(`'%s' is not a wisdom option. See 'wisdom --help'`, arg);
    process.exit();
}

const dryRun = option === '--dry-run';
const force = option === '--force';

wisdom(arg, {
    dryRun,
    force,
})
    .on('data', (a) => {
        process.stdout.write(a);
    })
    .on('error', (e) => {
        process.stderr.write(`${e.message}\n`);
    });

function version() {
    console.log('v' + info().version);
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
