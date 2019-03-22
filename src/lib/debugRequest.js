var logger = require('./logging/logger');
var contentTypeChecker = require('./content-type');

exports.notFoundHandler = function(argv) {

    function debug(req){

        function getBody(req) {
            if (contentTypeChecker.isJson(req.get('Content-Type'))){
                try {
                    return JSON.parse(req.body);
                } catch (e) {
                    return req.body;
                }
            }
            return req.body;
        }

        var debugObj = {
            originalUrl: req.originalUrl,
            body: getBody(req),
            method: req.method,
            headers: req.headers,
            query: req.query
        };

        return debugObj;

    }

    return function (req, res) {
        if (!res.headersSent){
            if (argv.debugMode) {
                var debugRequest = debug(req);
                logger.debug('Mismatching request:', JSON.stringify(debugRequest));
                res.status(404).json(debugRequest);
                return;
            }
            const httpRequest = {
                "requestMethod": req.method,
                "requestUrl": req.url,
                "status": 404,
                "headers": req.headers
            };

            let message =  req.method.green + ' ' + req.url.yellow;
            logger.logHttpRequest(message, httpRequest);
            res.status(404).send('Endpoint not found');
        }
    };

};
