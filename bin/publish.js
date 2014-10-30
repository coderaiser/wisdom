#!/usr/bin/env node

(function() {
    'use strict';
    
    var publish     = require('../lib/publish'),
        args        = process.argv.slice(2),
        arg         = args[0],
        version;
        
        if (arg === '-v' || arg === '--v') {
            version = require('../package').version;
            console.log('v' + version);
       } else {
            publish(arg, function(error, msg) {
                if (error)
                    console.error(error.message);
                else
                    console.log(msg);
            });
       }
})();
