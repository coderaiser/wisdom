#!/usr/bin/env node

(function() {
    'use strict';
    
    var publish         = require('../lib/publish'),
        args            = process.argv.slice(2),
        arg             = args[0],
        pub, version;
        
        if (arg === '-v' || arg === '--v') {
            version = require('../package').version;
            console.log('v' + version);
       } else {
            pub = publish(arg);
            
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
})();
