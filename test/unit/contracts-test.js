// @flow
// const contracts = require('../../lib/parse/contracts');
const assert = require('assert');
afterEach(() => {
    // sinon.restore();
});

describe('contracts', () => {
    describe('GIVEN the file does not exist', () => {
        // const readFile  = sinon.stub(fs, 'readFileSync');
        // readFile.throwsException();
        it('WHEN calling parseContracts THEN it throws error', () => {
            // contracts.parseContracts("1");
            assert.ok(false);
        });
    });
});


///make sure tests point at build folder!!!