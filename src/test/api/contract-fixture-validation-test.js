const helper = require('../lib');
const request = helper.getRequest();

describe.only('Contract Fixture Validation', () => {
    describe('GIVEN drakov is run in normal mode', () => {
        before((done) => {
            helper.drakov.run({ sourceFiles: 'src/test/example/fixtures/contract-fixture-validation.apib' }, done);
        });

        after((done) => {
            helper.drakov.stop(done);
        });
        describe('THEN all listed resources are available with expected bodies', () => {
            it('demo', (done) => {
                request.get('/demo')
                    .expect(200)
                    .expect({
                        "question": "Why?",
                        "choices": ["Why not?", "BECAUSE!"]
                    })
                    .end(done);
            });

            it('valid demo POST', (done) => {
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


            it('invalid demo POST', (done) => {
                request.post('/demo')
                    .send({
                        "title": "Ultimate anwser"
                    })
                    .expect(200)
                    .expect( {
                        "choices": ["hmmmmm?!"]
                    })
                    .end(done);
            });

            it('demo PUT', (done) => {
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

            it('demo/path-param', (done) => {
                request.get('/demo/path-param')
                    .expect(200)
                    .expect({
                        "question": "Who?",
                        "choices": ["Me", "Not Me!"]
                    })
                    .end(done);
            });

            it('demo/missing', (done) => {
                request.get('/demo/missing')
                    .expect(200)
                    .expect({
                        "question": "?"
                    })
                    .end(done);
            });

            it('demo/detail', (done) => {
                request.get('/demo/detail')
                    .expect(200)
                    .expect({
                        "query": "How Many?",
                        "answers": [1, 42]
                    })
                    .end(done);
            });

            it('demo?query=value', (done) => {
                request.get('/demo?query=value')
                    .expect(200)
                    .expect({
                        "question": "When?",
                        "choices": ["Now", "Later"]
                    })
                    .end(done);
            });

            it('unknown', (done) => {
                request.get('/unknown')
                    .expect(200)
                    .end(helper.endCb(done));
            });
        });
    })

    describe('WHEN running in contract validation mode', () => {
        before((done) => {
            helper.drakov.run({ contractFixtureMap: 'src/test/example/contract/contract-fixture-mapping.json' }, done);
        });

        after((done) => {
            helper.drakov.stop(done);
        });

        // lets check that all endpoints listed are valid request/response pairs
        describe('THEN only resources that match the contract are available', () => {
            it('demo', (done) => {
                request.get('/demo')
                    .expect(200)
                    .expect({
                        "question": "Why?",
                        "choices": ["Why not?", "BECAUSE!"]
                    })
                    .end(done);
            });

            it('valid demo POST', (done) => {
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

            it('invalid demo POST', (done) => {
                request.post('/demo')
                    .send({
                        "title": "Ultimate anwser"
                    })
                    .expect(404)
                    .end(done);
            });

            it('demo PUT', (done) => {
                request.put('/demo')
                    .send({
                        "title": "Meaning of liffff?"
                    })
                    .expect(404)
                    .end(done);
            });

            it('demo/path-param', (done) => {
                request.get('/demo/path-param')
                    .expect(200)
                    .expect({
                        "question": "Who?",
                        "choices": ["Me", "Not Me!"]
                    })
                    .end(done);
            });

            it('demo/missing', (done) => {
                request.get('/demo/missing')
                    .expect(404)
                    .end(done);
            });

            it('demo/detail', (done) => {
                request.get('/demo/detail')
                    .expect(200)
                    .expect({
                        "query": "How Many?",
                        "answers": [1, 42]
                    })
                    .end(done);
            });

            it('demo?query=value', (done) => {
                request.get('/demo?query=value')
                    .expect(200)
                    .expect({
                        "question": "When?",
                        "choices": ["Now", "Later"]
                    })
                    .end(done);
            });

            it('unknown', (done) => {
                request.get('/unknown')
                    .expect(404)
                    .end(helper.endCb(done));
            });
        });
    });

});