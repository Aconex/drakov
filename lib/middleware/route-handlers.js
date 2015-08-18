
var pathToRegexp = require('path-to-regexp');

var queryComparator = require('../query-comparator');
var buildRouteMap = require('./route-map');


module.exports = function(options, cb) {
    buildRouteMap(options, function(err, routeMap) {
        if (err) {
            cb(err);
        }
        var middleware = function(req, res, next) {
            var handlers = null;
            var requestPath = req.serverName === 'restify' ? req.getPath() : req.path;

            Object.keys(routeMap).forEach(function(urlPattern) {
                if (handlers) {
                    return; // continue if we've already got handlers
                }
                var regex = pathToRegexp(urlPattern);

                // requestPath allows us to delegate query string handling to the route handler functions
                var match = regex.exec(requestPath);
                if (match) {
                    handlers = routeMap[urlPattern].methods[req.method.toUpperCase()];
                }
            });

            if (handlers) {
                var requestQuery = req.serverName === 'restify' ? req.getQuery() : req.query;
                var queryParams = Object.keys(requestQuery);
                if (queryParams.length === 0){
                    handlers.sort(queryComparator.noParamComparator);
                } else {
                    queryComparator.countMatchingQueryParms(handlers, queryParams);
                    handlers.sort(queryComparator.queryParameterComparator);
                }

                var requestHandled = false;
                handlers.forEach(function (handler) {
                    if (requestHandled) {
                        return;
                    }
                    requestHandled = handler.execute(req, res);
                });
            }
            next();
        };
        cb(null, middleware);
    });
};
