var helper = require('../lib');
var request = helper.getRequest();

describe('text/plain media type', function(){
    before(function (done) {
        helper.drakov.run({sourceFiles: 'test/example/md/text-plain.md'}, done);
    });

    after(function (done) {
        helper.drakov.stop(done);
    });

    describe('/login', function(){
        describe('POST', function(){
            it('should respond with spec response', function(done){
                request.post('/login')
                    .set('noredirect', true)
                    .set('Content-type', 'text/plain')
                    .send('username=username&password=password')
                    .expect(200)
                    .expect('Content-type', 'application/json')
                    .expect( {'status':'ok'})
                    .end(helper.endCb(done));
            });
        });
    });

});
