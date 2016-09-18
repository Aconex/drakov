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
                    var routeMaps = routeMap[urlPattern];
                    var routeMapItem = routeMaps[routeMaps.length - 1];
                    routeMaps.forEach(function(item){
                        if (item.host === req.hostname) {
                            routeMapItem = item;
                            return false;
                        }
                    });
                    handler = filter.filterHandlers(req, routeMapItem.methods[req.method.toUpperCase()]);
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
