var helper = require('../lib');
var request = helper.getRequest();

describe('HEADERS', function(){

    before(function (done) {
        helper.drakov.run({sourceFiles: 'test/example/md/headers.md', method: ['DELETE', 'OPTIONS']}, done);
    });

    after(function (done) {
        helper.drakov.stop(done);
    });

    describe('/headers', function(){

        describe('DELETE', function(){
            it('should respond with HTTP 200 and Access-Control-Allow-Methods', function(done){
                request.delete('/headers')
                .expect(200)
                .expect('Access-Control-Allow-Methods', 'DELETE,OPTIONS')
                .end(helper.endCb(done));
            });
        });
    });

});
