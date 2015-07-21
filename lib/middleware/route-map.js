var glob = require('glob');
var async = require('async');

var ROUTE_MAP = null;

var parseBlueprint = require('../parse-blueprint');

var setup = function(options, cb) {
    var sourceFiles = options.sourceFiles;
    var autoOptions = options.autoOptions;
    glob(sourceFiles, {} , function (err, files) {
        if (err) {
            console.error('Failed to parse contracts path.', err);
            process.exit(1);
        }

        var asyncFunctions = [];

        files.forEach(function(filePath) {
            asyncFunctions.push(parseBlueprint(filePath, autoOptions, ROUTE_MAP));
        });

        async.series(asyncFunctions, function(err) {
            cb(err);
        });
    });
};

module.exports = function(options, cb) {
    ROUTE_MAP = {};
    setup(options, function(err) {
        cb(err, ROUTE_MAP);
    });
};
