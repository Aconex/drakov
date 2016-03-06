var pathToRegexp = require('path-to-regexp');
var buildRouteMap = require('./route-map');
var filter = require('../handler-filter');

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
                if (match) {
                    handler = filter.filterHandlers(req, routeMap[urlPattern].methods[req.method.toUpperCase()]);
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
