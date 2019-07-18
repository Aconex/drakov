const helper = require('../lib');
const request = helper.getRequest();

describe('Contract Fixture Validation', () => {
    describe('GIVEN drakov is run in non-validation mode', () => {
        before((done) => {
            helper.drakov.run({sourceFiles: 'src/test/example/scenarios/validation/contract-scenario-validation.apib'}, done);
        });

        after((done) => {
            helper.drakov.stop(done);
        });

        //this is to prove that when getting a 404 in the next section, it is not because there is some issue with parsing the fixture
        describe('THEN all listed resources are served with expected bodies', () => {
            it('valid GET /demo is served', (done) => {
                request.get('/demo')
                    .expect(200)
                    .expect({
                        "id": "valid1"
                    })
                    .end(done);
            });

            it('valid POST /demo is served', (done) => {
                request.post('/demo')
                    .send({
                        "requestProp": "validProp"
                    })
                    .expect(200)
                    .expect({
                        "id": "validPair"
                    })
                    .end(done);
            });


            it('invalid POST /demo is served', (done) => {
                request.post('/demo')
                    .send( {
                        "requestProp": "bad prop"
                    })
                    .expect(200)
                    .expect({
                        "notId": "good request bad response"
                    })
                    .end(done);
            });

            it('invalid PUT /demo is served', (done) => {
                request.put('/demo')
                    .send( {
                        "notRequestProp": "this is wrong"
                    })
                    .expect(200)
                    .expect({
                        "id": "bad request good response"
                    })
                    .end(done);
            });

            it('invalid valid GET demo with path param /demo/path-param is served', (done) => {
                request.get('/demo1/path-param')
                    .expect(200)
                    .expect({
                        "id": "path value wrong type"
                    })
                    .end(done);
            });

            it('valid GET demo with path param /demo/123 is served', (done) => {
                request.get('/demo/123')
                    .expect(200)
                    .expect( {
                        "id": "path value valid"
                    })
                    .end(done);
            });

            it('Request with path parameter left as variable but not specified is served', (done) => {
                request.get('/demo2/notANumber')
                    .expect(200)
                    .expect({
                        "id": "param unspecified"
                    })
                    .end(done);
            });

            it('Request with path parameter left as variable specified correctly is served', (done) => {
                request.get('/demo/456')
                    .expect(200)
                    .expect({
                        "id": "number param"
                    })
                    .end(done);
            });

            it('Request path param as value is served', (done) => {
                request.get('/demo/detail')
                    .expect(200)
                    .expect(            {
                        "id": "path parameter value"
                    })
                    .end(done);
            });

            it('Request with query parameter as variable is served', (done) => {
                request.get('/demo?query=variable')
                    .expect(200)
                    .expect( {
                        "id": "query variable"
                    })
                    .end(done);
            });

            it('Request with query parameter with defined value is served', (done) => {
                request.get('/demo?query=value')
                    .expect(200)
                    .expect( {
                        "id": "query value"
                    })
                    .end(done);
            });

            it('Resource with a fixture not in the contract is served', (done) => {
                request.get('/unknown')
                    .expect(200)
                    .expect({
                        "id": "unknown"
                    })
                    .end(helper.endCb(done));
            });
        });
    });

    describe('WHEN running in validation mode', () => {
        before((done) => {
            helper.drakov.run({contractFixtureMap: 'src/test/example/contract/contract-scenario-mapping.json'}, done);
        });

        after((done) => {
            helper.drakov.stop(done);
        });

        // lets check that all endpoints listed are valid request/response pairs
        describe('THEN only resources that match the contract are served', () => {
            it('valid GET /demo is served', (done) => {
                request.get('/demo')
                    .expect(200)
                    .expect({
                        "id": "valid1"
                    })
                    .end(done);
            });

            it('valid POST /demo is served', (done) => {
                request.post('/demo')
                    .send({
                        "requestProp": "validProp"
                    })
                    .expect(200)
                    .expect({
                        "id": "validPair"
                    })
                    .end(done);
            });


            it('invalid POST /demo is NOT served', (done) => {
                request.post('/demo')
                    .send( {
                        "requestProp": "bad prop"
                    })
                    .expect(404)
                    .end(done);
            });

            it('invalid PUT /demo is NOT served', (done) => {
                request.put('/demo')
                    .send( {
                        "notRequestProp": "this is wrong"
                    })
                    .expect(404)
                    .end(done);
            });

            it('invalid valid GET demo with path param /demo/path-param is NOT served', (done) => {
                request.get('/demo1/path-param')
                    .expect(404)
                    .end(done);
            });

            it('valid GET demo with path param /demo/123 is served', (done) => {
                request.get('/demo/123')
                    .expect(200)
                    .expect( {
                        "id": "path value valid"
                    })
                    .end(done);
            });

            it('Request with path parameter left as variable but not specified is NOT served', (done) => {
                request.get('/demo2/notANumber')
                    .expect(404)
                    .end(done);
            });

            it('Request with path parameter left as variable specified correctly is served', (done) => {
                request.get('/demo/456')
                    .expect(200)
                    .expect({
                        "id": "number param"
                    })
                    .end(done);
            });

            it('Request path param as value is served', (done) => {
                request.get('/demo/detail')
                    .expect(200)
                    .expect({
                        "id": "path parameter value"
                    })
                    .end(done);
            });

            it('Request with query parameter as variable is served', (done) => {
                request.get('/demo?query=variable')
                    .expect(200)
                    .expect( {
                        "id": "query variable"
                    })
                    .end(done);
            });

            it('Request with query parameter with defined value is served', (done) => {
                request.get('/demo?query=value')
                    .expect(200)
                    .expect( {
                        "id": "query value"
                    })
                    .end(done);
            });

            it('Resource with a fixture not in contract is not served', (done) => {
                request.get('/unknown')
                    .expect(404)
                    .end(helper.endCb(done));
            });
        });
    });

    describe('WHEN running with multiple contracts', () => {
        before((done) => {
            helper.drakov.run({contractFixtureMap: 'src/test/example/contract/mapping-with-two-contracts.json'}, done);
        });

        after((done) => {
            helper.drakov.stop(done);
        });

        describe('THEN resources from both scenario files are available', () => {
            it('valid GET /demo is served', (done) => {
                request.get('/demo')
                    .expect(200)
                    .expect({
                        "id": "valid1"
                    })
                    .end(done);
            });

            it('valid GET /demo2 is served', (done) => {
                request.get('/demo2')
                    .expect(200)
                    .expect({
                        "question": "Why?",
                        "choices": ["Why not?", "BECAUSE!"]
                    })
                    .end(done);
            });
        });
    });
});
