var express = require('express');
require('colors');

var logger = require('./logger');
var requestUtils = require('./middleware/request');
var setup = require('./setup');
var middleware = require('./middleware');

var server = null;

exports.run = function(argv, cb) {

    logger.setStealthMode(argv.stealthmode);

    console.log('   DRAKOV STARTED   '.green.bold.inverse);

    var app = express();

    // REQUEST MIDDLEWARE
    app.use(requestUtils.logger);
    app.use(requestUtils.getBody);

    // SETUP RESPONSE MIDDLEWARE
    argv.drakovHeader = true;
    middleware.init(app, argv, function(err, middlewareFunction) {
        if (err) {
            throw err;
        }
        app.use(middlewareFunction);
        server = setup.startServer(argv, app, cb);
    });
};

exports.stop = function(cb) {
    var runCb = function() {
        if (cb) {
            cb();
        }
    };
    try {
        server.close(function() {
            console.log('   DRAKOV STOPPED   '.red.bold.inverse);
            runCb();
        });
    } catch (e) {
        runCb();
    }
};
