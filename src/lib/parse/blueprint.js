//@flow
var fs = require('fs');
var drafter = require('drafter');
var _ = require('lodash');
var pathToRegexp = require('path-to-regexp');

var urlParser = require('./url');
var parseParameters = require('./parameters');
var parseAction = require('./action');
let contracts = require('./contracts');
var logger = require('../logger');
var autoOptionsAction = require('../json/auto-options-action.json');
import type {Actions, Blueprint, BlueprintResource, Contract, Resources} from '../parse/contracts';

module.exports = function(filePath: string, autoOptions: boolean, routeMap: {}, contract?: Contract) {
    return function(cb: (err: ?Error) => void) {
        var data = fs.readFileSync(filePath, {encoding: 'utf8'});
        var options = { type: 'ast' };
        drafter.parse(data, options, function(err: Error, result: Blueprint) {
            if (err) {
                logger.log(err);
                return cb(err);
            }

            var allRoutesList = [];
            result.ast.resourceGroups.forEach(function(resourceGroup){
                if (contract) {
                    const exitstingContract = contract;
                    resourceGroup.resources.forEach((resource) => {
                        validateAndSetupResource(resource, exitstingContract);
                    });
                } else {
                    resourceGroup.resources.forEach(setupResourceAndUrl);
                }
            });

            // add OPTIONS route where its missing - this must be done after all routes are parsed
            if (autoOptions) {
                addOptionsRoutesWhereMissing(allRoutesList);
            }

            cb();

            function validateAndSetupResource(fixtureResource: BlueprintResource, contract: Contract) {
                const fixtureUrl = urlParser.parse(fixtureResource.uriTemplate).url;
               
                const contractActions: ?Actions = getActions(fixtureUrl, contract.resources);

                let valdatedResource = contracts.removeInvalidActions(fixtureResource, contractActions);
                if (!valdatedResource.actions.length) {
                    return;
                }
                var parsedUrl = urlParser.parse(valdatedResource.uriTemplate);
                var key = parsedUrl.url;
                routeMap[key] = routeMap[key] || { urlExpression: key, methods: {} };
                parseParameters(parsedUrl, valdatedResource.parameters, routeMap);
                valdatedResource.actions.forEach(function(action){
                    parseAction(parsedUrl, action, routeMap);
                    saveRouteToTheList(parsedUrl, action);
                });
            }

            function getActions(fixtureUrl: string, contractResources: Resources): ?Actions {
                for (const contractResourceUrl in contractResources) {
                    var regex = pathToRegexp(contractResourceUrl);
                    var match = regex.exec(fixtureUrl);
                    if (match) {
                        return contractResources[contractResourceUrl];
                    }
                }
            }

            function setupResourceAndUrl(resource: BlueprintResource) {
                var parsedUrl = urlParser.parse(resource.uriTemplate);
                var key = parsedUrl.url;
                routeMap[key] = routeMap[key] || { urlExpression: key, methods: {} };
                parseParameters(parsedUrl, resource.parameters, routeMap);
                resource.actions.forEach(function(action){
                    parseAction(parsedUrl, action, routeMap);
                    saveRouteToTheList(parsedUrl, action);
                });
            }

            /**
             * Adds route and its action to the allRoutesList. It appends the action when route already exists in the list.
             * @param resource Route URI
             * @param action HTTP action
             */
            function saveRouteToTheList(parsedUrl, action) {
                // used to add options routes later
                if (typeof allRoutesList[parsedUrl.url] === 'undefined') {
                    allRoutesList[parsedUrl.url] = [];
                }
                allRoutesList[parsedUrl.url].push(action);
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
                    var parsedUrl = urlParser.parse(uriTemplate);
                    parseAction(parsedUrl, autoOptionsAction, routeMap);
                });
            }
        });
    };
};
