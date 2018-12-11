var helper = require('../lib');
var request = helper.getRequest();

describe('Reject additional properties', () => {
    before((done) => {
        helper.drakov.run({ sourceFiles: 'src/test/example/md/strict-schema.md' }, done);
    });

    after((done) => {
        helper.drakov.stop(done);
    });

    describe('POST with additional properties', () => {
        const bodyWithUnexpectedProps = {
            id: 1,
            data: { 
                subdata: {
                    subsubdata: 'blah',
                    subsubMoo: 'moo',
                }},
            moo: 'moo',
        };

        const expectedError = '["/data/subdata/subsubMoo Additional properties not allowed","/moo Additional properties not allowed"]';
        describe('when the `reject-unknown-props` header is false', () => {
            it('should respond with success', (done) => {
                request.post('/notes')
                    .set('Content-type', 'application/json')
                    .send(bodyWithUnexpectedProps)
                    .expect(201)
                    .end(helper.endCb(done));
            });
        });

        describe('when the `reject-unknown-props` header is true', () => {
            it('should reject with error message', (done) => {
                request.post('/notes')
                    .set('Content-type', 'application/json')
                    .set('reject-unknown-props', true)
                    .send(bodyWithUnexpectedProps)
                    .expect(400, expectedError)
                    .end(helper.endCb(done));
            });
        });

        // This is specifically to make sure the original schema does not get mutated or corrupted when generating the strict schema
        describe('when sending alternate requests with and without the header', () => {
            it('the response should be successfull only when header is missing', (done) => {
                request.post('/notes')
                    .set('Content-type', 'application/json')
                    .set('reject-unknown-props', true)
                    .send(bodyWithUnexpectedProps)
                    .expect(400, expectedError);

                request.post('/notes')
                    .set('Content-type', 'application/json')
                    .send(bodyWithUnexpectedProps)
                    .expect(201)
                    .end(helper.endCb(done));
            });
        });

    });

});
