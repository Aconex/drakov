"use strict"
//@flow

import type {HeaderDef, HeaderValidation} from "../../../lib/parse/headers";

const assert = require('assert');
const headers = require('../../../lib/parse/headers');

describe('parseHeaderValue', () => {
    describe('GIVEN a value that does not contain a pair of parenthesis', () => {
        const rawHeader: HeaderDef = {
            name: 'name',
            value: 'not parse-able)',
            type: '',
        };
        const expected: HeaderDef = {
            name: 'name',
            value: 'not parse-able)',
            type: '',
            required: true,
        };

        it('THEN it returns the value with required true', () => {
            assert.deepEqual(headers.parseHeaderValue(rawHeader), expected);
        });
    });

    describe('GIVEN a value that has a type and optionality is left out', () => {
        const rawHeader: HeaderDef = {
            name: 'name',
            value: 'value (type)',
            type: '',
        };

        const expected: HeaderDef = {
            name: 'name',
            value: 'value',
            type: 'type',
            required: true
        };

        it('THEN it returns the value parsed with required defaulting to true', () => {
            assert.deepEqual(headers.parseHeaderValue(rawHeader), expected);
        });
    });

    describe('GIVEN a value that has a type and optionality is `optional`', () => {
        const rawHeader: HeaderDef = {
            name: 'name',
            value: 'value (type, optional)',
            type: '',
        };

        const expected: HeaderDef = {
            name: 'name',
            value: 'value',
            type: 'type',
            required: false
        };

        it('THEN it returns the value parsed with required=false', () => {
            assert.deepEqual(headers.parseHeaderValue(rawHeader), expected);
        });
    });

    describe('GIVEN a value that has a type and optionality is not `optional` or `required`', () => {
        const rawHeader: HeaderDef = {
            name: 'name',
            value: 'value (type, some other value)',
            type: '',
        };

        it('THEN it throws', () => {
            assert.throws(() => headers.parseHeaderValue(rawHeader), /For header "name", unrecognized optionality: "some other value"/);
        });
    });

    describe('GIVEN value in back ticks', () => {
        const rawHeader: HeaderDef = {
            name: 'name',
            value: '`some value` (type)',
            type: '',
        };
        const expected: HeaderDef = {
            name: 'name',
            value: 'some value',
            type: 'type',
            required: true
        };

        it('THEN it returns only value without the back ticks', () => {
            assert.deepEqual(headers.parseHeaderValue(rawHeader), expected);
        });
    });

    describe('GIVEN value with trailing whitespace', () => {
        const rawHeader: HeaderDef = {
            name: 'name',
            value: 'some value          (type)',
            type: '',
        };
        const expected: HeaderDef = {
            name: 'name',
            value: 'some value',
            type: 'type',
            required: true
        };

        it('THEN it returns trimmed value', () => {
            assert.deepEqual(headers.parseHeaderValue(rawHeader), expected);
        });
    });
});

describe('compareFixtureAndContractHeaders', () => {
    const contractHeaders: Array<HeaderDef> = [
        {name: 'requiredNumberKey', value: '', type: 'number', required: true},
        {name: 'optionalKey', value: '', type: 'number', required: false},
        {name: 'valueKey', value: 'value', type: '', required: false},
    ];

    describe('When a fixture type does not match contract type', () => {
        const fixtureHeaders: Array<HeaderDef> = [
            {name: 'requiredNumberKey', value: '', type: 'string', required: true},
            {name: 'optionalKey', value: '', type: 'number', required: false},
            {name: 'valueKey', value: 'value', type: '', required: false},
        ];
        it('calling it returns false with an appropriate error message', () => {
            const expected: HeaderValidation = {
                messages: ['Header "requiredNumberKey" types mismatch: expected contract type "number", but got type "string"'],
                valid: false,
            };
            assert.deepEqual(headers.compareFixtureAndContractHeaders(fixtureHeaders, contractHeaders), expected);
        });
    });

    describe('When a fixture value does not match the contract type', () => {
        const fixtureHeaders: Array<HeaderDef> = [
            {name: 'requiredNumberKey', value: 'not a number', type: '', required: true},
            {name: 'optionalKey', value: '', type: 'number', required: false},
            {name: 'valueKey', value: 'value', type: '', required: false},
        ];
        it('calling it returns false with an appropriate error message', () => {
            const expected: HeaderValidation = {
                messages: ['Header "requiredNumberKey" value does not match type: expected contract type "number", but got value "not a number"'],
                valid: false,
            };
            assert.deepEqual(headers.compareFixtureAndContractHeaders(fixtureHeaders, contractHeaders), expected);
        });

    });

    describe('When a fixture value does not match the contract value', () => {
        const fixtureHeaders: Array<HeaderDef> = [
            {name: 'requiredNumberKey', value: '123', type: 'number', required: true},
            {name: 'optionalKey', value: '', type: 'number', required: false},
            {name: 'valueKey', value: 'wrong value', type: '', required: false},
        ];
        it('calling it returns false with an appropriate error message', () => {
            const expected: HeaderValidation = {
                messages: ['Header "valueKey" value does not match contract: expected contract value "value", but got value "wrong value"'],
                valid: false,
            };
            assert.deepEqual(headers.compareFixtureAndContractHeaders(fixtureHeaders, contractHeaders), expected);
        });

    });

    describe('When a fixture header is optional when contract is required', () => {
        const fixtureHeaders: Array<HeaderDef> = [
            {name: 'requiredNumberKey', value: '', type: 'number', required: false},
            {name: 'optionalKey', value: '', type: 'number', required: false},
            {name: 'valueKey', value: 'value', type: '', required: false},
        ];
        it('calling it returns false with an appropriate error message', () => {
            const expected: HeaderValidation = {
                valid: false,
                messages: ['Header "requiredNumberKey" is required in the contract but is optional in the fixture'],
            };
            assert.deepEqual(headers.compareFixtureAndContractHeaders(fixtureHeaders, contractHeaders), expected);
        });

    });

    describe('When a fixture header is missing when contract is required', () => {
        const fixtureHeaders: Array<HeaderDef> = [
            {name: 'optionalKey', value: '', type: 'number', required: false},
            {name: 'valueKey', value: 'value', type: '', required: false},
        ];
        it('calling it returns false with an appropriate error message', () => {
            const expected: HeaderValidation = {
                valid: false,
                messages: ['Header "requiredNumberKey" is required but not in the fixture'],
            };
            assert.deepEqual(headers.compareFixtureAndContractHeaders(fixtureHeaders, contractHeaders), expected);
        });

    });

    describe('When there are multiple errors', () => {
        const fixtureHeaders: Array<HeaderDef> = [
            {name: 'optionalKey', value: 'not a number', type: '', required: false},
            {name: 'valueKey', value: 'wrong value', type: '', required: false},
        ];
        it('calling it returns false with an appropriate error message per issue', () => {
            const expected: HeaderValidation = {
                valid: false,
                messages: [
                    'Header "requiredNumberKey" is required but not in the fixture',
                    'Header "optionalKey" value does not match type: expected contract type "number", but got value "not a number"',
                    'Header "valueKey" value does not match contract: expected contract value "value", but got value "wrong value"',
                ],
            };
            assert.deepEqual(headers.compareFixtureAndContractHeaders(fixtureHeaders, contractHeaders), expected);
        });

    });

    describe('When all the fixtures match', () => {
        const fixtureHeaders: Array<HeaderDef> = [
            {name: 'requiredNumberKey', value: '', type: 'number', required: true},
            {name: 'optionalKey', value: '', type: 'number', required: false},
            {name: 'valueKey', value: 'value', type: '', required: false},
        ];
        it('calling it returns true', () => {
            const expected: HeaderValidation = {
                valid: true,
                messages: [],
            };
            assert.deepEqual(headers.compareFixtureAndContractHeaders(fixtureHeaders, contractHeaders), expected);
        });

    });

    describe('When a fixture header is required when contract is optional and optional key missing', () => {
        const fixtureHeaders: Array<HeaderDef> = [
            {name: 'requiredNumberKey', value: '', type: 'number', required: true},
            {name: 'valueKey', value: 'value', type: '', required: true},
        ];
        it('calling it returns true', () => {
            const expected: HeaderValidation = {
                valid: true,
                messages: [],
            };
            assert.deepEqual(headers.compareFixtureAndContractHeaders(fixtureHeaders, contractHeaders), expected);
        });

    });

});
