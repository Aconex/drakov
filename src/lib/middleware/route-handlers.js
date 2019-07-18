var pathToRegexp = require('path-to-regexp');
var buildRouteMap = require('./route-map');
var filter = require('../handler-filter');
var logger = require('../logging/logger');
const types = require('../parse/types-checker');
const route = require("../route");
const resources = require("../parse/resources");

module.exports = function (options, cb) {
    buildRouteMap(options, function (err, routeMap) {
        if (err) {
            return cb(err);
        }

        var middleware = function (req, res, next) {
            let handler = null;
            Object.keys(routeMap).forEach(function (urlPattern) {
                if (handler) {
                    return; // continue if we've already got handlers
                }
                let regex = pathToRegexp(urlPattern);

                // req.path allows us to delegate query string handling to the route handler functions
                let match = regex.exec(req.path);

                if (match) {
                    let paramValues = resources.mapParameterNamesToCapturedValues(match, regex.keys);


                    logger.debug('Matching by url pattern:', urlPattern.yellow, 'MATCHED'.green);
                    let handlers = routeMap[urlPattern].methods[req.method.toUpperCase()];
                    if (handlers && handlers.length) {
                        const specParams = routeMap[urlPattern].pathParams;
                        for (let paramName in specParams) {
                            if (!types.typeMatches(paramValues[paramName], specParams[paramName].type)) {
                                const message = `Matching by url parameters: ${urlPattern} ${'NOT_MATCHED'}. `
                                    + `Parameter: ${paramName} expected type '${specParams[paramName].type}' but had actual value '${paramValues[paramName]}'`;
                                handler = route.createErrorHandler(handlers[0], [message]);
                                logger.debug(`Matching by url parameters: ${urlPattern.yellow} ${'NOT_MATCHED'.red}. `
                                    + `Parameter: ${paramName.cyan} expected type '${specParams[paramName].type.cyan}' but had actual value '${paramValues[paramName].cyan}'`);
                                return;
                            }
                        }

                        handler = filter.filterHandlers(req, handlers, options.ignoreHeaders);
                    } else {
                        logger.debug('Matching by method:', req.method.toUpperCase().yellow, 'NOT_MATCHED'.red)
                    }
                } else {
                    logger.debug('Matching by url pattern:', urlPattern.yellow, 'NOT_MATCHED'.red);
                }
            });

            if (handler) {
                handler.execute(req, res);
            }

            next();
        };
        cb(null, middleware);
    });

};

