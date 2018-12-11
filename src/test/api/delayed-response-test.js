var assert = require('assert');

var helper = require('../lib');
var request = helper.getRequest();

var TIME_DELAY = 2000;

describe('DELAYED', function () {

    var startTimestamp;

    before(function (done) {
        helper.drakov.run({sourceFiles: 'test/example/md/simple-api.md', delay: TIME_DELAY}, done);
    });

    after(function (done) {
        helper.drakov.stop(done);
    });

    beforeEach(function(){
        startTimestamp = Date.now();
    });

    afterEach(function(){
        assert.ok(Date.now() - startTimestamp >= TIME_DELAY);
    });


    describe('/api/things', function () {

        describe('GET', function () {
            it('should respond with HTTP 200', function (done) {
                request.get('/api/things')
                    .set('Authorization', 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==')
                    .expect(200)
                    .end(helper.endCb(done));
            });
        });

    });

});
