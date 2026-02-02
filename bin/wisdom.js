#!/usr/bin/env node

import process from 'node:process';
import wisdom from '../lib/wisdom.js';
import {choose} from '../lib/prompts.js';

let [arg, option] = process.argv.slice(2);

if (arg === '--dry-run') {
    arg = '';
    option = '--dry-run';
}

if (!arg) {
    arg = await choose();
    
    if (!arg)
        process.exit(1);
}

if (/^(-v|--version)$/.test(arg)) {
    await version();
    process.exit();
}

if (!arg || /^(-h|--help)$/.test(arg)) {
    await help();
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

async function version() {
    console.log('v' + (await info()).version);
}

async function help() {
    const {default: bin} = await import('../json/bin.json', {
        with: {
            type: 'json',
        },
    });
    
    const usage = 'Usage: ' + (await info()).name + ' [patch|minor|major]';
    
    console.log(usage);
    console.log('Options:');
    
    for (const name of Object.keys(bin)) {
        const line = '  ' + name + ' ' + bin[name];
        console.log(line);
    }
}

async function info() {
    const {default: data} = await import('../package.json', {
        with: {
            type: 'json',
        },
    });
    
    return data;
}
