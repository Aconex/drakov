const helper = require('../lib');
const request = helper.getRequest();

describe('Contract Scenarios Headers Validation', () => {

    describe('GIVEN drakov running in validation mode', () => {
        before((done) => {
            helper.drakov.run({ contractFixtureMap: 'src/test/example/contract/scenario-headers-mapping.json' }, done);
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

            describe('WHEN calling without a header', () => {
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

});