require('colors');
var logger = require('../logger');

exports.delayedResponse = function(delay){
    return function(req, res, next){
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

exports.corsHeaders = function(disableCORS, allowHeaders) {
    return function(req, res, next) {
        if (!disableCORS) {
            res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
            res.set('Access-Control-Allow-Credentials', 'true');

            if (allowHeaders) {
                var headers = Array.isArray(allowHeaders) ? allowHeaders.join(',') : allowHeaders;
                res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, ' + headers);
            } else {
                res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            }
        }
        next();
    };
};

exports.allowMethods = function(allowMethods) {
    return function(req, res, next) {
        if (allowMethods) {
            var methods = Array.isArray(allowMethods) ? allowMethods.join(',') : allowMethods;
            res.set('Access-Control-Allow-Methods', methods);
        }
        next();
    };
};
