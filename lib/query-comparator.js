var _ = require('lodash');

exports.noParamComparator = function(a, b){
    return (Object.keys(a.parsedUrl.queryParams).length - Object.keys(b.parsedUrl.queryParams).length);
};

exports.queryParameterComparator = function(a, b){
    if (b.matchingQueryParams === a.matchingQueryParams){
        if (b.exactMatchingQueryParams === a.exactMatchingQueryParams){
            return (a.nonMatchingQueryParams - b.nonMatchingQueryParams);
        }
        return (b.exactMatchingQueryParams - a.exactMatchingQueryParams);
    }
    return (b.matchingQueryParams - a.matchingQueryParams);
};

exports.countMatchingQueryParms = function (handlers, reqQueryParams){
    handlers.forEach(function(handler){
        handler.matchingQueryParams = 0;
        handler.exactMatchingQueryParams = 0;
        handler.nonMatchingQueryParams = 0;
        var specQueryParams = handler.parsedUrl.queryParams;
        for(var param in specQueryParams){
            var value = specQueryParams[param];
            if (reqQueryParams.hasOwnProperty(param)){
                var reqValue = reqQueryParams[param];
                if (_.isEqual(value, reqValue)){
                    handler.matchingQueryParams += 1;
                    handler.exactMatchingQueryParams += 1;
                }else if (value === ''){
                    handler.matchingQueryParams += 1;
                }
            }else{
                handler.nonMatchingQueryParams +=1;
            }
        }
    });
};
