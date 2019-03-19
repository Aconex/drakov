const assert = require('assert');
const response = require("../../../lib/middleware/response");

function ResponseSpy() {
    this.capturedHeaders = [];
    this.set = (key, value) => {
        this.capturedHeaders.push({key, value});
    }
}

const noOp = () => {
};

describe('corsHeaders', () => {
    describe('Given the cors headers middleware is created with permissiveCors = true', () => {
        const corsHeaders = response.corsHeaders(false, false, true);
        describe('when calling the function with the access-control-request-headers', () => {
            const baseHeaders = 'Origin, X-Requested-With, Content-Type, Accept';
            const requestHeaders = 'some headers that I want to send';
            const expectedAllowHeaders = baseHeaders + ',' + requestHeaders;
            const request = {
                headers: {
                    'access-control-request-headers': requestHeaders
                }
            };

            const respSpy = new ResponseSpy();

            corsHeaders(request, respSpy, noOp);

            const allExpectedHeaders = [
                {key: 'Access-Control-Allow-Origin', value: '*'},
                {key: 'Access-Control-Allow-Credentials', value: 'true'},
                {key: 'Access-Control-Allow-Headers', value: expectedAllowHeaders},
            ];
            it('then it has added the requested cors headers', () => {
                assert.deepStrictEqual(respSpy.capturedHeaders, allExpectedHeaders)
            })
        });
    });
});

describe('allowMethods', () => {
    describe('Given the cors methods middleware is created with permissiveCors = true', () => {
        const allowMethods = response.allowMethods(false, true);
        describe('when calling the function with the access-control-request-methods', () => {
            const expectedMethods = 'some methods I want to use';
            const request = {
                headers: {
                    'access-control-request-method': expectedMethods
                }
            };

            const respSpy = new ResponseSpy();

            allowMethods(request, respSpy, noOp);

            const allExpectedHeaders = [
                {key: 'Access-Control-Allow-Methods', value: expectedMethods},
            ];
            it('then it has added the requested cors headers', () => {
                assert.deepStrictEqual(respSpy.capturedHeaders, allExpectedHeaders)
            })
        });
    });
});
