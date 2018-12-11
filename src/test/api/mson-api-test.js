var helper = require('../lib');
var request = helper.getRequest();

describe('MSON-API', function(){
    before(function (done) {
        helper.drakov.run({sourceFiles: 'test/example/md/mson-api.md'}, done);
    });

    after(function (done) {
        helper.drakov.stop(done);
    });

    describe('/api/things', function(){
        describe('GET', function(){
            it('should respond with json collection from contract example', function(done){
                request.get('/api/things')
                .expect(200)
                .expect('Content-type', 'application/json;charset=UTF-8')
                .expect([{text:'Zip2',id: '1'}])
                .end(helper.endCb(done));
            });
        });
    });

    describe('/api/things/{thingId}', function(){
        describe('GET', function(){
            it('should respond with json object from contract example', function(done){
                request.get('/api/things/1111')
                .expect(200)
                .expect('Content-type', 'application/json;charset=UTF-8')
                .expect([{text: 'Zip2', id: '1'}])
                .end(helper.endCb(done));
            });
        });

        describe('POST', function(){
            it('should respond with json object from contract example', function(done){
                request.post('/api/things/1111')
                .set('Content-type', 'application/json')
                .send([{ text: 'Zip2', id: '1' }])
                .expect(200)
                .expect('Content-type', 'application/json;charset=UTF-8')
                .expect([{ text: 'Zip2', id: '1' }])
                .end(helper.endCb(done));
            });
        });
    });

    describe('/api/charsetless', function(){
        describe('GET', function(){
            it('should not include charset on the response`s content-type', function(done){
                request.get('/api/charsetless')
                    .expect(200)
                    .expect('Content-type', 'application/json')
                    .expect({'charset':'not present', 'id': '1'})
                    .end(helper.endCb(done));
            });
        });
    });

});
