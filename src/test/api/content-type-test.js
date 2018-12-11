var helper = require('../lib');
var request = helper.getRequest();

describe('Simple-API', function(){
    before(function (done) {
        helper.drakov.run({sourceFiles: 'test/example/md/content-type.md'}, done);
    });

    after(function (done) {
        helper.drakov.stop(done);
    });

    describe('/api/content-type', function(){
        describe('GET', function(){
            it('should ignore content-type check when spec does not define it', function(done){
                request.get('/api/content-type')
                .set('Content-type', 'application/json')
                .send({some: 'thing'})
                .expect(200)
                .expect('Content-type', 'application/json;charset=UTF-8')
                .expect({response: 'ha'})
                .end(helper.endCb(done));
            });
        });

        describe('POST', function(){
            it('should ignore content-type check when spec does not define it', function(done){
                request.post('/api/content-type')
                    .set('Content-type', 'application/json')
                    .send({some: 'thing'})
                    .expect(200)
                    .expect('Content-type', 'application/json;charset=UTF-8')
                    .expect({response: 'ha'})
                    .end(helper.endCb(done));
            });
        });
    });

});
