var logger = require('./logger');
var content = require('./content');
var blueprintUrlParser = require('./url-parser');

exports.setRoute = function (app, method, routeUrl, action) {

    var getResponseHandler = function (specPairs) {

        return function (httpReq, httpResp, next) {
            var matchRequests= function matchRequests(specPair){
                if (content.matches(httpReq, specPair.request)) {
                    logger.log('[DRAKOV]'.red, method.green, routeUrl.yellow, ( specPair.request && specPair.request.description ? specPair.request.description : action.name).blue);

                    specPair.response.headers.forEach(function (header) {
                        httpResp.set(header.name, header.value);
                    });
                    httpResp.status(+specPair.response.name).send(specPair.response.body);
                    return true;
                }

                return false;
            };

            if(!specPairs.some(matchRequests)){
                next();
            }

        };
    };

    var parsedUrl = blueprintUrlParser.parse(routeUrl);

    action.examples.forEach(function (example) {

        var specPairs = [];

        var makePair = function ( response, index ){
            var specPair = {
                response: response,
                request: 'undefined' === typeof example.responses[index] ? null : example.requests[index]
            };

            specPairs.push(specPair);
        };

        logger.log('[LOG]'.white, 'Setup Route:', method.green, parsedUrl.url.yellow, action.name.blue);

        example.responses.forEach(makePair);

        app[method.toLowerCase()](parsedUrl.url, getResponseHandler(specPairs));

    });
};
