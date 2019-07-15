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
        describe('THEN all listed resources are served with expected bodies', () => {
            it('valid GET /demo is served', (done) => {
                request.get('/demo')
                    .expect(200)
                    .expect({
                        "question": "Why?",
                        "choices": ["Why not?", "BECAUSE!"]
                    })
                    .end(done);
            });

            it('valid POST /demo is served', (done) => {
                request.post('/demo')
                    .send({
                        "title": "Meaning of life?"
                    })
                    .expect(200)
                    .expect({
                        "question": "Why?",
                        "choices": ["42", "Forty-two!"]
                    })
                    .end(done);
            });


            it('invalid POST /demo is served', (done) => {
                request.post('/demo')
                    .send({
                        "title": "Ultimate anwser"
                    })
                    .expect(200)
                    .expect({
                        "choices": ["hmmmmm?!"]
                    })
                    .end(done);
            });

            it('invalid PUT /demo is served', (done) => {
                request.put('/demo')
                    .send({
                        "title": "Meaning of liffff?"
                    })
                    .expect(200)
                    .expect({
                        "question": "Y?",
                        "choices": ["37", "Forty!"]
                    })
                    .end(done);
            });

            it('valid GET demo with path param /demo/path-param is served', (done) => {
                request.get('/demo/path-param')
                    .expect(200)
                    .expect({
                        "question": "Who?",
                        "choices": ["Me", "Not Me!"]
                    })
                    .end(done);
            });

            it('invalid GET bad response demo/missing is served', (done) => {
                request.get('/demo/missing')
                    .expect(200)
                    .expect({
                        "question": "?"
                    })
                    .end(done);
            });

            it('valid GET with literal path demo/detail is served', (done) => {
                request.get('/demo/detail')
                    .expect(200)
                    .expect({
                        "query": "How Many?",
                        "answers": [1, 42]
                    })
                    .end(done);
            });

            it('valid GET with query param /demo?query=value is served', (done) => {
                request.get('/demo?query=value')
                    .expect(200)
                    .expect({
                        "question": "When?",
                        "choices": ["Now", "Later"]
                    })
                    .end(done);
            });

            it('undefined resource', (done) => {
                request.get('/unknown')
                    .expect(200)
                    .end(helper.endCb(done));
            });
        });
    })

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
                        "question": "Why?",
                        "choices": ["Why not?", "BECAUSE!"]
                    })
                    .end(done);
            });

            it('valid POST /demo is served', (done) => {
                request.post('/demo')
                    .send({
                        "title": "Meaning of life?"
                    })
                    .expect(200)
                    .expect({
                        "question": "Why?",
                        "choices": ["42", "Forty-two!"]
                    })
                    .end(done);
            });

            it('invalid POST /demo is NOT served', (done) => {
                request.post('/demo')
                    .send({
                        "title": "Ultimate anwser"
                    })
                    .expect(404)
                    .end(done);
            });

            it('invalid PUT /demo is NOT served', (done) => {
                request.put('/demo')
                    .send({
                        "title": "Meaning of liffff?"
                    })
                    .expect(404)
                    .end(done);
            });

            it('valid GET demo with path param /demo/path-param is served', (done) => {
                request.get('/demo/path-param')
                    .expect(200)
                    .expect({
                        "question": "Who?",
                        "choices": ["Me", "Not Me!"]
                    })
                    .end(done);
            });

            it('invalid GET bad response demo/missing is NOT served', (done) => {
                request.get('/demo/missing')
                    .expect(404)
                    .end(done);
            });

            it('valid GET with literal path demo/detail is served', (done) => {
                request.get('/demo/detail')
                    .expect(200)
                    .expect({
                        "query": "How Many?",
                        "answers": [1, 42]
                    })
                    .end(done);
            });

            it('valid GET with query param /demo?query=value is served', (done) => {
                request.get('/demo?query=value')
                    .expect(200)
                    .expect({
                        "question": "When?",
                        "choices": ["Now", "Later"]
                    })
                    .end(done);
            });

            it('undefined resource is NOT served', (done) => {
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
                        "question": "Why?",
                        "choices": ["Why not?", "BECAUSE!"]
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
