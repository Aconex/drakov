var optimist = require('optimist');

var optimistOptions = {
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
    }
};

exports.getArgv = function() {
    return optimist
        .usage('Usage: \n  ./drakov -f <path to blueprint> [-p <server port|3000>]' +
        '\n\nExample: \n  ' + './drakov -f ./*.md -p 3000')
        .options(optimistOptions)
        .demand('f')
        .wrap(80)
        .argv;
};
