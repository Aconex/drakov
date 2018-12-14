// @flow
const sinon = require('sinon')
const assert = require('assert');
const fs = require('fs');
const drafter = require('drafter');

const urlParser = require('../../lib/parse/url');
const logger = require('../../lib/logger');
const specSchema = require('../../lib/spec-schema');
const contracts = require('../../lib/parse/contracts');

import type { Body, BlueprintResource, BlueprintAction, Contract, Actions, Example, Mappings } from '../../lib/parse/contracts'

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
            const error = sinon.spy(logger, 'error');

            readFileStub.throws();
            assert.throws(() => contracts.readContractFixtureMap('myFile'));
            assert.equal(error.getCall(0).args[0], 'Unable to read contract fixture map file "myFile"');
        });
    });

    describe('GIVEN the file exists', () => {
        describe('AND the file cannot be parsed', () => {
            it('WHEN calling readContractFixtureMap THEN it logs the file name AND throws error', () => {
                const error = sinon.spy(logger, 'error');
                const unparsableContents = 'justTryToParseME!!!!!!!!!!';
                readFileStub.returns(unparsableContents);

                assert.throws(() => contracts.readContractFixtureMap('myFile'));
                assert.ok(error.getCall(0).args[0].startsWith('Unable to parse contract fixture map contents "myFile"'));
            });
        });
        describe('AND the file is parsable', () => {
            it('WHEN calling readContractFixtureMap THEN it returns a map of contracts to fixtures', () => {
                const mapping: Mappings = {
                    contract1: 'fixture 1',
                    contract2: 'fixture 2'
                };

                readFileStub.withArgs('1').returns(JSON.stringify(mapping));
                assert.deepEqual(contracts.readContractFixtureMap('1'), mapping);
            });
        });
    });
});

describe('parseContracts', () => {
    const mapping: Mappings = { 'contract': 'fixture' }
    describe('GIVEN the file does not exist', () => {
        it('WHEN calling readContractFixtureMap THEN it logs the file name AND throws error', () => {
            const error = sinon.spy(logger, 'error');

            readFileStub.throws('some error');
            assert.throws(() => contracts.parseContracts(mapping));
            assert.equal(error.getCall(0).args[0], 'Unable to read contract file "contract"');
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
            it('WHEN calling parseContracts THEN it logs the file name AND throws error', () => {
                const error = sinon.spy(logger, 'error');
                parseBlueprintStub.throws('parings error for test');

                assert.throws(() => contracts.parseContracts(mapping));
                assert.ok(error.getCall(0).args[0].startsWith('Error parsings contract contents "contract"'));
            });
        });
        describe('AND the file is parsable', () => {
            const requestBody: Body = { schema: 'request schema' }
            const responseBody: Body = { schema: 'response schema' }

            const example: Example = {
                requests: [requestBody],
                responses: [responseBody]
            };
            const action: BlueprintAction = {
                method: 'POST',
                examples: [example]
            };
            const expected: Contract = {
                fixtureFolder: 'fixture',
                resources: {
                    'final url': {
                        'POST': {
                            request: 'request schema',
                            response: 'response schema'
                        }
                    }
                }
            };
            let validateSchemaStub;
            let urlStub;

            beforeEach(() => {
                urlStub = sinon.stub(urlParser, 'parse');
                urlStub.withArgs('blueprint url').returns({ url: 'final url' });

                validateSchemaStub = sinon.stub(specSchema, 'validateAndParseSchema');
                validateSchemaStub.withArgs(requestBody).returns(requestBody);
                validateSchemaStub.withArgs(responseBody).returns(responseBody);
            });

            describe('BUT the schema is invalid', () => {
                it('WHEN calling parseContracts THEN it throws an error', () => {

                    const badBody: Body = { schema: 'bad schema' }
                    const example: Example = {
                        requests: [requestBody],
                        responses: [badBody]
                    };
                    const action: BlueprintAction = {
                        method: 'POST',
                        examples: [example]
                    };

                    // mirror actual drafter results
                    const parsedBlueprint = {
                        ast: {
                            resourceGroups: [{
                                resources: [{
                                    uriTemplate: 'blueprint url',
                                    actions: [action]
                                }]
                            }]
                        }
                    };

                    validateSchemaStub.withArgs(badBody).throws('test-err');
                    parseBlueprintStub.withArgs(blueprintContents).returns(parsedBlueprint);
                    assert.throws(() => contracts.parseContracts(mapping), /test-err/);
                });
            });

            it('WHEN calling parseContracts THEN it returns a map of contracts to fixtures', () => {

                // mirror actual drafter results
                const parsedBlueprint = {
                    ast: {
                        resourceGroups: [{
                            resources: [{
                                uriTemplate: 'blueprint url',
                                actions: [action]
                            }]
                        }]
                    }
                };

                parseBlueprintStub.withArgs(blueprintContents).returns(parsedBlueprint);
                assert.deepEqual(contracts.parseContracts(mapping), [expected]);
            });

            describe('BUT the schema is missing for a resource', () => {
                it('WHEN calling parseContracts THEN it logs an error with the resource and continue', () => {

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
                                    actions: [action, badAction]
                                }]
                            }]
                        }
                    };

                    const error = sinon.spy(logger, 'error');

                    parseBlueprintStub.withArgs(blueprintContents).returns(parsedBlueprint);
                    assert.deepEqual(contracts.parseContracts(mapping), [expected]);
                    assert.equal(error.getCall(0).args[0], 'No request/response pairs found for: PUT "final url"');
                });
            });

            describe('AND there is a duplicate action', () => {
                it('WHEN calling parseContracts THEN it logs an error with the resource and continue', () => {


                    // mirror actual drafter results
                    const parsedBlueprint = {
                        ast: {
                            resourceGroups: [{
                                resources: [{
                                    uriTemplate: 'blueprint url',
                                    actions: [action, action]
                                }]
                            }]
                        }
                    };

                    const error = sinon.spy(logger, 'error');

                    parseBlueprintStub.withArgs(blueprintContents).returns(parsedBlueprint);
                    assert.deepEqual(contracts.parseContracts(mapping), [expected]);
                    assert.equal(error.getCall(0).args[0], 'POST "final url" is defined more than once; ignoring additional schema');
                });
            });
        });
    });
});

describe('removeInvalidActions', () => {

    const contractActions: Actions = {
        'POST': {
            request: null,
            response: {
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
        }
    };

    describe('GIVEN the fixture body matches the contract schema', () => {
        it('WHEN calling removeInvalidActions THEN all actions return', () => {
            const fixtureBody = '{\n"question": "Why?",\n"choices": ["Why not?", "BECAUSE!"]\n}';
            const action: BlueprintAction = {
                method: 'POST',
                examples: [{
                    requests: [],
                    responses: [{ body: fixtureBody }]
                }],
            };
            const resource: BlueprintResource = {
                uriTemplate: 'final-url',
                actions: [action]
            };

            assert.deepEqual(contracts.removeInvalidActions(resource, contractActions), resource);
        });
    });
    describe('GIVEN the a fixture body  does not match the contract schema', () => {
        it('WHEN calling removeInvalidActions THEN that action is removed return', () => {
            const fixtureBody = '{\n"question": "Why?",\n"choices": ["Why not?", "BECAUSE!"]\n}';
            const badFixtureBody = '{\n"question": 2,\n"choices": ["Why not?", "BECAUSE!"]\n}';
            const goodAction: BlueprintAction = {
                method: 'POST',
                examples: [{
                    requests: [],
                    responses: [{ body: fixtureBody }]
                }],
            };
            const badAction: BlueprintAction = {
                method: 'POST',
                examples: [{
                    requests: [],
                    responses: [{ body: badFixtureBody }]
                }],
            };

            const resource: BlueprintResource = {
                uriTemplate: 'final-url',
                actions: [goodAction, badAction]
            };

            const expectedResource: BlueprintResource = {
                uriTemplate: 'final-url',
                actions: [goodAction]
            };
            assert.deepEqual(contracts.removeInvalidActions(resource, contractActions), expectedResource);
        });
    });
});