var helper = require('../lib');
var request = helper.getRequest();

describe('Json Schema', function () {

    before(function (done) {
        helper.drakov.run({sourceFiles: 'src/test/example/md/json-schema.md'}, done);
    });

    after(function (done) {
        helper.drakov.stop(done);
    });

    it('should match request', function (done) {
        request.post('/notes')
            .set('Content-type', 'application/json')
            .send({id: 1})
            .expect(201)
            .end(helper.endCb(done));
    });
    describe('the request body is incorrect', function () {
        it('should not match request', function (done) {
            request.post('/notes')
                .set('Content-type', 'application/json')
                .send({id: '1'})
                .expect(400, '["/id Invalid type: string (expected number)"]')
                .end(helper.endCb(done));
        });
    });

});
