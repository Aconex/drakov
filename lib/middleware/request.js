require('colors');
var logger = require('../logger');

exports.getBody = function(req, res, next) {
    req.body = '';
    req.on('data', function(chunk) {
        req.body += chunk;
    });
    req.on('end', next);
};

exports.logger = function(req, res, next) {
    logger.log('[LOG]'.white, req.method.green, req.url.yellow);
    next();
};
