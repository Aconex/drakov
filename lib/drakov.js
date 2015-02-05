var express = require('express');
var async = require('async');
var glob = require('glob');

require('colors');

var logger = require('./logger');
var requestUtils = require('./request');
var file = require('./file');
var static = require('./static');
var setup = require('./setup');

var server = null;

exports.run = function(argv, cb) {

    logger.setStealthMode(argv.stealthmode);

    console.log('\n', '   Bootstrapping   '.bold.inverse, '\n');

    var app = express();
    app.use(requestUtils.headers);
    if (!argv.disableCORS) {
        app.use(requestUtils.corsHeaders);
    }
    app.use(requestUtils.logger);
    app.use(requestUtils.getBody);

    if (argv.staticPaths) {
        static.setupRoutes(app, argv.staticPaths, argv.pathDelimiter);
    }

    var startServer = function (cb){
        server = setup.startServer(argv, app, cb);
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

exports.stop = function(cb) {
    server.close(function() {
        console.log('\n', '   DRAKOV STOPPED   '.red.bold.inverse);
        if (cb) {
            cb();
        }
    });
};
