var path = require('path');
var express = require('express');
var async = require('async');
var glob = require('glob');
require('colors');

var requestUtils = require('./request');
var file = require('./file');

exports.run = function(argv) {

    console.log('\n', '  Bootstrapping  '.bold.inverse, '\n');

    var app = express();
    app.use(requestUtils.headers);
    app.use(requestUtils.logger);
    app.use(requestUtils.getBody);

    if (argv.staticPaths) {
        var setupStaticRoute = function(staticPath) {
            console.log('Setup static path:', path.resolve(staticPath.trim()).yellow);
            app.use(express.static(path.resolve(staticPath.trim())));
        }
        argv.staticPaths.split(',').forEach(setupStaticRoute);
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

        async.series(seriesFunctions, function(err) {
            if (err) {
                console.error('Drakov returned an error.', err);
                process.exit(1);
            }
        });

    });

};
