var route = require('../route');
var logger = require('../logging/logger');

module.exports = function(parsedUrl, action, routeMap) {
    var key = parsedUrl.url;

    routeMap[key].methods[action.method] = routeMap[key].methods[action.method] || [];

    var routeHandlers = route.getRouteHandlers(parsedUrl, action);
    routeMap[key].methods[action.method] = routeMap[key].methods[action.method].concat(routeHandlers);
    logger.info('Setup Route:', action.method.green, key.yellow, action.name.blue);
};
