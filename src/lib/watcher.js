var chokidar = require('chokidar');
require('colors');

const logger = require('./logging/logger');
var drakov = require('./drakov');

// Save these for replay later
var CACHED_ARGV = [];

var RESTART_COUNT = 0;

var changeHandler = function(filePath) {
    ++RESTART_COUNT;
    logger.info('Change', filePath.green, ('Restarting ' + RESTART_COUNT).blue);
    drakov.stop(function(){
        drakov.run(CACHED_ARGV);
    });
};

module.exports = function(argv) {
    if (!argv.watch) {
        return;
    }

    logger.info(' FILE SPY '.grey.inverse + '  ACTIVE  '.green.inverse);

    CACHED_ARGV = argv;
    var sourceFiles = argv.sourceFiles;

    var watcher = chokidar.watch(sourceFiles);
    watcher.on('change', changeHandler);
};
