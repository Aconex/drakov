var glob = require('glob');
var fs = require('fs');
var protagonist = require('protagonist');
var async = require('async');
var pathToRegexp = require('path-to-regexp');
var _ = require('lodash');

var urlParser = require('../url-parser');
var route = require('../route');
var queryComparator = require('../query-comparator');

var ROUTE_MAP = null;
var autoOptions;
var autoOptionsAction = require('../json/auto-options-action.json');

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

            var allRoutesList = [];
            result.ast.resourceGroups.forEach(function(resourceGroup){
                resourceGroup.resources.forEach(function(resource){
                    resource.actions.forEach(function(action){
                        parseAction(resource.uriTemplate, action);
                        saveRouteToTheList(resource, action);
                    });
                });
            });

            // add OPTIONS route where its missing - this must be done after all routes are parsed
            if (autoOptions) {
                addOptionsRoutesWhereMissing(allRoutesList);
            }

            cb();

            /**
             * Adds route and its action to the allRoutesList. It appends the action when route already exists in the list.
             * @param resource Route URI
             * @param action HTTP action
             */
            function saveRouteToTheList(resource, action) {
                // used to add options routes later
                if (typeof allRoutesList[resource.uriTemplate] === 'undefined') {
                    allRoutesList[resource.uriTemplate] = [];
                }
                allRoutesList[resource.uriTemplate].push(action);
            }

            function addOptionsRoutesWhereMissing(allRoutes) {
                var routesWithoutOptions = [];
                // extracts only routes without OPTIONS
                _.forIn(allRoutes, function (actions, route) {
                    var containsOptions = _.reduce(actions, function (previousResult, iteratedAction) {
                        return previousResult || (iteratedAction.method === 'OPTIONS');
                    }, false);
                    if (containsOptions === false) {
                        routesWithoutOptions.push(route);
                    }
                });

                _.forEach(routesWithoutOptions, function (uriTemplate) {
                    // adds prepared OPTIONS action for route
                    parseAction(uriTemplate, autoOptionsAction);
                });
            }
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
