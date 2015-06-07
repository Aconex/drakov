var glob = require('glob');
var fs = require('fs');
var protagonist = require('protagonist');
var async = require('async');
var pathToRegexp = require('path-to-regexp');

var urlParser = require('../url-parser');
var route = require('../route');
var queryComparator = require('../query-comparator');

var ROUTE_MAP = null;

var parseAction = function(uriTemplate, action) {
    var parsedUrl = urlParser.parse(uriTemplate);
    var key = parsedUrl.url;

    ROUTE_MAP[key] = ROUTE_MAP[key] || { urlExpression: parsedUrl.url, methods: {} };
    ROUTE_MAP[key].methods[action.method] = ROUTE_MAP[key].methods[action.method] || [];

    var routeHandlers = route.getRouteHandlers(key, parsedUrl, action);
    Array.prototype.push.apply(ROUTE_MAP[key].methods[action.method], routeHandlers);

    console.log('[LOG]'.white, 'Setup Route:', action.method.green, key.yellow, action.name.blue);
};

var parseBlueprint = function(filePath) {
    return function(cb) {
        var data = fs.readFileSync(filePath, {encoding: 'utf8'});
        protagonist.parse(data, function(err, result) {
            if (err) {
                console.log(err);
                return;
            }

            result.ast.resourceGroups.forEach(function(resourceGroup){
                resourceGroup.resources.forEach(function(resource){
                    resource.actions.forEach(function(action){
                        parseAction(resource.uriTemplate, action);
                    });
                });
            });
            cb();
        });
    };
};

var setup = function(sourceFiles, cb) {
    ROUTE_MAP = {};
    glob(sourceFiles, {} , function (err, files) {
        if (err) {
            console.error('Failed to parse contracts path.', err);
            process.exit(1);
        }

        var asyncFunctions = [];

        files.forEach(function(filePath) {
            asyncFunctions.push(parseBlueprint(filePath));
        });

        async.series(asyncFunctions, function(err) {
            cb(err);
        });
    });

};

module.exports = function(options, cb) {
    var sourceFiles = options.sourceFiles;
    autoOptions = options.autoOptions;
    var middleware = function(req, res, next) {
        var handlers = null;
        Object.keys(ROUTE_MAP).forEach(function(urlPattern) {
            if (handlers) {
                return; // continue if we've already go handlers
            }
            var regex = pathToRegexp(urlPattern);

            // req.path allows us to delegate query string handling to the route handler functions
            var match = regex.exec(req.path);
            if (match) {
                handlers = ROUTE_MAP[urlPattern].methods[req.method.toUpperCase()];
            }
        });

        if (handlers) {
            var queryParams = Object.keys(req.query);
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

    setup(sourceFiles, function(err) {
        cb(err, middleware);
    });
};
