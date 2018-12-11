var path = require('path');
var express = require('express');
require('colors');

var logger = require('../logger');

// route object example
// { path: '/path/to/static/files', mount: '/www/mount/path' }
// 'mount' property is optional and may be undefined or null
var setupStaticRoute = function(app, route) {
    var resolvedPath = path.resolve(route.path.trim());
    var message = 'Setup static path: ' + resolvedPath.yellow;
    if (route.mount) {
        message += ' from url ' + route.mount.blue;
        app.use(route.mount, express.static(resolvedPath));
    } else {
        app.use(express.static(resolvedPath));
    }
    logger.log(message);
};

var splitPathValues = function(pathValue, pathDelimiter) {
    if (!pathDelimiter) {
        pathDelimiter = '=';
    }
    var values = pathValue.split(pathDelimiter);
    return {
        path: values[0],
        mount: values[1] ? values[1] : null
    };
};

exports.setupRoutes = function(app, routeList, pathDelimiter) {
    var processRoute = function(routeString) {
        setupStaticRoute(app, splitPathValues(routeString, pathDelimiter));
    };

    if (Array.isArray(routeList)) {
        routeList.forEach(processRoute);
    } else {
        processRoute(routeList);
    }
};
