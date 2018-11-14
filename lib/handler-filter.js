var content = require('./content');
var queryComparator = require('./query-comparator');
var route = require('./route');

var filterRequestHeader = function(req, ignoreHeaders) {
    return function(handler) {
        return content.matchesHeader(req, handler.request, ignoreHeaders);
    };
};

function isJsonContent(req) {
    if(req && req.headers) {
        return /json/i.test(req.headers['content-type']);
    }
    return false;
}

exports.filterHandlers = function(req, handlers, ignoreHeaders) {
    if (handlers) {
        var filteredHandlers;

        handlers.sort(content.contentTypeComparator);

        var queryParams = req.query;
        if (Object.keys(queryParams).length === 0) {
            handlers.sort(queryComparator.noParamComparator);
        } else {
            queryComparator.countMatchingQueryParms(handlers, queryParams);
            handlers.sort(queryComparator.queryParameterComparator);
        }

        filteredHandlers = handlers.filter(filterRequestHeader(req, ignoreHeaders));

        if(!filteredHandlers.length) {
            return null;
        }

        var matchRequestBodyHandlers = filteredHandlers.filter((handler) => {
            return content.matchesBody(req, handler.request);
        });

        if (matchRequestBodyHandlers.length > 0) {
            return addMatchesByHeader(matchRequestBodyHandlers[0], 'matches-request-body');
        }

        if(isJsonContent(req)) {

            let validatedHandlers = filteredHandlers.map((handler) => {
                let result = content.matchesSchema(req, handler.request);

                return {
                    handler,
                    result
                };
            });

            var matchSchemaHandlers = validatedHandlers.filter(function(handler) {
                return handler.result.valid;
            });

            if (matchSchemaHandlers.length > 0) {
                return addMatchesByHeader(matchSchemaHandlers[0].handler, 'matches-request-schema');
            }

            var errorHandlers = validatedHandlers.filter(function(handler) {
                return handler.result.niceErrors;
            });

            if(errorHandlers.length > 0) {
                return route.createErrorHandler(errorHandlers[0]);
            }
        }
    }

    return null;
};

function addMatchesByHeader(originalHandler, matchType) {
    const header = {name: 'X-Matched-By', value: matchType};
    let handler = Object.assign({}, originalHandler);
    if (handler.response.headers) {
        handler.response.headers.push(header);
    } else {
        handler.response.headers = [header];
    }
    return handler;
}
