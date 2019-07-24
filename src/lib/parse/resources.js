//@flow
// structures for Fixtures and non-validated blueprints as returned by drafter
import type {Resource, Resources} from "./contracts";
import type {HeaderDef} from "./headers";

const pathToRegexp = require('path-to-regexp');
const logger = require('../logging/logger');
const types = require('./types-checker');

export type Warning = {
    message: string,
    location: Array<{ index: number, length: number }>
};

export type Blueprint = {
    ast: {
        resourceGroups: Array<ResourceGroup>
    },
    warnings: Array<Warning>
};

export type ResourceGroup = {
    resources: Array<BlueprintResource>
};

export type BlueprintResource = {
    parameters: Array<Parameter>,
    uriTemplate: string,
    actions: Array<BlueprintAction>
};

export type Parameter = {
    name: string,
    type: string,
    required: boolean,
}
export type BlueprintAction = {
    method: string,
    examples: ?Array<Example>
};

export type Example = {
    requests: Array<BodyDescriptor>,
    responses: Array<BodyDescriptor>
};

export type BodyDescriptor = {
    headers?: Array<HeaderDef>,
    schema?: string,
    body?: string,
    // name is what the apib parser calls the status code
    name: string,
};

export type Params = {
    [name: string]: Parameter
}

export type ParsedUrl = {
    url: string,
    queryParams: { [string]: string },
}

const separatePathAndQueryParams = function (parsedUrl: ParsedUrl, resource: BlueprintResource): { pathParams: Params, queryParams: Params } {
    const queryParamKeys = Object.keys(parsedUrl.queryParams);
    const pathParamKeys = pathToRegexp(parsedUrl.url).keys.map(key => key.name);
    let queryParams = {};
    let pathParams = {};
    resource.parameters && resource.parameters.forEach(param => {
        if (param.type && !types.isExpectedType(param.type)) {
            logger.warn(`For parameter "${param.name}" found unknown type: ${param.type}; type checking will be disabled for this parameter.`);
            param.type = '';
        }

        if (queryParamKeys.includes(param.name)) {
            queryParams[param.name] = param;
        } else if (pathParamKeys.includes(param.name)) {
            pathParams[param.name] = param;
        } else {
            logger.warn(`For ${parsedUrl.url}, param ${param.name} was not found in url and has been ignored`);
        }
    });

    return {
        pathParams,
        queryParams,
    };
};

const mapParameterNamesToCapturedValues = function (match: Array<string>, keys: Array<{ name: string }>): { [string]: string } {
    let matches = {};
    keys.forEach((key, i) => {
        // the first match is always the full url
        matches[key.name] = match[i + 1]
    });

    return matches;
};

const selectAndValidateResource = function (fixtureParsedUrl: ParsedUrl, fixtureParams: Array<Parameter>, contractResources: Resources): ?Resource {
    const fixtureUrl = fixtureParsedUrl.url;
    for (const contractResourceUrl in contractResources) {
        let regex = pathToRegexp(contractResourceUrl);
        let match = regex.exec(fixtureUrl);
        if (match) {
            const contractResource = contractResources[contractResourceUrl];
            if (!contractResource) {
                logger.error(`${fixtureUrl} not in the contract`);
                return;
            }
            const reqPathParams = mapParameterNamesToCapturedValues(match, regex.keys);

            let errors = validatePathParams(contractResource, reqPathParams, fixtureParams);

            errors = errors.concat(validateQueryParams(contractResource, fixtureParsedUrl, fixtureParams));

            if (errors.length) {
                logger.error(`${fixtureUrl} rejected: \n\t${errors.join('\n\t')}`);
                return;
            }

            return contractResource;
        }
    }
    //no match
};

function validatePathParams(contractResource: Resource, reqPathParams: {}, fixtureParams: Array<Parameter>) {
    const errors = [];
    //only need to validate parameters listed on the contract
    for (let specParamName in contractResource.pathParams) {
        const specParam = contractResource.pathParams[specParamName];
        const reqValue = reqPathParams[specParamName];
        if (reqValue.startsWith(':')) {
            // this is still a path variable, not a value, so check the fixture parameters section type
            const fixtureParam = fixtureParams.filter(param => param.name === specParamName)[0];
            if (fixtureParam === undefined) {
                errors.push(`Expected parameter '${specParamName} not specified or defined`);
            } else if (fixtureParam.type !== specParam.type) {
                errors.push(`For parameter '${specParamName}', contract listed type '${specParam.type}' but fixture listed type '${fixtureParam.type}'`);
            }
        } else if (!types.typeMatches(reqValue, specParam.type)) {
            errors.push(`For parameter '${specParamName}', expected type '${specParam.type}' but had actual value '${reqValue}'`);
        }
    }
    return errors;
}

function validateQueryParams(contractResource: Resource, fixtureParsedUrl: ParsedUrl, fixtureParams: Array<Parameter>) {
    const errors = [];
    for (let specParamName in contractResource.queryParams) {
        const specParam = contractResource.queryParams[specParamName];
        const reqValue = fixtureParsedUrl.queryParams[specParamName];
        if (reqValue === undefined && specParam.required) {
            errors.push(`Required parameter '${specParamName}' not found`);
        } else if (reqValue === "") {
            // this is still a variable, not a value, so check the fixture parameters section type
            const fixtureParam = fixtureParams.filter(param => param.name === specParamName)[0];
            if (fixtureParam.type !== specParam.type) {
                errors.push(`For parameter '${specParamName}', contract listed type '${specParam.type}' but fixture listed type '${fixtureParam.type}'`);
            } else if (specParam.required && !fixtureParam.required) {
                errors.push(`For parameter '${specParamName}', contract listed parameter as required, but the fixture did not`)
            }
        } else if (!types.typeMatches(reqValue, specParam.type)) {
            errors.push(`For parameter '${specParamName}', expected type '${specParam.type}' but had actual value '${reqValue}'`);
        }
    }
    return errors;
}

module.exports = {
    separatePathAndQueryParams,
    mapParameterNamesToCapturedValues,
    selectAndValidateResource,
};
