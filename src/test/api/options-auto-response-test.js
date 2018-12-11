var helper = require('../lib');
var request = helper.getRequest();

describe('Auto OPTIONS', function () {

    before(function (done) {
        helper.drakov.run({sourceFiles: 'test/example/md/simple-api.md', autoOptions: true}, done);
    });

    after(function (done) {
        helper.drakov.stop(done);
    });

    it('should respond for OPTIONS despite its not defined in api blueprint', function (done) {
        request.options('/api/things/2')
            .expect(200)
            .expect('Access-Control-Allow-Origin', '*')
            .end(helper.endCb(done));
    });

    it('should not override OPTIONS route specified in api blueprint', function (done) {
        request.options('/api/things')
            .expect(200)
            .expect('Access-Control-Allow-Origin', 'custom-domain.com')
            .end(helper.endCb(done));
    });

    it('should not respond for OPTIONS for paths missing in api blueprint', function (done) {
        request.options('/fjselifjsleifjselij')
            .expect(404)
            .end(helper.endCb(done));
    });

});
