// @flow
const sinon = require('sinon')
// const assert = require('assert');
// const fs = require('fs');


// const contracts = require('../../lib/parse/contracts');
afterEach(() => {
    sinon.restore();
});

describe('contracts', () => {
    describe('GIVEN the file does not exist', () => {
        // const readFile  = sinon.stub(fs, 'readFileSync');
        // readFile.throwsException();

        it('WHEN calling parseContracts THEN it throws error', () => {
            
            // assert.throws(() => contracts.parseContracts(["1"]));
        });
    });
});

