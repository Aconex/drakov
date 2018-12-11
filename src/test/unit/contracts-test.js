// @flow
const sinon = require('sinon')
const assert = require('assert');
const fs = require('fs');

const logger = require('../../lib/logger');

const contracts = require('../../lib/parse/contracts');

let readFile: typeof fs.readFileSync;
afterEach(() => {
    sinon.restore();
});

describe('contracts', () => {
    beforeEach(() => {
       readFile  = sinon.stub(fs, 'readFileSync');
    });
    describe('GIVEN the file exists', () => {
 
        it('WHEN calling parseContracts THEN it returns the file contents', () => {
        //    assert.deepEqual(contracts.parseContracts(['2']),[contents1, contents2]);
        });
    });
    
    describe('GIVEN the file does not exist', () => {
        it('WHEN calling parseContracts THEN it logs the file name AND adds nothing to the result', () => {
            const error  = sinon.spy(logger, 'error');
            
            readFile.throws();
            assert.equal(contracts.parseContracts(['1']).length, 0);
            assert.equal(error.getCall(0).args[0], 'Unable to open file "1"');
        });
    });
});

