// @flow 
const fs = require('fs');
const path = require('path');
const drafter = require('drafter');

const endpointSorter = require('../middleware/endpoint-sorter');
const urlParser = require('./url');
const logger = require('../logger');
const schemaValidator = require('../spec-schema');
const http = require('./httpFetch');

export type Mappings = { [string]: Array<string> };
export type SchemaValidationResult = {
    valid: boolean,
    niceErrors: Array<string>
};

// structures for Contracts
export type Contract = {
    fixtureFolders: Array<string>,
    resources: Resources
};

export type Resources = {
    [Url]: Actions
};
type Url = string;

export type Actions = {
    [Verb]: ResourceSchemas
};
type Verb = string;

type ResourceSchemas = {
    request: ?JsonSchema,
    response: ?JsonSchema
};

type JsonSchema = any // any valid JSON-schema


// structures for Fixtures and non-validated blueprints as returned by drafter
type Warning = {
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
    uriTemplate: string,
    actions: Array<BlueprintAction>,
    parameters?: Array<any>
};

export type BlueprintAction = {
    method: string,
    examples: ?Array<Example>
};

export type Example = {
    requests: Array<BodyDescriptor>,
    responses: Array<BodyDescriptor>
};

export type BodyDescriptor = {
    schema?: string,
    body?: string
};

function isHttpPath(filePath: string): boolean {
    return /^http?s:\/\//.test(filePath)
}

const readContractFixtureMap = (contractFixtureMapFile: string): Mappings => {
    const basePath = path.dirname(contractFixtureMapFile);
    let contents: string;
    try {
        contents = fs.readFileSync(contractFixtureMapFile, { encoding: 'utf8' });
    } catch (e) {
        const message = `Unable to read contract fixture map file "${contractFixtureMapFile}"`
        throw new Error(message);
    }

    let rawContractFixtureMap: Mappings;
    try {
        rawContractFixtureMap = JSON.parse(contents);
    } catch (e) {
        const message = `Unable to parse contract fixture map contents "${contractFixtureMapFile}"
            Cause: ${e}`;
        throw new Error(message);
    }
    const contractFixtureMap: Mappings = {};

    Object.keys(rawContractFixtureMap).forEach((key) => {
        const contractPath = isHttpPath(key) ? key : path.join(basePath, key);
        const fixturesPaths = rawContractFixtureMap[key].map(fixturePath => path.join(basePath, fixturePath));
        contractFixtureMap[contractPath] = fixturesPaths;
    });

    return contractFixtureMap;
};



const readFile = async (filePath: string): Promise<string> => {
    let fileContents: string;
    try {
        if (isHttpPath(filePath)) {
            fileContents = await http.fetch(filePath, {
                headers: {
                    'Authorization': `token ${process.env.GIT_TOKEN || ''}`,
                }
            });
        } else {
            fileContents = fs.readFileSync(filePath, { encoding: 'utf8' });
        }
    } catch (e) {
        const message = `Unable to read contract file "${filePath}"`
        throw new Error(message);
    }

    return fileContents;
}


const parseBlueprint = (rawContract: string, contractFilePath: string): Blueprint => {
    let parsedContract: Blueprint;
    const options = { type: 'ast' };
    try {
        parsedContract = drafter.parseSync(rawContract, options);
    } catch (e) {
        const message = `Error parsing contract contents "${contractFilePath}"\n\tCause: ${e}`;
        throw new Error(message);
    }

    if (parsedContract.warnings.length) {
        const formatWarning = (warning: Warning): string => {
            return `\t${warning.message}. See: "${rawContract.substring(warning.location[0].index, warning.location[0].index + warning.location[0].length - 1)}"`;
        }
        logger.log(`Warnings for contract "${contractFilePath}":\n ${parsedContract.warnings.map(formatWarning).join('\n')}`);
    }

    return parsedContract;
}


const mapBlueprintToResources = (blueprint: Blueprint): Resources => {
    const resources: Resources = {};

    blueprint.ast.resourceGroups.forEach(resourceGroup => {
        resourceGroup.resources.forEach(resourceExample => {
            var url: string = urlParser.parse(resourceExample.uriTemplate).url;

            const resource = resources[url] || {}
            resources[url] = resource;

            resourceExample.actions.forEach((action: BlueprintAction) => {
                if (resource[action.method]) {
                    logger.error(`${action.method} "${url}" is defined more than once; ignoring additional schema`);

                } else {
                    const schema: ?ResourceSchemas = extractSchema(action, url);
                    if (schema) {
                        resource[action.method] = schema;
                    }
                }
            });
        });
    });

    return resources;
}

const parseContracts = async (mappings: Mappings): Promise<Array<Contract>> => {
    const contracts: Array<Contract> = [];
    for (const contractFilePath of Object.keys(mappings)) {

        const fileContents = await readFile(contractFilePath);

        const parsedContract = parseBlueprint(fileContents, contractFilePath);

        const resources = mapBlueprintToResources(parsedContract);

        if (!Object.keys(resources).length) {
            throw new Error(`No resources found for "${contractFilePath}"`);
        }

        const contract: Contract = {
            fixtureFolders: mappings[contractFilePath],
            resources: endpointSorter.sortByMatchingPriority(resources)
        };

        contracts.push(contract);
    }

    return contracts;
};


const extractSchema = (action: BlueprintAction, url: string): ?ResourceSchemas => {

    const httpVerb = action.method;

    const example: ?Example = action.examples && action.examples[0];
    if (!example) {
        logger.error(`No request/response pairs found for: ${httpVerb} "${url}"`);
        return;
    }

    const request = example.requests[0] && example.requests[0];
    const response = example.responses[0] && example.responses[0];

    return {
        request: getSchema(request),
        response: getSchema(response)
    };
};

const getSchema = (body: BodyDescriptor): ?JsonSchema => {
    if (!body) return;

    const validatedBody: BodyDescriptor = schemaValidator.validateAndParseSchema(body);
    return validatedBody.schema;
}

type BodyMetadata = {
    method: string,
    url: string,
    exampleIndex: number,
    bodyIndex: number
};

const validateBody = (bodyDescriptor: BodyDescriptor, schema: JsonSchema, bodyType: 'request' | 'response', metadata: BodyMetadata): SchemaValidationResult => {
    let result: SchemaValidationResult;
    try {
        const parsedBody = JSON.parse(bodyDescriptor.body || "");
        result = schemaValidator.matchWithSchema(parsedBody, schema);
        if (!result.valid) {
            logger.error(`${metadata.method} ${metadata.url} example[${metadata.exampleIndex}] ${bodyType}[${metadata.bodyIndex}] failed validation: \n\t${result.niceErrors.join('\n\t')}`);
        }
    } catch (e) {
        if (e.name === 'SyntaxError') {
            result = { valid: false, niceErrors: [] };
            logger.error(`${metadata.method} ${metadata.url} example[${metadata.exampleIndex}] ${bodyType}[${metadata.bodyIndex}] error parsing body\n\t${e.message}`);
        } else {
            throw e;
        }
    }
    return result;
};
const removeInvalidFixtures = (resource: BlueprintResource, contractActions: ?Actions): BlueprintResource => {
    const validActions: Array<BlueprintAction> = []

    resource.actions.forEach((action) => {
        const contractAction = contractActions && contractActions[action.method];
        if (!contractAction) {
            logger.error(`${action.method} ${resource.uriTemplate} is not in the contract`);
            return;
        }
        if (!action.examples) return;
        const validExamples: Array<Example> = [];

        action.examples.forEach((example, exampleIndex) => {
            const validRequests: Array<BodyDescriptor> = [];
            const validResponses: Array<BodyDescriptor> = [];
            if (action.method === 'POST' || action.method === 'PUT') {
                if (example.requests.length !== example.responses.length) {
                    throw new Error('Number of requests and responses are not equal');
                }

                for (let requestIndex = 0; requestIndex < example.requests.length; requestIndex++) {
                    const metadata: BodyMetadata = { method: action.method, url: resource.uriTemplate, exampleIndex, bodyIndex: requestIndex };

                    const request = example.requests[requestIndex];
                    const requestResult = validateBody(request, contractAction.request, 'request', metadata);

                    const response = example.responses[requestIndex];
                    const responseResult = validateBody(response, contractAction.response, 'response', metadata);

                    if (requestResult.valid && responseResult.valid) {
                        validRequests.push(request);
                        validResponses.push(response);
                    }
                }
            } else {
                // Validate GET and DELETE fixtures
                example.responses.forEach((response, responseIndex) => {
                    const metadata: BodyMetadata = { method: action.method, url: resource.uriTemplate, exampleIndex, bodyIndex: responseIndex };
                    const result = validateBody(response, contractAction.response, 'response', metadata);

                    if (result.valid) {
                        validResponses.push(response);
                    }
                });
            }
            if (validRequests.length || validResponses.length) {
                validExamples.push({
                    requests: validRequests,
                    responses: validResponses
                });
            }
        });

        if (validExamples.length) {
            const actionWithValidExamples: BlueprintAction = Object.assign({}, action, { examples: validExamples });
            validActions.push(actionWithValidExamples);
        } else {
            logger.error(`${action.method} ${resource.uriTemplate} has no valid examples and has been excluded`);

        }
    });
    return Object.assign({}, resource, { actions: validActions });
}

module.exports = {
    removeInvalidFixtures,
    parseContracts,
    readContractFixtureMap,
}