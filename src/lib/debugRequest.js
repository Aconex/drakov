var logger = require('./logger');
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
                logger.log('[DEBUG]'.yellow, 'mismatching request:', JSON.stringify(debugRequest));
                res.status(404).json(debugRequest);
                return;
            }
            res.status(404).send('Endpoint not found');
        }
    };

};
