require('colors');
var logger = require('./logger');

exports.delayedResponse = function(delay){
    return function(req, req, next){
        if(!delay){
            return next();
        }
        logger.log('[DELAY]'.yellow, delay+'ms');
        setTimeout(next, delay);
    };
};

exports.drakovHeaders = function(req, res, next) {
    res.set('X-Powered-By', 'Drakov API Server');
    next();
};

exports.corsHeaders = function(disableCORS) {
    return function(req, res, next) {
        if (!disableCORS) {
            res.set('Access-Control-Allow-Origin', '*');
        }
        next();
    };
};
