var route = require('../route');
var logger = require('../logging/logger');

module.exports = function(parsedUrl, action, routeMap, queryParams) {
    var key = parsedUrl.url;

    routeMap[key].methods[action.method] = routeMap[key].methods[action.method] || [];

    var routeHandlers = route.getRouteHandlers(parsedUrl, action, queryParams);
    routeMap[key].methods[action.method] = routeMap[key].methods[action.method].concat(routeHandlers);
    logger.info('Setup Route:', action.method.green, key.yellow, action.name.blue);
};
