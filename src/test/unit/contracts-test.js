// @flow
const sinon = require('sinon')
const assert = require('assert');

const contracts = require('../../lib/parse/contracts');
afterEach(() => {
    sinon.restore();
});

describe('contracts', () => {
    describe('GIVEN the file does not exist', () => {
        // const readFile  = sinon.stub(fs, 'readFileSync');
        // readFile.throwsException();
        it('WHEN calling parseContracts THEN it throws error', () => {
            contracts.parseContracts(["1"]);
            assert.ok(false);
        });
    });
});

