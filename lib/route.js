var logger = require('./logger');
var content = require('./content');

exports.getRouteHandlers = function (method, uriTemplate, action) {

    var getResponseHandler = function (specPairs) {
        return function (req, res, next) {
            var matchRequests= function matchRequests(specPair){
                if (content.matches(req, specPair.request)) {
                    logger.log('[DRAKOV]'.red, action.method.green, uriTemplate.yellow, (specPair.request && specPair.request.description ? specPair.request.description : action.name).blue);

                    specPair.response.headers.forEach(function (header) {
                        res.set(header.name, header.value);
                    });
                    res.status(+specPair.response.name).send(specPair.response.body);
                    return true;
                }

                return false;
            };

            if(!specPairs.some(matchRequests)){
                next();
            }
        };
    };

    var routeHandlers = action.examples.map(function (example) {
        var specPairs = [];

        var makePair = function (response, index){
            var specPair = {
                response: response,
                request: 'undefined' === typeof example.responses[index] ? null : example.requests[index]
            };

            specPairs.push(specPair);
        };

        example.responses.forEach(makePair);

        return getResponseHandler(specPairs);
    });

    return routeHandlers;
};
