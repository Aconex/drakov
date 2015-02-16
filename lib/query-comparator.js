exports.noParamComparator = function(a, b){
    return (a.parsedUrl.queryParams.length - b.parsedUrl.queryParams.length);
};

exports.queryParameterComparator = function(a, b){
    if (b.matchingQueryParams === a.matchingQueryParams){
        return (a.nonMatchingQueryParams - b.nonMatchingQueryParams);
    }
    return (b.matchingQueryParams - a.matchingQueryParams);
};

exports.countMatchingQueryParms = function (handlers, reqQueryParams){
    handlers.forEach(function(handler){
        handler.matchingQueryParams = 0;
        handler.nonMatchingQueryParams = 0;
        handler.parsedUrl.queryParams.forEach(function(templateQueryParam){
            if (reqQueryParams.indexOf(templateQueryParam)>-1){
                handler.matchingQueryParams +=1;
            } else {
                handler.nonMatchingQueryParams +=1;
            }
        });
    });
};