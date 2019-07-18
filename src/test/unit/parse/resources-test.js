//@flow
import type {BlueprintResource, Parameter, ParsedUrl} from "../../../lib/parse/resources";
import type {Resources} from "../../../lib/parse/contracts";

const assert = require('assert');
const resources = require('../../../lib/parse/resources');

describe('separatePathAndQueryParams', () => {
    describe('Given a list of parameters in a resource', () => {
        const paramA: Parameter = {
            name: "A",
            type: "",
            required: true,
        };

        const paramB: Parameter = {
            name: "B",
            type: "",
            required: true,
        };

        const paramC: Parameter = {
            name: "C",
            type: "",
            required: true,
        };

        const paramD: Parameter = {
            name: "D",
            type: "",
            required: true,
        };

        const resource: BlueprintResource = {
            actions: [],
            parameters: [paramA, paramB, paramC, paramD],
            uriTemplate: '',
        };

        const parsedUrl: ParsedUrl = {
            url: '',
            queryParams: {'B': '', 'D': ''},
        };

        it('WHEN calling separatePathAndQueryParams, it returns correct params', () => {
            const expected = {
                pathParams: {'A': paramA, 'C': paramC},
                queryParams: {'B': paramB, 'D': paramD},
            };

            assert.deepStrictEqual(resources.separatePathAndQueryParams(parsedUrl, resource), expected);
        });

    });
});

describe('removeInvalidFixtures', () => {
    const contractResources: Resources = {
        "/demo/:pathparam": {
            "pathParams": {
                "pathparam": {
                    "name": "pathparam",
                    "type": "number",
                    "required": true,
                }
            },
            "queryParams": {
                "q": {
                    "name": "q",
                    "type": "number",
                    "required": true,
                }
            },
            "actions": {}
        }
    };

    describe('WHEN the fixture is valid', () => {
        const fixtureUrl: ParsedUrl = {
            uriTemplate: '/demo/{pathparam}',
            queryParams: {'q':''},
            url: '/demo/:pathparam'
        };

        const fixtureParams = [
            {
                name: 'pathparam',
                type: 'number',
                required: true,
            },
            {
                name: 'q',
                type: 'number',
                required: true,
            }
        ];

        it('THEN it returns the action', () => {
            assert.deepEqual(resources.selectAndValidateResource(fixtureUrl, fixtureParams, contractResources), contractResources["/demo/:pathparam"]);
        });
    });

    describe('WHEN the fixture is valid', () => {
        const fixtureUrl: ParsedUrl = {
            uriTemplate: '/demo/{pathparam}',
            queryParams: {'q':''},
            url: '/demo/:pathparam'
        };

        const fixtureParams = [
            {
                name: 'pathparam',
                type: 'number',
                required: true,
            },
            {
                name: 'q',
                type: 'number',
                required: true,
            }
        ];

        it('THEN it returns the action', () => {
            assert.deepEqual(resources.selectAndValidateResource(fixtureUrl, fixtureParams, contractResources), contractResources["/demo/:pathparam"]);
        });
    });

    describe('WHEN the fixture is missing a required query parameter', () => {
        const fixtureUrl: ParsedUrl = {
            uriTemplate: '/demo/{pathparam}',
            queryParams: {},
            url: '/demo/:pathparam'
        };

        const fixtureParams = [
            {
                name: 'pathparam',
                type: 'number',
                required: true,
            },
            {
                name: 'q',
                type: 'number',
                required: true,
            }
        ];

        it('THEN it returns nothing', () => {
            assert.deepEqual(resources.selectAndValidateResource(fixtureUrl, fixtureParams, contractResources), undefined);
        });
    });

    describe('WHEN the fixture has query parameter of wrong type', () => {
        const fixtureUrl: ParsedUrl = {
            uriTemplate: '/demo/{pathparam}',
            queryParams: {'q':''},
            url: '/demo/:pathparam'
        };

        const fixtureParams = [
            {
                name: 'pathparam',
                type: 'number',
                required: true,
            },
            {
                name: 'q',
                type: 'string',
                required: true,
            }
        ];

        it('THEN it returns nothing', () => {
            assert.deepEqual(resources.selectAndValidateResource(fixtureUrl, fixtureParams, contractResources), undefined);
        });
    });

    describe('WHEN the fixture has query value that is wrong type', () => {
        const fixtureUrl: ParsedUrl = {
            uriTemplate: '/demo/{pathparam}',
            queryParams: {'q':'asd'},
            url: '/demo/:pathparam'
        };

        const fixtureParams = [
            {
                name: 'pathparam',
                type: 'number',
                required: true,
            },
            {
                name: 'q',
                type: 'number',
                required: true,
            }
        ];

        it('THEN it returns nothing', () => {
            assert.deepEqual(resources.selectAndValidateResource(fixtureUrl, fixtureParams, contractResources), undefined);
        });
    });

    describe('WHEN the fixture has a query parameter not required that is in the contract', () => {
        const fixtureUrl: ParsedUrl = {
            uriTemplate: '/demo/{pathparam}',
            queryParams: {'q':''},
            url: '/demo/:pathparam'
        };

        const fixtureParams = [
            {
                name: 'pathparam',
                type: 'number',
                required: true,
            },
            {
                name: 'q',
                type: 'number',
                required: false,
            }
        ];

        it('THEN it returns nothing', () => {
            assert.deepEqual(resources.selectAndValidateResource(fixtureUrl, fixtureParams, contractResources), undefined);
        });
    });

    describe('WHEN the fixture is missing path parameter details', () => {
        const fixtureUrl: ParsedUrl = {
            uriTemplate: '/demo/{pathparam}',
            queryParams: {'q':''},
            url: '/demo/:pathparam'
        };

        const fixtureParams = [
            {
                name: 'q',
                type: 'number',
                required: true,
            }
        ];

        it('THEN it returns nothing', () => {
            assert.deepEqual(resources.selectAndValidateResource(fixtureUrl, fixtureParams, contractResources), undefined);
        });
    });

    describe('WHEN the fixture has a path parameter not correct type', () => {
        const fixtureUrl: ParsedUrl = {
            uriTemplate: '/demo/abc',
            queryParams: {'q':''},
            url: '/demo/abc'
        };

        const fixtureParams = [
            {
                name: 'pathparam',
                type: 'number',
                required: true,
            },
            {
                name: 'q',
                type: 'number',
                required: true,
            }
        ];

        it('THEN it returns nothing', () => {
            assert.deepEqual(resources.selectAndValidateResource(fixtureUrl, fixtureParams, contractResources), undefined);
        });
    });

    describe('WHEN the fixture has a path parameter as wrong type', () => {
        const fixtureUrl: ParsedUrl = {
            uriTemplate: '/demo/{pathparam}',
            queryParams: {'q':''},
            url: '/demo/:pathparam'
        };

        const fixtureParams = [
            {
                name: 'pathparam',
                type: 'string',
                required: true,
            },
            {
                name: 'q',
                type: 'number',
                required: true,
            }
        ];

        it('THEN it returns nothing', () => {
            assert.deepEqual(resources.selectAndValidateResource(fixtureUrl, fixtureParams, contractResources), undefined);
        });
    });

});
