var route = require('../route');

module.exports = function(parsedUrl, action, routeMap) {
    var key = parsedUrl.url;

    routeMap[key].methods[action.method] = routeMap[key].methods[action.method] || [];

    var routeHandlers = route.getRouteHandlers(key, parsedUrl, action);
    routeMap[key].methods[action.method] = routeMap[key].methods[action.method].concat(routeHandlers);
    console.log('[LOG]'.white, 'Setup Route:', action.method.green, key.yellow, action.name.blue);
};
