var helper = require('../lib');
var request = helper.getRequest();

describe('UrlEncoded Requests', function() {
    before(function (done) {
        helper.drakov.run({sourceFiles: 'test/example/md/form-urlencoded.md'}, done);
    });

    after(function (done) {
        helper.drakov.stop(done);
    });

    describe('/api/urlencoded', function() {
        describe('if http request body matches exactly with spec request body', function() {
            it('should respond with success response', function(done) {
                request.post('/api/urlencoded')
                    .set('Content-type', 'application/x-www-form-urlencoded')
                    .send('random_number=4&static=not_random')

                    .expect(200)
                    .expect('Content-type', 'application/json;charset=UTF-8')
                    .expect({success: true})
                        .end(helper.endCb(done));
            });
        });

        describe('if http request body does not matches exactly with spec request body', function() {
            it('should respond with 404 error response', function(done) {
                request.post('/api/urlencoded')
                    .set('Content-type', 'application/x-www-form-urlencoded')
                    .send('random_number=555&static=magic')

                    .expect(404)
                    .expect('Content-type', 'text/html; charset=utf-8')
                    .end(helper.endCb(done));
            });
        });
    });

});
