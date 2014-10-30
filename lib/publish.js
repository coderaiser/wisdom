(function() {
    'use strict';
    
    var spawnify    = require('spawnify'),
        Util        = require('util-io'),
        tryRequire  = require('tryrequire'),
        
        Cmd         = [ 'npm version {{ version }} -m "feature(package) v%s"',
                        'git push origin master',
                        'npm publish'
                    ].join('&&'),
        
        MSG         = [ 'publish <version>',
                        'package: {{ name }} v{{ version }}'
                    ].join('\n');
        
        module.exports  = function(version, callback) {
            var cmd,
                info = tryRequire(process.cwd() + '/package');
            
            if (!info) {
                callback({
                    message: 'package.json not found.'
                });
            } else if (!version) {
                callback(null, Util.render(MSG, {
                    name    : info.name,
                    version : info.version
                }));
            } else {
                if (!version.indexOf('v'))
                    version = version.slice(1);
                
                cmd = Util.render(Cmd, {
                    version: version
                });
                
                spawnify(cmd, function(error, json) {
                    var msg;
                    
                    if (!error) {
                        msg     = json.stdout;
                        error   = {
                            message: json.stderr
                        };
                    }
                    
                    callback(error, msg);
                });
            }
        };
})();
