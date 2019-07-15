let _ = require('lodash');
let logger = require('./logging/logger');
const types = require('./parse/types-checker');

exports.filterForRequired = function (req, handlers) {
    return handlers.filter(handler => {
        for (let paramName in handler.queryParamsInfo) {
            if (handler.queryParamsInfo[paramName].required) {
                if (!req.query.hasOwnProperty(paramName)) {
                    logger.debug(`Matching by query param: ${paramName} ${'NOT_MATCHED'.red}`);
                    return false;
                }
                const val = req.query[paramName];
                const type = handler.queryParamsInfo[paramName].type;
                if (type && !types.typeMatches(val, type)) {
                    logger.debug(`Matching by query param type: ${paramName} ${'NOT_MATCHED'.red}. Expected ${type}`)
                    return false;
                }
            }
        }
        return true;
    });
};

exports.queryParameterComparator = function (a, b) {
    if (b.matchingQueryParams === a.matchingQueryParams) {
        if (b.exactMatchingQueryParams === a.exactMatchingQueryParams) {
            return (a.nonMatchingQueryParams - b.nonMatchingQueryParams);
        }
        return (b.exactMatchingQueryParams - a.exactMatchingQueryParams);
    }
    return (b.matchingQueryParams - a.matchingQueryParams);
};

exports.countMatchingQueryParams = function (handlers, reqQueryParams) {
    handlers.forEach(function (handler) {
        handler.matchingQueryParams = 0;
        handler.exactMatchingQueryParams = 0;
        handler.nonMatchingQueryParams = 0;
        var specQueryParams = handler.parsedUrl.queryParams;
        for (var param in specQueryParams) {
            var value = specQueryParams[param];
            const type = getType(param, handler.queryParamsInfo);
            if (reqQueryParams.hasOwnProperty(param)) {
                var reqValue = reqQueryParams[param];
                //  this prioritizes literal values in the blueprint url
                if (_.isEqual(value, reqValue)) {
                    handler.matchingQueryParams += 1;
                    handler.exactMatchingQueryParams += 1;
                } else if (value === '' && (!type || types.typeMatches(reqValue, type))) {
                    handler.matchingQueryParams += 1;
                }
            } else {
                handler.nonMatchingQueryParams += 1;
            }
        }
    });
};

function getType(paramName, paramInfo) {
    return paramInfo
        && paramInfo[paramName]
        && paramInfo[paramName].type;
}
