var helper = require('../lib');
var request = helper.getRequest();

describe('/api/multiple', function(){

    before(function (done) {
        helper.drakov.run({sourceFiles: 'test/example/md/multiple-examples-api.md'}, done);
    });

    after(function (done) {
        helper.drakov.stop(done);
    });

    describe('GET', function(){
        it('should respond with json object from the first header example', function(done){
            request.get('/api/multiple')
            .set('Custom-header', 'First')
            .expect(200)
            .expect('Content-type', 'application/json;charset=UTF-8')
            .expect({'first': 'response'})
            .end(helper.endCb(done));
        });

        it('should respond with json object from the second header example', function(done){
            request.get('/api/multiple')
                .set('Custom-header', 'Second')
                .expect(200)
                .expect('Content-type', 'application/json;charset=UTF-8')
                .expect({'second': 'response'})
                .end(helper.endCb(done));
        });

        it('should respond with preferred status code', function(done) {
            request.get('/api/multiple')
                .set('Prefer', 'status=400')
                .expect(400)
                .expect('Content-type', 'application/json;charset=UTF-8')
                .expect({'error': 'Bad request'})
                .end(helper.endCb(done));
        });
    });

    describe('POST', function(){
        describe('Json content-type', function() {
            it('should respond with json object from the first body example', function (done) {
                request.post('/api/multiple')
                    .set('Content-type', 'application/json')
                    .send({'first': 'example'})
                    .expect(200)
                    .expect('Content-type', 'application/json;charset=UTF-8')
                    .expect({'first': 'example', 'status': 'ok'})
                    .end(helper.endCb(done));
            });

            it('should respond with json object from the second body example', function (done) {
                request.post('/api/multiple')
                    .set('Content-type', 'application/json')
                    .send({'second': 'example'})
                    .expect(200)
                    .expect('Content-type', 'application/json;charset=UTF-8')
                    .expect({'second': 'example', 'status': 'ok'})
                    .end(helper.endCb(done));
            });
        });

        describe('Non-Json content-type', function() {
            it('should respond with json object from the first body example', function (done) {
                request.post('/api/multiple')
                    .set('Content-type', 'application/x-www-form-urlencoded')
                    .send('first=non-json')
                    .expect(200)
                    .expect('Content-type', 'application/json;charset=UTF-8')
                    .expect({first: 'non-json', status: 'ok'})
                    .end(helper.endCb(done));
            });

            it('should respond with json object from the second body example', function (done) {
                request.post('/api/multiple')
                    .set('Content-type', 'application/x-www-form-urlencoded')
                    .send('second=non-json')
                    .expect(200)
                    .expect('Content-type', 'application/json;charset=UTF-8')
                    .expect({second: 'non-json', status: 'ok'})
                    .end(helper.endCb(done));
            });
        });
    });

    describe('PUT', function() {
        it('should respond with 400', function(done) {
            request.put('/api/multiple')
                .set('Content-type', 'application/json')
                .send({'id': 2, 'title': 'hello'})
                .expect(400)
                .expect('Content-type', 'application/json')
                .end(helper.endCb(done));
        });

        it('should respond with 201', function(done) {
            request.put('/api/multiple')
                .set('Content-type', 'application/json')
                .send({'id': 1, 'title': 'hello'})
                .expect(201)
                .expect('Content-type', 'application/json')
                .end(helper.endCb(done));
        });
    });
});
