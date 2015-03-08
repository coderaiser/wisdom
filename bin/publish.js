#!/usr/bin/env node

(function() {
    'use strict';
    
    var args            = process.argv.slice(2),
        arg             = args[0];
        
    if (/^(-v|--v)$/.test(arg))
        version();
    else if (!arg || /^(-h|--help)$/.test(arg))
        help();
    else
        main();
       
    function main() {
        var publish = require('..'),
            pub     = publish(arg);
            
        pub.on('error', function(error) {
            console.error(error.message);
        });
        
        pub.on('data', function(data) {
            console.log(data);
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
            usage       = 'Usage: ' + info().name + ' [version|minor|major|patch]';
            
        console.log(usage);
        console.log('Options:');
        
        Object.keys(bin).forEach(function(name) {
            var line = '  ' + name + ' ' + bin[name];
            console.log(line);
        });
    }
})();
