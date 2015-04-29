var gaze = require('gaze');
require('colors');

var drakov = require('./drakov');

// Save these for replay later
var cachedArgv = null;

var changeHandler = function(event, filePath) {
    console.log('[CHANGE]'.white, filePath.green, 'Restarting'.blue);
    drakov.stop(function(){
        drakov.run(cachedArgv);
    });
};

exports.watch = function(argv, cb) {
    cachedArgv = argv;

    gaze(argv.sourceFiles, function (err) {
        if (err) {
            cb(err);
        }
        this.on('all', changeHandler);
        cb();
    });
};
