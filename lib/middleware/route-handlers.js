var glob = require('glob');
var fs = require('fs');
var protagonist = require('protagonist');
var async = require('async');
var pathToRegexp = require('path-to-regexp');

var urlParser = require('./../url-parser');
var route = require('./../route');

var ROUTE_MAP = null;

var parseAction = function(uriTemplate, action) {
    var parsedUrl = urlParser.parse(uriTemplate);
    var key = parsedUrl.url;

    ROUTE_MAP[key] = ROUTE_MAP[key] || { urlExpression: parsedUrl.url, methods: {} };
    ROUTE_MAP[key].methods[action.method] = ROUTE_MAP[key].methods[action.method] || [];

    var routeHandlers = route.getRouteHandlers(key, uriTemplate, action);
    Array.prototype.push.apply(ROUTE_MAP[key].methods[action.method], routeHandlers);
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

module.exports = function(sourceFiles, cb) {
    var middleware = function(req, res, next) {
        var handlers = null;
        Object.keys(ROUTE_MAP).forEach(function(urlPattern) {
            var regex = pathToRegexp(urlPattern);

            // req.path allows us to delegate query string handling to the route handler functions
            var match = regex.exec(req.path);
            if (match) {
                handlers = ROUTE_MAP[urlPattern].methods[req.method.toUpperCase()];
            }
        });

        if (handlers) {
            handlers.forEach(function(handler) {
                handler(req, res, next);
            });
        } else {
            next();
        }
    };

    setup(sourceFiles, function(err) {
        cb(err, middleware);
    });
};
