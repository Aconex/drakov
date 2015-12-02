var helper = require('../lib');
var request = helper.getRequest();

describe('HEADERS', function(){

    before(function (done) {
        helper.drakov.run({sourceFiles: 'test/example/md/headers.md', header: ['Authorization']}, done);
    });

    after(function (done) {
        helper.drakov.stop(done);
    });

    describe('/headers', function(){

        describe('DELETE', function(){
            it('should respond with HTTP 200 and Access-Control-Allow-Headers', function(done){
                request.delete('/headers')
                .expect(200)
                .expect('Access-Control-Allow-Headers', /Authorization/)
                .end(helper.endCb(done));
            });
        });
    });

});
