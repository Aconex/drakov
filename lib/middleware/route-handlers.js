var pathToRegexp = require('path-to-regexp');
var buildRouteMap = require('./route-map');
var filter = require('../handler-filter');
var logger = require('../logger');

module.exports = function(options, cb) {
    buildRouteMap(options, function(err, routeMap) {
        if (err) {
            return cb(err);
        }

        var middleware = function(req, res, next) {
            var handler = null;

            Object.keys(routeMap).forEach(function(urlPattern) {
                if (handler) {
                    return; // continue if we've already got handlers
                }
                var regex = pathToRegexp(urlPattern);

                // req.path allows us to delegate query string handling to the route handler functions
                var match = regex.exec(req.path);
                logger.log('[MATCHING]'.yellow, 'by url pattern:', urlPattern.yellow, logger.stringfy(match));
                if (match) {
                    var handlers = routeMap[urlPattern].methods[req.method.toUpperCase()];
                    handler = filter.filterHandlers(req, handlers, options.ignoreHeaders);
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
