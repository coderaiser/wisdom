#!/usr/bin/env node

'use strict';

var args            = process.argv.slice(2),
    arg             = args[0];
    
if (/^(-v|--v)$/.test(arg))
    version();
else if (!arg || /^(-h|--help)$/.test(arg))
    help();
else if (!/^(patch|minor|major)$/.test(arg))
    console.error('\'%s\' is not a wisdom option. See \'wisdom --help\'', arg);
else
    main();
   
function main() {
    var publish = require('..'),
        pub     = publish(arg);
        
    pub.on('error', function(error) {
        process.stderr.write(error.message);
    });
    
    pub.on('data', function(data) {
        process.stdout.write(data);
    });
    
    pub.on('exit', function() {
        pub = null;
    });
}
   
function version() {
    console.log('v' + info().version);
}

function info() {
    return require('../package');
}

function help() {
    var bin         = require('../json/bin'),
        usage       = 'Usage: ' + info().name + ' [patch|minor|major]';
        
    console.log(usage);
    console.log('Options:');
    
    Object.keys(bin).forEach(function(name) {
        var line = '  ' + name + ' ' + bin[name];
        console.log(line);
    });
}
