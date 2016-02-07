
var cfg = require('./cfg');

module.exports = function() {
    global.modelHandle('area').count({}, function(err, total) {
        if (err) {
            console.log(err);
        } else {
            if (!total) {
                for (var item in cfg.default_db) {
                    for (var i = 0; i < cfg.default_db[item].length; i++) {
                        
                        global.modelHandle(item).create(cfg.default_db[item][i], function(err, data) {
                            if (err) {
                                console.log(err);
                            } else {
                                if (data) {
                                    console.log('default_db build success!')
                                    console.log(cfg.default_db[item][i]);
                                }
                            }
                        });
                        
                    };
                    
                }
            }
        }
    })
    
    
}