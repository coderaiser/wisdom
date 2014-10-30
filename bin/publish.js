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
            if (arg[0] === 'v')
                version = arg.slice(1);
            else
                version = arg;
            
            publish(version, function(error, msg) {
                if (error)
                    console.error(error.message);
                else
                    console.log(msg);
            });
        }
    
})();
