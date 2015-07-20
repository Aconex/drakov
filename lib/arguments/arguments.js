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
    public: {
        description: 'Allow external requests',
        default: false
    },
    autoOptions: {
        description: 'Automatically respond to OPTIONS requests for routes in spec files'
    },
    config: {
        description: 'Load configuration from a Javascript file, must export an object'
    }

};
