var path = require('path');
var optimist = require('optimist');

var logger = require('../logger');
var optimistOptions = require('./arguments');

function addDefaultValue(args) {
    return function(argKey) {
        var defaultValue = optimistOptions[argKey].default;
        if (!args[argKey] && defaultValue !== undefined) {
            args[argKey] = defaultValue;
        }
    };
}

function loadConfiguration() {
    var args = optimist.options({config: {}}).argv;
    if (args.config) {
        logger.log('Loading Configuration:', args.config.white);
        logger.log('WARNING'.red, 'All command line arguments will be ignored');
        var loadedArgs = require(path.resolve('./', args.config));
        var processDefaultOptionsFn = addDefaultValue(loadedArgs);
        Object.keys(optimistOptions).forEach(processDefaultOptionsFn);
        return loadedArgs;
    }
}

function loadCommandlineArguments() {
    return optimist
        .usage('Usage: \n  ./drakov -f <path to blueprint> [-p <server port|3000>]' +
        '\n\nExample: \n  ' + './drakov -f ./*.md -p 3000')
        .options(optimistOptions)
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
