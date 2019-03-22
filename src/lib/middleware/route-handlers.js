var pathToRegexp = require('path-to-regexp');
var buildRouteMap = require('./route-map');
var filter = require('../handler-filter');
var logger = require('../logging/logger');

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
