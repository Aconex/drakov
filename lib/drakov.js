var express = require('express');

require('colors');

var logger = require('./logger');
var requestUtils = require('./request');
var responseUtils = require('./response');
var static = require('./static');
var setup = require('./setup');

var server = null;

exports.run = function(argv, cb) {

    logger.setStealthMode(argv.stealthmode);

    console.log('   DRAKOV STARTED   '.green.bold.inverse);

    var app = express();

    // REQUEST MIDDLEWARE
    app.use(requestUtils.logger);
    app.use(requestUtils.getBody);

    // RESPONSE MIDDLEWARE
    app.use(responseUtils.drakovHeaders);
    app.use(responseUtils.corsHeaders(argv.disableCORS));
    app.use(responseUtils.delayedResponse(argv.delay));
    app.use(responseUtils.allowMethods(argv.method));

    app.use(require('./middleware')(argv.sourceFiles));

    if (argv.staticPaths) {
        static.setupRoutes(app, argv.staticPaths, argv.pathDelimiter);
    }

    server = setup.startServer(argv, app, cb);
};

exports.stop = function(cb) {
    server.close(function() {
        console.log('   DRAKOV STOPPED   '.red.bold.inverse);
        if (cb) {
            cb();
        }
    });
};
