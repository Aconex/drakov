var buildRouteMap = require('./route-map');

module.exports = function(sourceFiles) {
    return function(req, res, next) {
        if (res.headersSent) {
            next();
        }
        else {
            buildRouteMap(sourceFiles, function(err, routeMap) {
                if (err) {
                    next(err);
                }
                else {
                    res.render('discover', {
                        routes: Object.keys(routeMap)
                    });
                }
            });
        }
    };
};
