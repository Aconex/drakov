var fs = require('fs');
var protagonist = require('protagonist');
var _ = require('lodash');
var parseAction = require('./action');
var autoOptionsAction = require('../json/auto-options-action.json');

module.exports = function(filePath, autoOptions, routeMap) {
    return function(cb) {
        var data = fs.readFileSync(filePath, {encoding: 'utf8'});
        protagonist.parse(data, function(err, result) {
            if (err) {
                console.log(err);
                return;
            }

            var allRoutesList = [];
            result.ast.resourceGroups.forEach(function(resourceGroup){
                resourceGroup.resources.forEach(function(resource){
                    resource.actions.forEach(function(action){
                        parseAction(resource.uriTemplate, action, routeMap);
                        saveRouteToTheList(resource, action);
                    });
                });
            });

            // add OPTIONS route where its missing - this must be done after all routes are parsed
            if (autoOptions) {
                addOptionsRoutesWhereMissing(allRoutesList);
            }

            cb();

            /**
             * Adds route and its action to the allRoutesList. It appends the action when route already exists in the list.
             * @param resource Route URI
             * @param action HTTP action
             */
            function saveRouteToTheList(resource, action) {
                // used to add options routes later
                if (typeof allRoutesList[resource.uriTemplate] === 'undefined') {
                    allRoutesList[resource.uriTemplate] = [];
                }
                allRoutesList[resource.uriTemplate].push(action);
            }

            function addOptionsRoutesWhereMissing(allRoutes) {
                var routesWithoutOptions = [];
                // extracts only routes without OPTIONS
                _.forIn(allRoutes, function (actions, route) {
                    var containsOptions = _.reduce(actions, function (previousResult, iteratedAction) {
                        return previousResult || (iteratedAction.method === 'OPTIONS');
                    }, false);
                    if (!containsOptions) {
                        routesWithoutOptions.push(route);
                    }
                });

                _.forEach(routesWithoutOptions, function (uriTemplate) {
                    // adds prepared OPTIONS action for route
                    parseAction(uriTemplate, autoOptionsAction, routeMap);
                });
            }
        });
    };
};
