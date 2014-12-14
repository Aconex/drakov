var logger = require('./logger');
var content = require('./content');

exports.setRoute = function (app, method, url, action) {

    var getResponseHandler = function (specPairs) {

        return function (httpReq, httpResp, next) {
            function matchRequests(specPair){
                if (content.matches(httpReq, specPair.request)) {
                    logger.log('[DRAKOV]'.red, method.green, url.yellow, ( specPair.request && specPair.request.description ? specPair.request.description : action.name).blue);

                    specPair.response.headers.forEach(function (header) {
                        httpResp.set(header.name, header.value);
                    });
                    httpResp.send(+specPair.response.name, specPair.response.body);
                    return true;
                }

                return false;
            }

            if(specPairs.some(matchRequests)){
                next();
            }

        };
    };

    var translatedUrl = url.replace(/\{/g, ':').replace(/\}/g, '');

    action.examples.forEach(function (example) {

        var specPairs = [];

        function makePair( response, index ){
            var specPair = {
                response: response,
                request: 'undefined' === typeof example.responses[index] ? null : example.requests[index]
            };

            specPairs.push(specPair);
        }

        logger.log('[LOG]'.white, 'Setup Route:', method.green, translatedUrl.yellow, action.name.blue);

        example.responses.forEach(makePair);


        app[method.toLowerCase()](translatedUrl, getResponseHandler(specPairs));

    });

};
