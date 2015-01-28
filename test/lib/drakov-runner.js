var drakov = require('../../lib/drakov');
var _ = require('lodash');

var drakovDefault =  {
    sourceFiles: 'test/example/**/*.md',
    serverPort: require('./port'),
    stealthmode: true,
    disableCORS: false
};

module.exports = {
    run: function(args, cb){
        var asyncCb = function() {
            //prevents async args
            cb();
        };
        drakov.run(_.extend({}, drakovDefault, args), asyncCb);
    },
    stop: function(cb) {
        drakov.stop(cb);
    }
};
