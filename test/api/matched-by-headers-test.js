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

    describe('/demo', () => {

        describe('when the request matches a schema', () => {
            it('should have the `x-matched-by: matches-request-schema` header', (done) => {
                request.post('/demo')
                .send({
                    'question': 'Why?',
                    'choices': ['Why not?', 'BECAUSE!']
                })
                .expect(200)
                .expect('X-Matched-By', 'matches-request-schema')
                .end(helper.endCb(done));
            });
        });


        describe('when the request matches a body', () => {
            it('should have the `x-matched-by: matches-request-body` header', (done) => {
                request.post('/demo')
                .send({
                    'question': 'Why?',
                    'choices': ['who knows?', 'BECAUSE!']
                })
                .expect(200)
                .expect('X-Matched-By', 'matches-request-body')
                .end(helper.endCb(done));
            });
        });
    });


});
