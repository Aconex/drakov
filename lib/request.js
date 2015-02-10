require('colors');
var logger = require('./logger');

exports.getBody = function(req, res, next) {
    req.body = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
        req.body += chunk;
    });
    req.on('end', next);
};

exports.delayedResponse = function(delay){
    return function(req, req, next){
        if(!delay){
            return next();
        }

        setTimeout(next, delay);
    };
};

exports.logger = function(req, res, next) {
    logger.log('[LOG]'.white, req.method.green, req.url.yellow);
    next();
};

exports.headers = function(req, res, next) {
    res.set('X-Powered-By', 'Drakov API Server');
    next();
};

exports.corsHeaders = function(req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    next();
};
