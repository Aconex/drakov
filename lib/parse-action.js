var urlParser = require('./url-parser');
var route = require('./route');

module.exports = function(uriTemplate, action, routeMap) {
    var parsedUrl = urlParser.parse(uriTemplate);
    var key = parsedUrl.url;

    routeMap[key] = routeMap[key] || { urlExpression: parsedUrl.url, methods: {} };
    routeMap[key].methods[action.method] = routeMap[key].methods[action.method] || [];

    var routeHandlers = route.getRouteHandlers(key, parsedUrl, action);
    Array.prototype.push.apply(routeMap[key].methods[action.method], routeHandlers);

    console.log('[LOG]'.white, 'Setup Route:', action.method.green, key.yellow, action.name.blue);
};
