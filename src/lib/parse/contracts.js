// @flow 
const fs = require('fs');
const path = require('path');
const drafter = require('drafter');

const endpointSorter = require('../middleware/endpoint-sorter');
const urlParser = require('./url');
const logger = require('../logging/logger');
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
    responses: Array<Response>
};

type Response = {
    status: string,
    schema: ?JsonSchema
};

type JsonSchema = any // any valid JSON-schema

type BodyValidationResult = {
    valid: boolean,
    message: string
};

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
    body?: string,
    // name is what the apib parser calls the status code
    name: string,
};

function isHttpPath(filePath: string): boolean {
    return /^https?:\/\//.test(filePath)
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
        logger.warn(`Warnings for contract "${contractFilePath}":\n ${parsedContract.warnings.map(formatWarning).join('\n')}`);
    }

    return parsedContract;
}


const mapBlueprintToResources = (blueprint: Blueprint): Resources => {
    const resources: Resources = {};

    blueprint.ast.resourceGroups.forEach(resourceGroup => {
        resourceGroup.resources.forEach(resourceExample => {
            let url: string = urlParser.parse(resourceExample.uriTemplate).url;

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

    const request = example.requests && example.requests[0];

    return {
        request: getSchema(request),
        responses: example.responses && example.responses.map(response => ({
           status: response.name,
           schema: getSchema(response)
        }))
    };
};

const getSchema = (body: BodyDescriptor): ?JsonSchema => {
    if (!body) return;

    const validatedBody: BodyDescriptor = schemaValidator.validateAndParseSchema(body);
    return validatedBody.schema;
};


const validateBody = (fixtureBody?: BodyDescriptor, contractSchema: JsonSchema): BodyValidationResult => {
    let result: BodyValidationResult;
    try {
        // the validator throws an error with empty scenario body  
        // this validates this case
        if (!fixtureBody || !fixtureBody.body) {
            if (contractSchema) {
                result = { valid: false, message: 'Contract has response schema, but fixture has no response body' };
            } else {
                result = { valid: true, message: '' };
            }
        } else {
            const parsedBody = JSON.parse(fixtureBody.body);
            const validated = schemaValidator.matchWithSchema(parsedBody, contractSchema);
            result = {
                valid: validated.valid,
                message:  validated.niceErrors && `${validated.niceErrors.join('; ')}`,
            }
        }
    } catch (e) {
        if (e.name === 'SyntaxError') {
            result = { valid: false, message: `error parsing body\n\t${e.message}` };
        } else {
            throw e;
        }
    }
    return result;
};
const removeInvalidFixtures = (resource: BlueprintResource, contractActions: ?Actions): BlueprintResource => {
    const validActions: Array<BlueprintAction> = [];

    resource.actions.forEach((fixtureAction) => {
        const contractAction = contractActions && contractActions[fixtureAction.method];
        if (!contractAction) {
            logger.error(`${fixtureAction.method} ${resource.uriTemplate} is not in the contract`);
            return;
        }
        if (!fixtureAction.examples || !fixtureAction.examples.length) {
            logger.error(`${fixtureAction.method} ${resource.uriTemplate} has no examples in the contract`);
            return;
        }
        const validExamples: Array<Example> = [];

        fixtureAction.examples.forEach((example, exampleIndex) => {

            //enforce requests and responses in pairs - otherwise it is hard to reason about author's expectations
            if (example.requests.length > 1 ||  example.responses.length > 1) {
                throw new Error(`Found more than one request or response for example ${exampleIndex}. Requests and responses expected in pairs.`);
            }
            const fixtureRequest = example.requests[0];
            const fixtureResponse = example.responses[0];

            const requestValid = validateBody(fixtureRequest, contractAction.request);

            if (!requestValid.valid) {
                logger.error(`${fixtureAction.method} ${resource.uriTemplate} example[${exampleIndex}] request ${requestValid.message}`);
                // if request isn't valid we don't care if responses are
                return;
            }

            let responseValid = false;
            const errors = [];
            for (let i = 0; i < contractAction.responses.length; i++) {
                const contractResponse = contractAction.responses[i];
                if (fixtureResponse.name !== contractResponse.status) {
                    errors.push(`For contract response[${i}]: Http status code does not match: fixture=${fixtureResponse.name} contract=${contractResponse.status}`);
                    continue;
                }

                const validationResult = validateBody(fixtureResponse, contractResponse.schema);
                if (validationResult.valid) {
                    responseValid = true;
                    break;
                }
                errors.push(`For contract response[${i}]: ${validationResult.message}`);
            }
            if (responseValid) {
                validExamples.push({
                    requests: [fixtureRequest],
                    responses: [fixtureResponse]
                });
            } else {
                logger.error(`${fixtureAction.method} ${resource.uriTemplate} example[${exampleIndex}] response matches no contract response:\n\t${errors.join('\n\t')}`);
            }
        });

        if (validExamples.length) {
            const actionWithValidExamples: BlueprintAction = Object.assign({}, fixtureAction, { examples: validExamples });
            validActions.push(actionWithValidExamples);
        } else {
            logger.error(`${fixtureAction.method} ${resource.uriTemplate} has no valid examples and has been excluded`);

        }
    });
    return Object.assign({}, resource, { actions: validActions });
};

module.exports = {
    removeInvalidFixtures,
    parseContracts,
    readContractFixtureMap,
};
