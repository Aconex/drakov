var request = require('supertest')('http://localhost:3000');
var endCB = require('./lib/final-callback.js');

describe('/api/multiple', function(){
    describe('GET', function(){
        it('should respond with json object from the first header example', function(done){
            request.get('/api/multiple')
            .set('Custom-header', 'First')
            .expect(200)
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect({"first": "response"})
            .end(endCB(done));
        });

        it('should respond with json object from the second header example', function(done){
            request.get('/api/multiple')
                .set('Custom-header', 'Second')
                .expect(200)
                .expect('Content-type', 'application/json; charset=utf-8')
                .expect({"second": "response"})
                .end(endCB(done));
        });
    });


    describe('POST', function(){
        it('should respond with json object from the first body example', function(done){
            request.post('/api/multiple')
                .set('Content-type', 'application/json')
                .send({"first": "example"})
                .expect(200)
                .expect('Content-type', 'application/json; charset=utf-8')
                .expect({"first": "example","status": "ok"})
                .end(endCB(done));
        });

        it('should respond with json object from the second body example', function(done){
            request.post('/api/multiple')
                .set('Content-type', 'application/json')
                .send({"second": "example"})
                .expect(200)
                .expect('Content-type', 'application/json; charset=utf-8')
                .expect({"second": "example","status": "ok"})
                .end(endCB(done));
        });
    });

});
