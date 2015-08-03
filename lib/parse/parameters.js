
module.exports = function(parsedUrl, parameters, routeMap) {
    var parametersMap = {};

    function addParameter(parameter) {
        parametersMap[parameter.name] = parameter;
    }

    if (parameters && parameters.length) {
        parameters.forEach(addParameter);
        routeMap[parsedUrl.url].parameters = parametersMap;
    }
};
