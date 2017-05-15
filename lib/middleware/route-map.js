var async = require('async');
var parseBlueprint = require('../parse/blueprint');
var endpointSorter = require('./endpoint-sorter');

module.exports = function(options, cb) {
    var sourceFiles = options.sourceFiles;
    var autoOptions = options.autoOptions;
    var routeMap = {};
    var asyncFunctions = [];

    sourceFiles.forEach(function(filePath) {
        asyncFunctions.push(parseBlueprint(filePath, autoOptions, routeMap));
    });

    async.series(asyncFunctions, function(err) {
        cb(err, endpointSorter.sort(routeMap));
    });
};
