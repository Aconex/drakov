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
    pathDelimiter: {
        alias: 'd',
        description: 'Delimiter for mount point in static path (defaults is "=")'
    },
    stealthmode: {
        description: 'Run silent (no console output)'
    },
    disableCORS: {
        description: 'Disable CORS header'
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
    }

};
