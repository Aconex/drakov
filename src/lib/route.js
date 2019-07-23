var logger = require('./logging/logger');
var specSchema = require('./spec-schema');

var buildResponseBody = function (specBody) {
    switch (typeof specBody) {
        case 'boolean':
        case 'number':
        case 'string':
            return Buffer.from(specBody);
        case 'object':
            return Buffer.from(JSON.stringify(specBody));
        default:
            return specBody;
    }
};

exports.getRouteHandlers = function (parsedUrl, action, queryParams) {
    return action.examples.map(function (example) {
        let obj = {
            action: action,
            parsedUrl: parsedUrl,
            queryParamsInfo: queryParams,
            response: example.responses[0],
            request: 'undefined' === typeof example.requests[0] ? null : specSchema.validateAndParseSchema(example.requests[0]),
            execute: function (req, res) {
                const httpRequest = {
                    "requestMethod": req.method,
                    "requestUrl": req.url,
                    "status": +this.response.name,
                    "headers": req.headers,
                    "userAgent": req.headers && req.headers["user-agent"],
                };

                const message = [action.method.green, parsedUrl.uriTemplate.yellow,
                    (this.request && this.request.description ? this.request.description : action.name).blue].join(' ');
                logger.logHttpRequest(message, httpRequest);

                this.response.headers.forEach(function (header) {
                    res.set(header.name, header.value);
                });

                res.status(+this.response.name);
                res.send(buildResponseBody(this.response.body));

            }
        };

        obj.response = Object.freeze(obj.response);
        return obj
    });
};

exports.createErrorHandler = function (handler, formattedErrors) {

    var execute = function (req, res) {
        const httpRequest = {
            "requestMethod": req.method,
            "requestUrl": req.url,
            "status": 400,
            "headers": req.headers,
            "userAgent": req.headers && req.headers["user-agent"],
        };

        const message = [this.action.method.green, this.parsedUrl.uriTemplate.yellow,
            (this.request && this.request.description ? this.request.description : this.action.name).blue].join(' ');
        logger.logHttpRequest(message, httpRequest);

        res.set("Content-type", "application/json");
        res.status(400);
        res.send(buildResponseBody(formattedErrors));
    };

    return Object.assign({}, handler, {execute: execute});
};
