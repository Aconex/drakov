var content = require('./content');
var queryComparator = require('./query-comparator');

var filterRequestHeader = function(req, ignoreHeaders) {
    return function(handler) {
        return content.matchesHeader(req, handler.request, ignoreHeaders);
    };
};

var filterRequestBody = function(req) {
    return function(handler) {
        return content.matchesBody(req, handler.request);
    };
};

var filterSchema = function(req) {
    return function(handler) {

        var result =  content.matchesSchema(req, handler.request);
        handler.niceErrors = result.niceErrors;
        return true;
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

        filteredHandlers = handlers.filter(filterRequestHeader(req, ignoreHeaders))
            .map(function(handler) {
                return Object.assign({}, handler);
            });

        var matchRequestBodyHandlers = filteredHandlers.filter(filterRequestBody(req));

        if (matchRequestBodyHandlers.length > 0) {
            return matchRequestBodyHandlers[0];
        }

        if(isJsonContent(req)) {
            var matchSchemaHandlers = filteredHandlers.filter(filterSchema(req));

            if (matchSchemaHandlers.length > 0) {
                return matchSchemaHandlers[0];
            }
        }
    }

    return null;
};
