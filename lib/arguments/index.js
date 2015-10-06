var path = require('path');
var argv = require('yargs');

var logger = require('../logger');
var yargsConfigOptions = require('./arguments');

function addDefaultValue(args) {
    return function(argKey) {
        var defaultValue = yargsConfigOptions[argKey].default;
        if (!args[argKey] && defaultValue !== undefined) {
            args[argKey] = defaultValue;
        }
    };
}

function loadConfiguration() {
    var args = argv.options({config: {}}).argv;
    if (args.config) {
        logger.log('Loading Configuration:', args.config.white);
        logger.log('WARNING'.red, 'All command line arguments will be ignored');
        var loadedArgs = require(path.resolve('./', args.config));
        var processDefaultOptionsFn = addDefaultValue(loadedArgs);
        Object.keys(yargsConfigOptions).forEach(processDefaultOptionsFn);
        return loadedArgs;
    }
}

function loadCommandlineArguments() {
    return argv
        .usage('Usage: \n  ./drakov -f <path to blueprint> [-p <server port|3000>]' +
        '\n\nExample: \n  ' + './drakov -f ./*.md -p 3000')
        .options(yargsConfigOptions)
        .demand('f')
        .wrap(80)
        .argv;
}

exports.getArgv = function() {
    var preloadedArgs = loadConfiguration();
    if (preloadedArgs) {
        return preloadedArgs;
    }
    return loadCommandlineArguments();
};
