const helper = require('../lib');
const request = helper.getRequest();

describe('Contract Scenarios Headers Validation', () => {

    describe('GIVEN drakov running in validation mode', () => {
        before((done) => {
            helper.drakov.run({contractFixtureMap: 'src/test/example/contract/scenario-headers-mapping.json'}, done);
        });

        after((done) => {
            helper.drakov.stop(done);
        });

        describe('AND there are two requests that only differ by a header', () => {
            describe('WHEN calling without a header', () => {
                it('THEN it returns the correct response ', (done) => {
                    request.get('/headers')
                        .expect(200)
                        .expect('"No Header"\n')
                        .end(done);
                });
            });

            describe('WHEN calling with a header', () => {
                it('THEN it returns the correct response ', (done) => {
                    request.get('/headers')
                        .set('id', 'header')
                        .expect(200)
                        .expect('"Has Header"\n')
                        .end(done);
                });
            });
        });
    });

    // do a sanity check to make sure there is not a semantic issue with the fixtures
    describe('GIVEN drakov running in non-validation mode', () => {
        before((done) => {
            helper.drakov.run({
                sourceFiles: 'src/test/example/scenarios/headers/scenario-headers.apib',
            }, done);
        });

        after((done) => {
            helper.drakov.stop(done);
        });

        describe('All requests return', () => {
            it('responds with 200 to all headers', (done) => {
                fullMatchRequest()
                    .expect(200)
                    .end(done);
            });

            it('responds with 200 to only required headers', (done) => {
                onlyRequiredRequest()
                    .expect(200)
                    .end(done);
            });

            it('responds with 200 to missing required headers', (done) => {
                missingRequiredRequest()
                    .expect(200)
                    .end(done);
            });

            it('responds with 200 to wrong type (fixture type does not match contract) headers', (done) => {
                wrongTypeRequest()
                    .expect(200)
                    .end(done);
            });

            it('responds with 200 to a missing value header', (done) => {
                missingValueRequest()
                    .expect(200)
                    .end(done);
            });
        });
    });

    describe('GIVEN drakov running in validation mode for matching', () => {
        before((done) => {
            helper.drakov.run({
                contractFixtureMap: 'src/test/example/contract/scenario-headers-mapping.json',
            }, done);
        });

        after((done) => {
            helper.drakov.stop(done);
        });

        describe('Only valid requests return', () => {
            it('responds with 200 to all headers', (done) => {
                fullMatchRequest()
                    .expect(200)
                    .end(done);
            });

            it('responds with 200 to only required headers', (done) => {
                onlyRequiredRequest()
                    .expect(200)
                    .end(done);
            });

            it('responds with 404 to missing required headers', (done) => {
                missingRequiredRequest()
                    .expect(404)
                    .end(done);
            });

            it('responds with 404 to wrong type (fixture type does not match contract) headers', (done) => {
                wrongTypeRequest()
                    .expect(404)
                    .end(done);
            });

            it('responds with 404 to a missing value header', (done) => {
                missingValueRequest()
                    .expect(404)
                    .end(done);
            });
        });


    });
});

// make sure requests when running in both modes are identical
function fullMatchRequest() {
    return request.get('/header-types/full-match')
        .set('stringRequired', 'a string')
        .set('numberRequired', '234')
        .set('stringOptional', 'also a string')
        .set('value', 'some value');
}

function onlyRequiredRequest() {
    return request.get('/header-types/only-required-match')
        .set('stringRequired', 'a string')
        .set('numberRequired', '234')
        .set('value', 'some value');
}

function missingRequiredRequest() {
    return request.get('/header-types/missing-required')
        .set('numberRequired', '234')
        .set('value', 'some value');
}

function wrongTypeRequest() {
    return request.get('/header-types/wrong-type')
        .set('stringRequired', 'a string')
        .set('numberRequired', '234')
        .set('value', 'some value');
}

function missingValueRequest() {
    return request.get('/header-types/missing-value')
        .set('stringRequired', 'a string')
        .set('numberRequired', '234');
}
