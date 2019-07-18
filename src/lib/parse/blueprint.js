//@flow

import type {Contract, Resource} from "./contracts";
import type {Blueprint, BlueprintResource, ParsedUrl} from "./resources";

var fs = require('fs');
const res = require("./resources");
const resources = require("./resources");
var drafter = require('drafter');
var _ = require('lodash');

var urlParser = require('./url');
var parseAction = require('./action');
const contracts = require('./contracts');
var logger = require('../logging/logger');
var autoOptionsAction = require('../json/auto-options-action.json');

module.exports = function (filePath: string, autoOptions: boolean, routeMap: {}, contract?: Contract) {
    return function (cb: (err: ?Error) => void) {
        logger.info(`Loading file ${filePath}`)
        var data = fs.readFileSync(filePath, {encoding: 'utf8'});
        var options = {type: 'ast'};
        drafter.parse(data, options, function (err: Error, result: Blueprint) {
            if (err) {
                logger.info(err.message);
                return cb(err);
            }

            var allRoutesList = {};
            result.ast.resourceGroups.forEach(function (resourceGroup) {
                if (contract) {
                    const existingContract = contract;
                    resourceGroup.resources.forEach((resource) => {
                        validateAndAddFixturesToServer(resource, existingContract);
                    });
                } else {
                    resourceGroup.resources.forEach(addResourceToServer);
                }
            });


            // add OPTIONS route where its missing - this must be done after all routes are parsed
            if (autoOptions) {
                addOptionsRoutesWhereMissing(allRoutesList);
            }

            cb();

            function validateAndAddFixturesToServer(fixtureResource: BlueprintResource, contract: Contract) {
                const fixtureUrl: ParsedUrl = urlParser.parse(fixtureResource.uriTemplate);

                const contractResource: ?Resource = res.selectAndValidateResource(fixtureUrl, fixtureResource.parameters, contract.resources);
                if (!contractResource) {
                    return;
                }

                let validatedResource: BlueprintResource = contracts.removeInvalidFixtures(fixtureResource, contractResource);
                if (!validatedResource.actions.length) {
                    return;
                }
                addResourceToServer(validatedResource);
            }

            function addResourceToServer(resource: BlueprintResource) {
                var parsedUrl = urlParser.parse(resource.uriTemplate);
                var key = parsedUrl.url;

                const params = resources.separatePathAndQueryParams(parsedUrl, resource);

                routeMap[key] = routeMap[key] || {urlExpression: key, methods: {}};
                routeMap[key].pathParams = params.pathParams;
                resource.actions.forEach(function (action) {
                    parseAction(parsedUrl, action, routeMap, params.queryParams);
                    saveRouteToTheList(parsedUrl, action);
                });
            }

            /**
             * Adds route and its action to the allRoutesList. It appends the action when route already exists in the list.
             */
            function saveRouteToTheList(parsedUrl: ParsedUrl, action) {
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


