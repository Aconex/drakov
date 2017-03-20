var glob = require('glob');
var async = require('async');
var parseBlueprint = require('../parse/blueprint');
var endpointSorter = require('./endpoint-sorter');

module.exports = function(options, cb) {
    var sourceFiles = options.sourceFiles;
    var autoOptions = options.autoOptions;
    var routeMaps = [];

    glob(sourceFiles, {} , function (err, files) {
        if (err) {
            console.error('Failed to parse contracts path.', err);
            return cb(err);
        }

        var asyncFunctions = [];

        files.forEach(function(filePath) {
            var routeMap = {};
            routeMaps.push(routeMap);
            asyncFunctions.push(parseBlueprint(filePath, autoOptions, routeMap));
        });
        async.series(asyncFunctions, function(err) {
            var routeMap = {};
            routeMaps.forEach(function(routeMapsItem) {
                Object.keys(routeMapsItem).forEach(function(urlPattern) {
                    routeMap[urlPattern] = routeMap[urlPattern] || [];
                    routeMap[urlPattern].push(routeMapsItem[urlPattern]);
                });
            });
            cb(err, endpointSorter.sort(routeMap));
        });
    });
};
