var helper = require('../lib');
var request = helper.getRequest();

describe('static-versus-parametrized-API', function(){
    before(function (done) {
        helper.drakov.run({sourceFiles: 'test/example/md/static-versus-parametrized-api.md'}, done);
    });

    after(function (done) {
        helper.drakov.stop(done);
    });

    describe('/api/sababa/:itemid', function(){
        describe('GET', function(){
            it('should respond with response from parametrized endpoint', function(done){
                request.get('/api/sababa/123456')
                .expect(200)
                .expect('Content-type', 'application/json;charset=UTF-8')
                .expect({ 'response-type': 'parametrized' })
                .end(helper.endCb(done));
            });
        });
    });

    describe('/api/sababa/static', function(){
        describe('GET', function(){
            it('should respond with response from static endpoint', function(done){
                request.get('/api/sababa/static')
                .expect(200)
                .expect('Content-type', 'application/json;charset=UTF-8')
                .expect({ 'response-type': 'static' })
                .end(helper.endCb(done));
            });
        });

    });

});
