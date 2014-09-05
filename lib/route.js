var logger = require('./logger');
var content = require('./content');

exports.setRoute = function(app, method, url, action){

    var getResponseHandler = function (originalReq, originalResp) {

        return function (req, res, next) {
            if (req.method === 'GET' || content.isContentTypeEqual(req, originalReq)) {
                if (content.isBodyEqual(req, originalReq, content.getContentTypeFrom(req.headers))){

                    logger.log('[DRAKOV]'.red, method.green, url.yellow, (originalReq && originalReq.description ? originalReq.description : action.name).blue);

                    originalResp.headers.forEach(function(header){
                        res.set(header.name, header.value);
                    });
                    res.send(+originalResp.name, originalResp.body);

                } else {
                    next();
                }

            } else {
                logger.log('Skip. Different content-types for '.yellow, method.green,  url.blue);
                next();
            }

        };
    };

    var translatedUrl = url.replace(/\{/g, ':').replace(/\}/g, '');

    action.examples.forEach(function(example){

        var originalRequest = example.requests[0];
        var originalResponse = example.responses[0]

        console.log('Setup Route:', method.green, translatedUrl.yellow, (originalRequest && originalRequest.description ? originalRequest.description : action.name).blue);

        app[method.toLowerCase()](translatedUrl, getResponseHandler(originalRequest, originalResponse));

    });

};
