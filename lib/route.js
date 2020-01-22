var logger = require('./logger');
var specSchema = require('./spec-schema');

exports.getRouteHandlers = function (method, parsedUrl, action) {
     return action.examples.map(function (example) {
        return {
            action: action,
            parsedUrl: parsedUrl,
            responses: example.responses,
            request: 'undefined' === typeof example.requests[0] ? null : specSchema.validateAndParseSchema(example.requests[0]),
            execute: function (req, res) {
                var buildResponseBody = function(specBody){
                    switch (typeof specBody) {
                        case 'boolean':
                        case 'number':
                        case 'string':
                            return new Buffer(specBody);
                        case 'object':
                            return new Buffer(JSON.stringify(specBody));
                        default:
                            return specBody;
                    }
                };

                logger.log('[DRAKOV]'.red, action.method.green, parsedUrl.uriTemplate.yellow,
                    (this.request && this.request.description ? this.request.description : action.name).blue);

                const pair = (req.headers.prefer || '').split('='); //split status=200
                let response = this.responses[0];
                if (pair.length == 2 && pair[0] === 'status') {
                    const preferResponse = this.responses.find(({name}) => name === pair[1]);
                    if (preferResponse) {
                        response = preferResponse;
                    }
                }

                response.headers.forEach(function(header) {
                    res.set(header.name, header.value);
                });

                res.status(+response.name);
                res.send(buildResponseBody(response.body));
            }
        };
    });
};
