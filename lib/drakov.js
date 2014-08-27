var path = require('path');
var express = require('express');
var async = require('async');
var glob = require('glob');
require('colors');

var requestUtils = require('./request');
var file = require('./file');
var static = require('./static');

exports.run = function(argv, cb) {

    console.log('\n', '  Bootstrapping  '.bold.inverse, '\n');

    var app = express();
    app.use(requestUtils.headers);
    app.use(requestUtils.logger);
    app.use(requestUtils.getBody);

    if (argv.staticPaths) {
        static.setupRoutes(app, argv.staticPaths, argv.pathDelimiter);
    }

    var startServer = function (callback) {
        var server = app.listen(argv.serverPort, function() {
            console.log('\n', '  Drakov  '.bold.inverse, 'server listening on port ' + server.address().port.toString().bold.red);
            callback();
        });
    };

    glob(argv.sourceFiles, {} , function (err, files) {
        if (err) {
            console.error('Failed to parse contracts path.', err);
            process.exit(1);
        }

        var seriesFunctions = files.map(function(filePath){
            return file.readFile(app, filePath);
        });

        seriesFunctions.push(startServer);

        if (cb) {
            seriesFunctions.push(cb);
        }

        async.series(seriesFunctions, function(err) {
            if (err) {
                console.error('Drakov returned an error.', err);
                process.exit(1);
            }
        });

    });

};
