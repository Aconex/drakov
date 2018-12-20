var routeHandlers = require('./route-handlers');
var responseUtils = require('./response');
var staticMiddleware = require('./static');
const contracts = require('../parse/contracts');

var bootstrapMiddleware = function(app, argv) {
    if (argv.drakovHeader) {
        app.use(responseUtils.drakovHeaders);
    }
    if (argv.staticPaths) {
        staticMiddleware.setupRoutes(app, argv.staticPaths, argv.pathDelimiter);
    }
    app.use(responseUtils.corsHeaders(argv.disableCORS, argv.header));
    app.use(responseUtils.delayedResponse(argv.delay));
    app.use(responseUtils.allowMethods(argv.method));
};

exports.init = function(app, argv, cb) {
    bootstrapMiddleware(app, argv);
    var options = {sourceFiles: argv.sourceFiles,
        autoOptions: argv.autoOptions,
        ignoreHeaders: argv.ignoreHeader,
      };

    if (argv.contractFixtureMap) {
        const contractsMap = contracts.readContractFixtureMap(argv.contractFixtureMap);
        options.contracts = contracts.parseContracts(contractsMap);
        // TODO work for real
        options.sourceFiles = Object.values(contractsMap)[0] + '/*.?(apib|md)';
    } 
    
    routeHandlers(options, function(err, middleware) {
        cb(err, middleware);
    });

};
