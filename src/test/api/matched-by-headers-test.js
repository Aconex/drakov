var helper = require('../lib');
var request = helper.getRequest();

describe('matches-by-headers', () => {

    before((done) => {
        helper.drakov.run({sourceFiles: 'test/example/md/matched-by-headers-api.apib',
          ignoreHeader: ['Cookie']}, done);
    });

    after((done) => {
        helper.drakov.stop(done);
    });

    describe('given the request body matches a schema but does not equal the body in the spec', () => {
        const validBodyThatIsNotExactMatchWithSpecBody = {
            'question': 'Why?',
            'choices': ['Why not?', 'BECAUSE!']
        };

        describe('when validating the request', () => {
            it('the request is matched by schema and the response should have the `x-matched-by: matches-request-schema` header', (done) => {
                request.post('/demo')
                .send(validBodyThatIsNotExactMatchWithSpecBody)
                .expect(200)
                .expect('X-Matched-By', 'matches-request-schema')
                .end(helper.endCb(done));
            });
        });
    });

    describe('given the request body is an exact match to body in the spec', () => {
        const bodyThatMatchesSpecBodyExactly = {
            'question': 'Why?',
            'choices': ['who knows?', 'BECAUSE!']
        };
        describe('when validating the request', () => {
            it('the request is matched by body and the response should have the `x-matched-by: matches-request-body` header', (done) => {
                request.post('/demo')
                .send(bodyThatMatchesSpecBodyExactly)
                .expect(200)
                .expect('X-Matched-By', 'matches-request-body')
                .end(helper.endCb(done));
            });
        });
    });


});
