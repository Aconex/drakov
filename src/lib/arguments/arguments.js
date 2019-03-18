const logger = require('../logging/logger')
module.exports = {
    sourceFiles: {
        alias: 'f',
        description: 'Glob expression to select spec files.'
    },
    serverPort: {
        alias: 'p',
        description: 'Specifies the port to be listened by Drakov server',
        default: 3000
    },
    staticPaths: {
        alias: 's',
        description: 'A list of comma delimited paths to use for static file proxying'
    },
    contractFixtureMap: {
        alias: 'm',
        description: 'File path to configuration that maps contract file paths to fixture folders. This will load, validate all fixtures, and serve the valid fixtures.'
    },
    pathDelimiter: {
        alias: 'd',
        description: 'Delimiter for mount point in static path (defaults is "=")'
    },
    logLevel :{
        alias: 'l',
        description: 'Log level. Overridden by stealthmode or debugMode',
        choices: logger.levels,
        default: 'INFO'
    },
    // currently kept for backward compatibility
    stealthmode: {
        description: 'Run silent (no console output); equivalent to logLevel: NONE. Mutually exclusive with debugMode'
    },
    disableCORS: {
        description: 'Disable CORS header'
    },
    permissiveCORS: {
        description: 'Allows all requested headers and methods from request'
    },
    sslKeyFile: {
        description: 'Key File for SSL connections'
    },
    sslCrtFile: {
        description: 'Certificate File for SSL connections'
    },
    delay: {
        description: 'Add a delay to the response (in milliseconds)'
    },
    method: {
        description: 'Add method to Access-Control-Allow-Methods response header'
    },
    header: {
        description: 'Add header to Access-Control-Allow-Headers response header'
    },
    public: {
        description: 'Allow external requests',
        default: false
    },
    autoOptions: {
        description: 'Automatically respond to OPTIONS requests for routes in spec files'
    },
    config: {
        description: 'Load configuration from a Javascript file, must export an object'
    },
    discover: {
        description: 'List all available endpoints under `/drakov`. If value of argument is a module name, it will be required and called to create a middleware function',
        alias: 'D',
        default: false
    },
    watch: {
        description: 'Reload Drakov when change detected in list of source files'
    },
    debugMode: {
        description: 'Enables DEBUG mode. Mismatch requests will be dumped. Sets log level to DEBUG. Mutually exclusive with stealthmode'
    },
    ignoreHeader: {
        description: 'Ignore the HTTP header in API blueprints',
        type: 'array'
    }
};
