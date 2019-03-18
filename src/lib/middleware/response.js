require('colors');
const logger = require('../logging/logger');

exports.delayedResponse = function (delay) {
    return function (req, res, next) {
        if (!delay) {
            return next();
        }
        logger.info('Delay'.yellow, delay + 'ms');
        setTimeout(next, delay);
    };
};

exports.drakovHeaders = function (req, res, next) {
    res.set('X-Powered-By', 'Drakov API Server');
    next();
};

const allowHeadersKey = 'Access-Control-Allow-Headers';
const baseHeaders = 'Origin, X-Requested-With, Content-Type, Accept';
exports.corsHeaders = function (disableCORS, allowHeaders, permissiveCORS) {
    return function (req, res, next) {
        if (!disableCORS) {
            res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
            res.set('Access-Control-Allow-Credentials', 'true');

            let additionalHeaders = "";
            if (permissiveCORS && req.headers['access-control-request-headers']) {
                additionalHeaders += ',' + req.headers['access-control-request-headers'];
            } else if (allowHeaders) {
                additionalHeaders += ',' + Array.isArray(allowHeaders) ? allowHeaders.join(',') : allowHeaders;
            }

            res.set(allowHeadersKey, baseHeaders + additionalHeaders);
        }
        next();
    };
};

exports.allowMethods = function (allowMethods, permissiveCORS) {
    return function (req, res, next) {
        if (permissiveCORS && req.headers['access-control-request-method']) {
            res.set('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
        } else if (allowMethods) {
            const methods = Array.isArray(allowMethods) ? allowMethods.join(',') : allowMethods;
            res.set('Access-Control-Allow-Methods', methods);
        }
        next();
    };
};
