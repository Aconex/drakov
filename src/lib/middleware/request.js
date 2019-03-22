require('colors');
var logger = require('../logging/logger');

exports.getBody = function(req, res, next) {
    req.body = '';
    req.on('data', function(chunk) {
        req.body += chunk;
    });
    req.on('end', next);
};

exports.logger = function(req, res, next) {
    logger.debug('Received request:',req.method.green, req.url.yellow);
    next();
};
