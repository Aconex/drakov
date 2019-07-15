var pathToRegexp = require('path-to-regexp');
var buildRouteMap = require('./route-map');
var filter = require('../handler-filter');
var logger = require('../logging/logger');
const types = require('../parse/types-checker');

module.exports = function (options, cb) {
    buildRouteMap(options, function (err, routeMap) {
        if (err) {
            return cb(err);
        }

        var middleware = function (req, res, next) {
            var handler = null;

            Object.keys(routeMap).forEach(function (urlPattern) {
                if (handler) {
                    return; // continue if we've already got handlers
                }
                var regex = pathToRegexp(urlPattern);

                // req.path allows us to delegate query string handling to the route handler functions
                var match = regex.exec(req.path);

                if (match) {
                    let paramValues = mapParameterNamesToCapturedValues(match, regex.keys);
                    const specParams = routeMap[urlPattern].pathParams;
                    for (let paramName in specParams) {
                        if (!types.typeMatches(paramValues[paramName], specParams[paramName].type)) {
                            logger.debug('Matching by url pattern:', urlPattern.yellow, 'NOT_MATCHED'.red,
                                ' For parameter:', paramName.cyan, 'expected type:', specParams[paramName].type.cyan,
                                'actual value:', paramValues[paramName].cyan);
                            return;
                        }
                    }

                    logger.debug('Matching by url pattern:', urlPattern.yellow, 'MATCHED'.green);
                    var handlers = routeMap[urlPattern].methods[req.method.toUpperCase()];
                    if (handlers && handlers.length) {
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

function mapParameterNamesToCapturedValues(match, keys) {
    let matches = {};
    keys.forEach((key, i) => {
        // the first match is always the full url
        matches[key.name] = match[i + 1]
    });

    return matches;
}

