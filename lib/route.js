var logger = require('./logger');
var specSchema = require('./spec-schema');

exports.getRouteHandlers = function (method, parsedUrl, action) {
     return action.examples.map(function (example) {
        return {
            action: action,
            parsedUrl: parsedUrl,
            response: example.responses[0],
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

                this.response.headers.forEach(function (header) {
                    res.set(header.name, header.value);
                });

                res.status(+this.response.name);
                res.send(buildResponseBody(this.response.body));
            }
        };
    });
};
