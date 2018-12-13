// @flow 
const fs = require('fs');
const drafter = require('drafter');

const urlParser = require('./url');
const logger = require('../logger');
export type Mappings = { [string]: string }

type Schema = {
    request: ?string,
    response: ?string
};

type Verb = string;
type Url = string;

type Actions = {
    [Verb]: Schema
};

type Resources = {
    [Url]: Actions
};

export type Contract = {
    fixtureFolder: string,
    resources: Resources
}
type Body = {
    schema: string
};

export type Example = {
    requests: Array<Body>,
    responses: Array<Body>
};

export type Action = {
    method: string,
    examples: ?Array<Example>
}

const readContractFixtureMap = (contractFixtureMapFile: string): Mappings => {
    let contents: string;
    try {
        contents = fs.readFileSync(contractFixtureMapFile, { encoding: 'utf8' });
    } catch (e) {
        const message = `Unable to read contract fixture map file "${contractFixtureMapFile}"`
        logger.error(message);
        throw Error(message);
    }

    let contractFixtureMap: Mappings;
    try {
        contractFixtureMap = JSON.parse(contents);
    } catch (e) {
        const message = `Unable to parse contract fixture map contents "${contractFixtureMapFile}"
            Cause: ${e}`;
        logger.error(message);
        throw Error(message);
    }

    return contractFixtureMap;
};

const parseContracts = (mappings: Mappings): Array<Contract> => {
    const contracts: Array<Contract> = [];
    Object.keys(mappings).forEach(contractFile => {

        let data: string
        try {
            data = fs.readFileSync(contractFile, { encoding: 'utf8' });
        } catch (e) {
            const message = `Unable to read contract file "${contractFile}"`
            logger.error(message);
            throw Error(message);
        }

        const options = { type: 'ast' };
        let parsedContract;
        try {
            parsedContract = drafter.parseSync(data, options);
        } catch (e) {
            const message = `Error parsings contract contents "${contractFile}"
            Cause: ${e}`;
            logger.error(message);
            throw Error(message);
        }

        const resources: Resources = {};
        parsedContract.ast.resourceGroups.forEach(resourceGroup => {
            resourceGroup.resources.forEach(resourceExample => {
                var url: string = urlParser.parse(resourceExample.uriTemplate).url;

                const resource = resources[url] || {}
                resources[url] = resource;

                resourceExample.actions.forEach((action: Action) => {
                    if (resource[action.method]) {
                        logger.error(`${action.method} "${url}" is defined more than once; ignoring additional schema`);

                    } else {
                        const schema: ?Schema = createSchema(action, url);
                        if (schema) {
                            resource[action.method] = schema;
                        }
                    }
                });
            });
        });

        const contract: Contract = {
            fixtureFolder: mappings[contractFile],
            resources
        };

        contracts.push(contract);
    });

    return contracts;

};


const createSchema = (action: Action, url: string): ?Schema => {

    const httpVerb = action.method;

    const example: ?Example = action.examples && action.examples[0];
    if (!example) {
        logger.error(`No request/response pairs found for: ${httpVerb} "${url}"`);
        return;
    }

    const request = example.requests[0] && example.requests[0].schema;
    const response = example.responses[0] && example.responses[0].schema;

    return {
        request,
        response
    };
};
module.exports = {
    parseContracts,
    readContractFixtureMap,
}