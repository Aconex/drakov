const process = require('process');

var routeHandlers = require('./route-handlers');
var responseUtils = require('./response');
var staticMiddleware = require('./static');
const logger = require('../logging/logger');
const contracts = require('../parse/contracts');

var bootstrapMiddleware = function (app, argv) {
    if (argv.drakovHeader) {
        app.use(responseUtils.drakovHeaders);
    }
    if (argv.staticPaths) {
        staticMiddleware.setupRoutes(app, argv.staticPaths, argv.pathDelimiter);
    }
    app.use(responseUtils.corsHeaders(argv.disableCORS, argv.header, argv.permissiveCORS));
    app.use(responseUtils.delayedResponse(argv.delay));
    app.use(responseUtils.allowMethods(argv.method, argv.permissiveCORS));
};

exports.init = function (app, argv, cb) {
    bootstrapMiddleware(app, argv);

    if (argv.contractFixtureMap) {
        const contractsMap = contracts.readContractFixtureMap(argv.contractFixtureMap);
        contracts.parseContracts(contractsMap)
            .then(contracts => {
                return {
                    contracts,
                    autoOptions: argv.autoOptions,
                    ignoreHeaders: argv.ignoreHeader,
                };
            }).then(options => {
                routeHandlers(options, function (err, middleware) {
                    cb(err, middleware);
                });
            }).catch(err => {
                logger.error(err.message);
                process.exitCode = 1;
            });

    } else {
        var options = {
            sourceFiles: argv.sourceFiles,
            autoOptions: argv.autoOptions,
            ignoreHeaders: argv.ignoreHeader,
        };
        routeHandlers(options, function (err, middleware) {
            cb(err, middleware);
        });
    }

};
