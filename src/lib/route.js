var logger = require('./logger');
var specSchema = require('./spec-schema');

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

exports.getRouteHandlers = function (parsedUrl, action) {
     return action.examples.map(function (example) {
        return {
            action: action,
            parsedUrl: parsedUrl,
            response: example.responses[0],
            request: 'undefined' === typeof example.requests[0] ? null : specSchema.validateAndParseSchema(example.requests[0]),
            execute: function (req, res) {

                logger.log( action.method.green, parsedUrl.uriTemplate.yellow,
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

exports.createErrorHandler = function(validatedHandler) {

    var execute = function (req, res) {
        logger.log(this.action.method.green, this.parsedUrl.uriTemplate.yellow,
            (this.request && this.request.description ? this.request.description : this.action.name).blue);

        this.response.headers.forEach(function (header) {
            res.set(header.name, header.value);
        });

        res.status(400);
        res.send(buildResponseBody(validatedHandler.result.niceErrors));
    };

    return Object.assign({}, validatedHandler.handler, {execute: execute});
};
