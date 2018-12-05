var content = require('./content');
var queryComparator = require('./query-comparator');

var filterRequestHeader = function (req, ignoreHeaders) {
    return function (handler) {
        return content.matchesHeader(req, handler.request, ignoreHeaders);
    };
};

var filterRequestBody = function (req) {
    return function (handler) {
        return content.matchesBody(req, handler.request);
    };
};

var filterSchema = function (req) {
    return function (handler) {
        return content.matchesSchema(req, handler.request).valid;
    };
};

exports.filterHandlers = function (req, handlers, ignoreHeaders) {
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

        var matchRequestBodyHandlers = filteredHandlers.filter(filterRequestBody(req));

        if (matchRequestBodyHandlers.length > 0) {
            return matchRequestBodyHandlers[0];
        }
        var filteredSchema = filterSchema(req);
        

        var err;
        filteredHandlers.map(function handerError(handler) {
          var res = content.matchesSchema(req, handler.request);
          if (res.valid === false) {
            handler.response.name = '404';
            handler.response.body = {
              method: req.method,
              headers: req.headers, 
              originalUrl: req.originalUrl,
              error: {
                params: res.errors[0].params,
                message: res.errors[0].message,
                dataPath: res.errors[0].dataPath,
                schemaPath: res.errors[0].schemaPath
              }
            };
            err = handler;
          }
        });
        
        var matchSchemaHandlers = filteredHandlers.filter(filteredSchema);

        if (matchSchemaHandlers.length > 0) {
            return matchSchemaHandlers[0];
        }

        if (err !== null) {
          return err;
        }
    }

    return null;
};
