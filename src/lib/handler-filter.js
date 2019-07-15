"use strict"
var content = require('./content');
var urlQueryParams = require('./query-params');
var route = require('./route');
var _ = require('lodash')

var filterRequestHeader = function (req, ignoreHeaders) {
    return function (handler) {
        return content.matchesHeader(req, handler.request, ignoreHeaders);
    };
};

function isJsonContent(req) {
    if (req && req.headers) {
        return /json/i.test(req.headers['content-type']);
    }
    return false;
}

function addRequestHeaderCount(handler) {
    if (!handler.request || !handler.request.headers) {
        handler.headerCount = 0;
    } else {
        handler.headerCount = handler.request.headers.length;
    }
}

exports.filterHandlers = function (req, handlers, ignoreHeaders) {
    if (handlers) {
        let filteredHandlers;

        filteredHandlers = handlers.filter(filterRequestHeader(req, ignoreHeaders));
        if (filteredHandlers.length === 0) {
            return route.createErrorHandler(handlers[0], ["Found URL but request doesn't contain required headers to match against any known fixture"])
        }

        filteredHandlers = urlQueryParams.filterForRequired(req, filteredHandlers);
        if (filteredHandlers.length === 0) {
            return route.createErrorHandler(handlers[0], ["Found URL but request doesn't contain required query parameters to match against any known fixture"])

        }

        let queryParams = req.query;
        urlQueryParams.countMatchingQueryParams(handlers, queryParams);

        // prioritize handlers that have more headers where all headers match.
        // this allows us to safely ignore extra headers being sent
        // then prioritize based on query params
        filteredHandlers.forEach(addRequestHeaderCount);
        filteredHandlers.sort((handler1, handler2) => {
            if (handler2.headerCount === handler1.headerCount) {
                return urlQueryParams.queryParameterComparator(handler1, handler2);
            }
            return handler2.headerCount - handler1.headerCount
        });

        if (!filteredHandlers.length) {
            return null;
        }

        var matchRequestBodyHandlers = filteredHandlers.filter((handler) => {
            return content.matchesBody(req, handler.request);
        });

        if (matchRequestBodyHandlers.length > 0) {
            return addHeaderForSuccessfulMatchingStrategy(matchRequestBodyHandlers[0], 'matches-request-body');
        }

        if (isJsonContent(req)) {

            let validatedHandlers = filteredHandlers.map((handler) => {
                let result = content.matchesSchema(req, handler.request);

                return {
                    handler,
                    result
                };
            });

            var matchSchemaHandlers = validatedHandlers.filter(function (handler) {
                return handler.result.valid;
            });

            if (matchSchemaHandlers.length > 0) {
                return addHeaderForSuccessfulMatchingStrategy(matchSchemaHandlers[0].handler, 'matches-request-schema');
            }

            var errorHandlers = validatedHandlers.filter(function (handler) {
                return handler.result.formattedErrors;
            });

            if (errorHandlers.length > 0) {
                return route.createErrorHandler(errorHandlers[0].handler, errorHandlers[0].result.formattedErrors);
            }
        }
    }

    return null;
};

function addHeaderForSuccessfulMatchingStrategy(originalHandler, matchType) {
    const header = {name: 'X-Matched-By', value: matchType};

    let handler = _.cloneDeep(originalHandler)

    if (!handler.response.headers) {
        handler.response.headers = []
    }

    handler.response.headers.push(header)

    return handler
}
