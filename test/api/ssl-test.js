var helper = require('../lib');
var request = helper.getRequest(true);

describe('SSL', function(){
    before(function (done) {
        var drakovArgs = {
            sourceFiles: 'test/example/md/headers.md',
            sslKeyFile: 'test/ssl/localhost.key',
            sslCrtFile: 'test/ssl/localhost.crt'
        };
        helper.drakov.run(drakovArgs, done);
    });

    after(function (done) {
        helper.drakov.stop(done);
    });

    it('Should respond to HTTPS', function (done) {
        request.get('/things')
            .expect(200)
            .end(helper.endCb(done));
    });
});
