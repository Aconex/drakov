var helper = require('../lib');
var request = helper.getRequest();

describe('HEADERS', function(){

    before(function (done) {
        helper.drakov.run({sourceFiles: 'test/example/md/headers.md',
          ignoreHeader: ['Cookie']}, done);
    });

    after(function (done) {
        helper.drakov.stop(done);
    });

    describe('/headers', function(){

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

    describe('/ignore_headers', function(){

        describe('GET', function(){
            it('should respond with HTTP 200 when header does not exist', function(done){
                request.get('/ignore_headers')
                .expect(200)
                .end(helper.endCb(done));
            });
        });

        describe('GET', function(){
            it('should respond with HTTP 200 when header does not match', function(done){
                request.get('/ignore_headers')
                .set('Cookie', 'key=value2')
                .expect(200)
                .end(helper.endCb(done));
            });
        });
    });

    describe('/things', function(){

        describe('GET', function(){
            it('should respond with HTTP 200', function(done){
                request.get('/things')
                    .expect(200)
                    .expect({'header':'absent'})
                    .end(helper.endCb(done));
            });
        });

        describe('GET', function(){
            it('should respond with HTTP 200 and defined header', function(done){
                request.get('/things')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .expect('Content-type', 'application/json;charset=UTF-8')
                    .expect({'header':'json'})
                    .end(helper.endCb(done));
            });
        });
    });

});
