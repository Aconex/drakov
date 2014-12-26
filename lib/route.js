var logger = require('./logger');
var content = require('./content');

exports.setRoute = function(app, method, url, action){

    var getResponseHandler = function ( specReq, specResp ) {

        return function (httpReq, httpResp, next) {
            if( content.matches( httpReq, specReq ) ) {
                logger.log('[DRAKOV]'.red, method.green, url.yellow, ( specReq &&  specReq.description ?  specReq.description : action.name).blue);

                specResp.headers.forEach(function(header){
                    httpResp.set(header.name, header.value);
                });
                httpResp.send(+specResp.name, specResp.body);
            } else {
                next();
            }
        };
    };

    // Ignore query and continuation operator for the route
    var translatedUrl = url.replace(/\{\?.*\}/g, '').replace(/\{\&.*\}/g, '').replace(/\{/g, ':').replace(/\}/g, '');

    action.examples.forEach(function(example){

        var specReq = example.requests[0];
        var specResp = example.responses[0];

        console.log('Setup Route:', method.green, translatedUrl.yellow, (specReq && specReq.description ? specReq.description : action.name).blue);

        app[method.toLowerCase()](translatedUrl, getResponseHandler(specReq, specResp));

    });

};
