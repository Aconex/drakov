var drakov = require('../../lib/drakov');
var _ = require('lodash');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var drakovDefault =  {
    sourceFiles: 'test/example/**/*.md',
    serverPort: require('./port'),
    stealthmode: true,
    disableCORS: false
};

module.exports = {
    argv: null,
    run: function(args, cb){
        var asyncCb = function() {
            //prevents async args
            if(cb){
                cb();
            }
        };
        this.argv = _.extend({}, drakovDefault, args);
        drakov.run(this.argv, asyncCb);
    },
    stop: function(cb) {
        drakov.stop(cb);
    }
};
