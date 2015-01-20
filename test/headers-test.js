var request = require('supertest')('http://localhost:3000');
var endCB = require('./lib/final-callback.js');

describe('/headers', function(){
    describe('GET', function(){
        it('should respond with HTTP 200', function(done){
            request.get('/headers')
            .set('Authorization', 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==')
            .expect(200)
            .end(endCB(done));
        });
    });

    describe('GET', function(){
        it('should respond with HTTP 401', function(done){
            request.get('/headers')
                .set('Authorization', 'Basic foo')
                .expect(401)
                .end(endCB(done));
        });
    });

});
