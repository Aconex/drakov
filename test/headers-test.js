var helper = require('./lib');
var request = require('supertest')('http://localhost:' + helper.port);

describe('/headers', function(){

    before(function (done) {
        helper.drakov.run({sourceFiles: 'test/example/md/headers.md'}, done);
    });

    after(function (done) {
        helper.drakov.stop(done);
    });

    describe('GET', function(){
        it('should respond with HTTP 200', function(done){
            request.get('/headers')
            .set('Authorization', 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==')
            .expect(200)
            .end(helper.endCb(done));
        });
    });

    describe('GET', function(){
        it('should respond with HTTP 401', function(done){
            request.get('/headers')
                .set('Authorization', 'Basic foo')
                .expect(401)
                .end(helper.endCb(done));
        });
    });

});
