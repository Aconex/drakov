
var pathToRegexp = require('path-to-regexp');

var queryComparator = require('../query-comparator');
var buildRouteMap = require('./route-map');

// based on: http://stackoverflow.com/a/520845
function parseQuery(queryString) {
    var re = /(?:^|\?|&(?:amp;)?)([^=&#]+)(?:=?([^&#]*))/g;
    var params = {};
    var decode = function (s) {
        return decodeURIComponent(s.replace(/\+/g, ' '));
    };

    var match = re.exec(queryString);
    while (match) {
        params[decode(match[1])] = decode(match[2]);
        match = re.exec(queryString);
    }
    return params;
}

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
                var requestQuery = req.query;

                if (req.serverName === 'restify' && typeof requestQuery === 'function') {
                    requestQuery = req.query();

                    if (typeof requestQuery === 'string') {
                        // if queryParser is not used, the returned query will be a string, so we need to parse it
                        requestQuery = parseQuery(requestQuery);
                    }
                }

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
