// @flow
const sinon = require('sinon');
const assert = require('assert');
const fs = require('fs');
const drafter = require('drafter');
const http = require('../../lib/parse/httpFetch');

const urlParser = require('../../lib/parse/url');
const logger = require('../../lib/logging/logger');
const schemaValidator = require('../../lib/spec-schema');
const contracts = require('../../lib/parse/contracts');

import type {
    Actions,
    Blueprint,
    BlueprintAction,
    BlueprintResource,
    BodyDescriptor,
    Contract,
    Example,
    Mappings
} from '../../lib/parse/contracts'

let readFileStub: typeof sinon.stub;
beforeEach(() => {
    readFileStub = sinon.stub(fs, 'readFileSync');
});
afterEach(() => {
    sinon.restore();
});

describe('readContractFixtureMap', () => {

    describe('GIVEN the file does not exist', () => {
        it('WHEN calling readContractFixtureMap THEN it logs the file name AND throws error', () => {
            const expectedMessage = 'Unable to read contract fixture map file "myFile"';
            readFileStub.throws();
            //$FlowFixMe
            assert.throws(() => contracts.readContractFixtureMap('myFile'), {message: expectedMessage});
        });
    });

    describe('GIVEN the file exists', () => {
        describe('AND the file cannot be parsed', () => {
            it('WHEN calling readContractFixtureMap THEN it logs the file name AND throws error', () => {
                const unparsableContents = 'justTryToParseME!!!!!!!!!!';
                readFileStub.returns(unparsableContents);
                const expectedMessage = /^Unable to parse contract fixture map contents "myFile"/;

                //$FlowFixMe
                assert.throws(() => contracts.readContractFixtureMap('myFile'), {message: expectedMessage});
            });
        });
        describe('AND the file is parsable', () => {
            it('WHEN calling readContractFixtureMap' +
                'THEN it returns a map of contracts to fixtures with the relative path added to non-http paths', () => {
                const mappingFileContents: Mappings = {
                    'https://contract1': ['fixture1'],
                    'contract2': ['fixture2']
                };

                const expectedMapping: Mappings = {
                    'https://contract1': ['relative/path/fixture1'],
                    'relative/path/contract2': ['relative/path/fixture2']
                };
                readFileStub.withArgs('relative/path/1').returns(JSON.stringify(mappingFileContents));
                assert.deepEqual(contracts.readContractFixtureMap('relative/path/1'), expectedMapping);
            });

        });
    });
});

describe('parseContracts', () => {
    const mapping: Mappings = {'contract': ['fixture']};

    let validateSchemaStub;
    let urlStub;
    const requestBody: BodyDescriptor = {name: '', schema: 'request schema'};
    const responseBody: BodyDescriptor = {name: '200', schema: 'response schema'};

    beforeEach(() => {
        urlStub = sinon.stub(urlParser, 'parse');
        urlStub.withArgs('blueprint url').returns({url: '/sample-url'});

        validateSchemaStub = sinon.stub(schemaValidator, 'validateAndParseSchema');
        validateSchemaStub.withArgs(requestBody).returns(requestBody);
        validateSchemaStub.withArgs(responseBody).returns(responseBody);
    });

    describe('GIVEN the file does not exist', () => {
        it('WHEN calling readContractFixtureMap THEN it logs the file name AND throws error', async () => {
            readFileStub.throws('some error');
            //$FlowFixMe
            await assert.rejects(async () => await contracts.parseContracts(mapping), {message: 'Unable to read contract file "contract"'});
        });
    });

    describe('GIVEN the contract file starts with "http(s)://"', () => {
        const myContractUrl = 'https://myContractUrl';

        const mappingWithUrl: Mappings = {[myContractUrl]: ['fixture']};
        const contractContents = 'myOnlineContract';

        it('WHEN calling readContractFixtureMap THEN it will try to fetch the file online', async () => {

            const example: Example = {
                requests: [requestBody],
                responses: [responseBody]
            };
            const fixtureAction: BlueprintAction = {
                method: 'POST',
                examples: [example]
            };
            const parsedBlueprint: Blueprint = {
                ast: {
                    resourceGroups: [{
                        resources: [{
                            uriTemplate: 'blueprint url',
                            actions: [fixtureAction]
                        }]
                    }]
                },
                warnings: []
            };

            const fetchStub = sinon.stub(http, 'fetch');
            const drafterStub = sinon.stub(drafter, 'parseSync');
            fetchStub.withArgs(myContractUrl, sinon.match.object).returns(contractContents);
            drafterStub.withArgs(contractContents).returns(parsedBlueprint);
            const actualContracts = await contracts.parseContracts(mappingWithUrl);

            //if we get this then the fetch stub was called successfully
            assert.ok(actualContracts);
        });
    });
    describe('GIVEN the file exists', () => {
        let parseBlueprintStub;
        const blueprintContents = 'Some contents that dont matter one bit';
        beforeEach(() => {
            readFileStub.returns(blueprintContents);
            parseBlueprintStub = sinon.stub(drafter, 'parseSync');
        });

        describe('AND the file cannot be parsed', () => {
            it('WHEN calling parseContracts THEN it logs the file name AND throws error', async () => {
                parseBlueprintStub.throws('parsing error for test');
                const expectedErr = 'Error parsing contract contents "contract"\n\tCause: parsing error for test';

                //$FlowFixMe
                await assert.rejects(async () => await contracts.parseContracts(mapping), {message: expectedErr});
            });
        });

        describe('AND the file is parsable', () => {


            const example: Example = {
                requests: [requestBody],
                responses: [responseBody]
            };
            const fixtureAction: BlueprintAction = {
                method: 'POST',
                examples: [example]
            };
            const expected: Contract = {
                fixtureFolders: ['fixture'],
                resources: {
                    '/sample-url': {
                        'POST': {
                            request: 'request schema',
                            responses: [{status: "200", schema: 'response schema'}]
                        }
                    }
                }
            };

            describe('AND there are parsing warnings', () => {
                it('THEN logs the message and section of the blueprint', async () => {
                    const parsedBlueprint: Blueprint = {
                        ast: {
                            resourceGroups: [{
                                resources: [{
                                    uriTemplate: 'blueprint url',
                                    actions: []
                                }]
                            }]
                        },
                        warnings: [{
                            message: 'warning message',
                            location: [{
                                index: 5,
                                length: 3
                            }]
                        }]
                    };

                    parseBlueprintStub.withArgs(blueprintContents).returns(parsedBlueprint);
                    const log = sinon.spy(logger, 'warn');

                    await contracts.parseContracts(mapping);
                    assert.equal(log.getCall(0).args[0], 'Warnings for contract "contract":\n \twarning message. See: "co"');
                });
            });

            describe('BUT the schema is invalid', () => {
                it('WHEN calling parseContracts THEN it throws an error', async () => {

                    const badBody: BodyDescriptor = {name: "", schema: 'bad schema'};
                    const example: Example = {
                        requests: [requestBody],
                        responses: [badBody]
                    };
                    const fixtureAction: BlueprintAction = {
                        method: 'POST',
                        examples: [example]
                    };

                    // mirror actual drafter results
                    const parsedBlueprint: Blueprint = {
                        ast: {
                            resourceGroups: [{
                                resources: [{
                                    uriTemplate: 'blueprint url',
                                    actions: [fixtureAction]
                                }]
                            }]
                        },
                        warnings: []
                    };

                    validateSchemaStub.withArgs(badBody).throws(new Error('test-err'));
                    parseBlueprintStub.withArgs(blueprintContents).returns(parsedBlueprint);
                    //$FlowFixMe
                    await assert.rejects(async () => await contracts.parseContracts(mapping), {message: 'test-err'});
                });
            });

            describe('BUT there are no resources defined', () => {
                it('WHEN calling parseContracts THEN it throws an error', async () => {

                    // mirror actual drafter results
                    const parsedBlueprint = {
                        ast: {
                            resourceGroups: [{
                                resources: []
                            }]
                        },
                        warnings: []
                    };

                    parseBlueprintStub.withArgs(blueprintContents).returns(parsedBlueprint);
                    //$FlowFixMe
                    await assert.rejects(async () => await contracts.parseContracts(mapping), {message: 'No resources found for "contract"'});
                });
            });

            it('WHEN calling parseContracts THEN it returns a map of contracts to fixtures', async () => {

                // mirror actual drafter results
                const parsedBlueprint = {
                    ast: {
                        resourceGroups: [{
                            resources: [{
                                uriTemplate: 'blueprint url',
                                actions: [fixtureAction]
                            }]
                        }]
                    },
                    warnings: []
                };

                parseBlueprintStub.withArgs(blueprintContents).returns(parsedBlueprint);
                assert.deepEqual(await contracts.parseContracts(mapping), [expected]);
            });

            describe('BUT the schema is missing for a resource', () => {
                it('WHEN calling parseContracts THEN it logs an error with the resource and continue', async () => {

                    const badAction: BlueprintAction = {
                        method: 'PUT',
                        examples: []
                    };
                    // mirror actual drafter results
                    const parsedBlueprint = {
                        ast: {
                            resourceGroups: [{
                                resources: [{
                                    uriTemplate: 'blueprint url',
                                    actions: [fixtureAction, badAction]
                                }]
                            }]
                        },
                        warnings: []
                    };

                    const error = sinon.spy(logger, 'error');

                    parseBlueprintStub.withArgs(blueprintContents).returns(parsedBlueprint);
                    assert.deepEqual(await contracts.parseContracts(mapping), [expected]);
                    assert.equal(error.getCall(0).args[0], 'No request/response pairs found for: PUT "/sample-url"');
                });
            });

            describe('AND there is a duplicate action', () => {
                it('WHEN calling parseContracts THEN it logs an error with the resource and continue', async () => {

                    // mirror actual drafter results
                    const parsedBlueprint = {
                        ast: {
                            resourceGroups: [{
                                resources: [{
                                    uriTemplate: 'blueprint url',
                                    actions: [fixtureAction, fixtureAction]
                                }]
                            }]
                        },
                        warnings: []
                    };

                    const error = sinon.spy(logger, 'error');

                    parseBlueprintStub.withArgs(blueprintContents).returns(parsedBlueprint);
                    assert.deepEqual(await contracts.parseContracts(mapping), [expected]);
                    assert.equal(error.getCall(0).args[0], 'POST "/sample-url" is defined more than once; ignoring additional schema');
                });
            });

        });
    });
});

describe('removeInvalidFixtures', () => {
    let errorSpy;
    let matchWithSchemaStub;
    beforeEach(() => {
        errorSpy = sinon.spy(logger, 'error');
        matchWithSchemaStub = sinon.stub(schemaValidator, 'matchWithSchema');

    });
    const contractActions: Actions = {
        'POST': {
            request: {
                "$schema": "http://json-schema.org/draft-07/schema#",
                "type": "object"
            },
            responses: [
                {
                    status: "",
                    schema: {
                        "$schema": "http://json-schema.org/draft-07/schema#",
                        "required": ["question", "choices"],
                        "type": "object",
                        "properties": {
                            "question": {
                                "type": "string"
                            },
                            "choices": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "minItems": 2
                            }
                        }

                    }
                },
                {
                    status: "409",
                    schema: {
                        "$schema": "http://json-schema.org/draft-07/schema#",
                        "required": ["question", "choices"],
                        "type": "object",
                        "properties": {
                            "error": {
                                "type": "string"
                            }
                        }

                    }
                }
            ],
        },
        'GET': {
            request: null,
            responses: [{
                status: "",
                schema: {
                    "$schema": "http://json-schema.org/draft-07/schema#",
                    "required": ["question", "choices"],
                    "type": "object",
                    "properties": {
                        "question": {
                            "type": "string"
                        },
                        "choices": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            },
                            "minItems": 2
                        }
                    }
                }
            }]
        }
    };

    describe('GIVEN the fixture body matches the contract schema', () => {
        it('WHEN calling removeInvalidFixtures THEN all actions return for both GET and POST', () => {
            const fixtureBody = '{\n"question": "Why?",\n"choices": ["Why not?", "BECAUSE!"]\n}';
            const postAction: BlueprintAction = {
                method: 'POST',
                examples: [{
                    requests: [{name: '', body: fixtureBody}],
                    responses: [{name: '', body: fixtureBody}]
                }],
            };

            const getAction: BlueprintAction = {
                method: 'GET',
                examples: [{
                    requests: [{name: '', headers: ""}],
                    responses: [{name: '', body: fixtureBody}]
                }],
            };
            const fixture: BlueprintResource = {
                uriTemplate: '/sample-url',
                actions: [postAction, getAction]
            };


            const parsedBody = JSON.parse(fixtureBody);
            matchWithSchemaStub.withArgs(parsedBody, contractActions['POST'].responses[0].schema)
                .returns({valid: true});
            matchWithSchemaStub.withArgs(parsedBody, contractActions['POST'].responses[1].schema)
                .returns({valid: true});
            matchWithSchemaStub.withArgs(parsedBody, contractActions['POST'].request)
                .returns({valid: true});

            matchWithSchemaStub.withArgs(parsedBody, contractActions['GET'].request)
                .returns({valid: true});

            assert.deepEqual(contracts.removeInvalidFixtures(fixture, contractActions), fixture);
        });
    });
    describe('GIVEN the a fixture body  does not match the contract schema', () => {
        it('WHEN calling removeInvalidFixtures THEN that action is removed return', () => {
            const fixtureBody = '{\n"question": "Why?",\n"choices": ["Why not?", "BECAUSE!"]\n}';
            const badFixtureBody = '{\n"question": 2,\n"choices": ["Why not?", "BECAUSE!"]\n}';
            const goodAction: BlueprintAction = {
                method: 'POST',
                examples: [{
                    requests: [{name: '', body: fixtureBody}],
                    responses: [{name: '', body: fixtureBody}]
                }],
            };
            const badAction: BlueprintAction = {
                method: 'POST',
                examples: [{
                    requests: [{name: '', body: fixtureBody}],
                    responses: [{name: '', body: badFixtureBody}]
                }],
            };

            const fixture: BlueprintResource = {
                uriTemplate: '/sample-url',
                actions: [goodAction, badAction]
            };

            const expectedResource: BlueprintResource = {
                uriTemplate: '/sample-url',
                actions: [goodAction]
            };

            matchWithSchemaStub.withArgs(JSON.parse(fixtureBody), contractActions['POST'].responses[0].schema)
                .returns({valid: true});
            matchWithSchemaStub.withArgs(JSON.parse(fixtureBody), contractActions['POST'].request)
                .returns({valid: true});

            matchWithSchemaStub.withArgs(JSON.parse(badFixtureBody), contractActions['POST'].responses[0].schema)
                .returns({valid: false, formattedErrors: ['some error passed from the validator']});
            assert.deepEqual(contracts.removeInvalidFixtures(fixture, contractActions), expectedResource);
            assert.equal(errorSpy.getCall(0).args[0], 'POST /sample-url example[0] response matches no contract response:\n' +
                '\tFor contract response[0]: some error passed from the validator\n' +
                '\tFor contract response[1]: Http status code does not match: fixture= contract=409')
        });
    });

    describe('GIVEN an action in the fixture has no match in the contract', () => {
        it('WHEN calling removeInvalidFixtures THEN it logs an error for the missing action and removes it', () => {
            const fixtureBody = '{\n"question": "Why?",\n"choices": ["Why not?", "BECAUSE!"]\n}';
            const validAction: BlueprintAction = {
                method: 'POST',
                examples: [{
                    requests: [{name: '', body: fixtureBody}],
                    responses: [{name: '', body: fixtureBody}]
                }],
            };

            const unmatchedAction: BlueprintAction = {
                method: 'DELETE',
                examples: [{
                    requests: [],
                    responses: [{name: '', body: fixtureBody}]
                }],
            };
            const fixture: BlueprintResource = {
                uriTemplate: '/sample-url',
                actions: [validAction, unmatchedAction]
            };

            const expectedResource: BlueprintResource = {
                uriTemplate: '/sample-url',
                actions: [validAction]
            };

            matchWithSchemaStub.withArgs(JSON.parse(fixtureBody), contractActions['POST'].responses[0].schema)
                .returns({valid: true});
            matchWithSchemaStub.withArgs(JSON.parse(fixtureBody), contractActions['POST'].request)
                .returns({valid: true});
            assert.deepEqual(contracts.removeInvalidFixtures(fixture, contractActions), expectedResource);
            assert.equal(errorSpy.getCall(0).args[0], 'DELETE /sample-url is not in the contract');
        });

        describe('GIVEN a fixture body is not valid JSON', () => {
            it('WHEN calling removeInvalidFixtures THEN it logs an error for the fixture and removes it', () => {

                const notJson = 'THIS IS NOT JSON';
                const fixtureAction: BlueprintAction = {
                    method: 'POST',
                    examples: [{
                        requests: [{name: '', body: notJson}],
                        responses: [{name: '', body: notJson}]
                    }],
                };
                const fixture: BlueprintResource = {
                    uriTemplate: '/sample-url',
                    actions: [fixtureAction]
                };

                const expectedResource: BlueprintResource = {
                    uriTemplate: '/sample-url',
                    actions: []
                };

                assert.deepEqual(contracts.removeInvalidFixtures(fixture, contractActions), expectedResource);
                assert.equal(errorSpy.getCall(0).args[0], 'POST /sample-url example[0] request error parsing body\n\tUnexpected token T in JSON at position 0');
            });
        });


    });

    describe('GIVEN a contract that expects an empty response', () => {
        const fixtureAction: BlueprintAction = {
            method: 'POST',
            examples: [{
                requests: [{name: '', body: '{}'}],
                responses: [{name: '', body: ''}]
            }],
        };

        const fixture: BlueprintResource = {
            uriTemplate: '/sample-url',
            actions: [fixtureAction]
        };

        const emptyResponseAction: Actions = {
            'POST': {
                request: {
                    "$schema": "http://json-schema.org/draft-07/schema#",
                    "type": "object"
                },
                responses: [{status: '', schema: ''}]
            }
        };
        it('WHEN calling with an empty response THEN it passes validation', () => {
            matchWithSchemaStub.returns({valid: true});
            assert.deepEqual(contracts.removeInvalidFixtures(fixture, emptyResponseAction), fixture);
        });
    });

    describe('GIVEN the fixture response status code does not match contract', () => {
        const fixtureAction: BlueprintAction = {
            method: 'POST',
            examples: [{
                requests: [{name: '', body: '{}'}],
                responses: [{name: '200', body: ''}]
            }],
        };

        const fixture: BlueprintResource = {
            uriTemplate: '/sample-url',
            actions: [fixtureAction]
        };

        const expectedResource: BlueprintResource = {
            uriTemplate: '/sample-url',
            actions: []
        };

        it('WHEN calling it THEN it fails with helpful message', () => {
            matchWithSchemaStub.returns({valid: true});
            assert.deepEqual(contracts.removeInvalidFixtures(fixture, contractActions), expectedResource);
            assert.equal(errorSpy.getCall(0).args[0], 'POST /sample-url example[0] response matches no contract response:\n' +
                '\tFor contract response[0]: Http status code does not match: fixture=200 contract=\n' +
                '\tFor contract response[1]: Http status code does not match: fixture=200 contract=409');

        });
    });

    describe('GIVEN a contract that expects a response but there is none', () => {
        const fixtureAction: BlueprintAction = {
            method: 'POST',
            examples: [{
                requests: [{name: '', body: '{}'}],
                responses: [{name: '', body: ''}]
            }],
        };

        const fixture: BlueprintResource = {
            uriTemplate: '/sample-url',
            actions: [fixtureAction]
        };

        const expectedResource: BlueprintResource = {
            uriTemplate: '/sample-url',
            actions: []
        };

        const expectedErr = `POST /sample-url example[0] response matches no contract response:
\tFor contract response[0]: Contract has response schema, but fixture has no response body
\tFor contract response[1]: Http status code does not match: fixture= contract=409`;
        it('WHEN calling with an empty response THEN it removes the action and logs a helpful message', () => {
            matchWithSchemaStub.returns({valid: true});
            assert.deepEqual(contracts.removeInvalidFixtures(fixture, contractActions), expectedResource);
            assert.equal(errorSpy.getCall(0).args[0], expectedErr)
        });
    });

    describe('GIVEN a contract that has more than one request', () => {
        const fixtureAction: BlueprintAction = {
            method: 'POST',
            examples: [{
                requests: [{name: '', body: '{}'}, {name: '', body: '{}'}],
                responses: [{name: '', body: ''}]
            }],
        };

        const fixture: BlueprintResource = {
            uriTemplate: '/sample-url',
            actions: [fixtureAction]
        };


        it('WHEN calling it THEN it throws an error', () => {
            matchWithSchemaStub.returns({valid: true});
            assert.throws(() => contracts.removeInvalidFixtures(fixture, contractActions),
                //$FlowFixMe
                {message: 'Found more than one request or response for example 0. Requests and responses expected in pairs.'});
        });
    });

    describe('GIVEN a contract has a request with two responses', () => {
        const fixtureAction: BlueprintAction = {
            method: 'POST',
            examples: [
                {
                    requests: [{name: '', body: '{}'}],
                    responses: [{name: '409', body: '{}'}]
                },
                {
                    requests: [{name: '', body: '{}'}],
                    responses: [{name: '', body: '{}'}]
                }
            ],
        };

        const fixture: BlueprintResource = {
            uriTemplate: '/sample-url',
            actions: [fixtureAction]
        };

        it('WHEN calling with two different valid responses THEN it passes validation AND does not log any errors', () => {
            matchWithSchemaStub.returns({valid: true});
            assert.deepEqual(contracts.removeInvalidFixtures(fixture, contractActions), fixture);
            assert.ok(errorSpy.notCalled);
        });
    });
});
