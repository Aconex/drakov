var path = require('path');
var argv = require('yargs');

var logger = require('../logger');
var yargsConfigOptions = require('./arguments');

var RC_FILE = '.drakovrc';

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
        return loadConfigFromModule(args.config, '');
    } else {
        var paths = getPathsFromCwd();
        for (var i = 0; i < paths.length; i++) {
            var config = loadConfigFromModule(RC_FILE, paths[i]);
            if (config) {
                return config;
            }
        }
        return loadConfigFromModule(RC_FILE, process.cwd());
    }
}

function loadConfigFromModule(filePath, cwd) {
    var searchPath = path.resolve(cwd + filePath);
    var loadedArgs;
    try {
        loadedArgs = require(searchPath);
    } catch (e) {
        return;
    }
    logger.log('Loading Configuration:', searchPath.white);
    logger.log('WARNING'.red, 'All command line arguments will be ignored');
    var processDefaultOptionsFn = addDefaultValue(loadedArgs);
    Object.keys(yargsConfigOptions).forEach(processDefaultOptionsFn);
    return loadedArgs;
}

function getPathsFromCwd() {
    var pathComponents = process.cwd().split('/');
    var paths = [];
    for (var i = pathComponents.length; i > 0; i--) {
        paths.push(pathComponents.slice(0, i).concat(['']).join('/'));
    }
    return paths;
}

function loadCommandlineArguments() {
    logger.log('[INFO]'.white, 'No configuration files found');
    logger.log('[INFO]'.white, 'Loading configuration from CLI');
    return argv
        .usage('Usage: \n  ./drakov -f <path to blueprint> [-p <server port|3000>]' +
        '\nExactly one of -f or -m is requred' +
        '\n\nExample: \n  ' + './drakov -f ./*.md -p 3000')
        .options(yargsConfigOptions)
        .check((argv) => {
            if (argv.sourceFiles && argv.contractFixtureMap) {
                return "Only one of -f and -m may be defined";
            } else if (argv.sourceFiles || argv.contractFixtureMap) {
                return true;
            } else {
                return "Either -f or -m must be provided";
            }
        })
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
