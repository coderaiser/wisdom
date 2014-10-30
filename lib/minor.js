(function() {
    'use strict';
    
    var MAJOR   = 0,
        MINOR   = 1,
        PATCH   = 2;
    
    
    module.exports = function(type, version) {
        var arr = version.split('.');
        
        switch(type) {
        case 'major':
            ++arr[MAJOR];
            arr[MINOR]  = 0;
            arr[PATCH]  = 0;
            break;
            
        case 'minor':
            ++arr[MINOR];
            arr[PATCH]  = 0;
            break;
        
        case 'patch':
            ++arr[PATCH];
            break;
        }
        
        return arr.join('.');
    };
    
})();
