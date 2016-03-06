var glob = require('glob');
var async = require('async');
var parseBlueprint = require('../parse/blueprint');
var endpointSorter = require('./endpoint-sorter');

module.exports = function(options, cb) {
    var sourceFiles = options.sourceFiles;
    var autoOptions = options.autoOptions;
    var routeMap = {};

    glob(sourceFiles, {} , function (err, files) {
        if (err) {
            console.error('Failed to parse contracts path.', err);
            return cb(err);
        }

        var asyncFunctions = [];

        files.forEach(function(filePath) {
            asyncFunctions.push(parseBlueprint(filePath, autoOptions, routeMap));
        });

        async.series(asyncFunctions, function(err) {
            cb(err, endpointSorter.sort(routeMap));
        });
    });
};
