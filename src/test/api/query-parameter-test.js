var helper = require('../lib');
var request = helper.getRequest();

describe('Query Parameters', function(){
    before(function (done) {
        helper.drakov.run({sourceFiles: 'test/example/md/query-parameters.md'}, done);
    });

    after(function (done) {
        helper.drakov.stop(done);
    });

    describe('/api/query', function(){
        it('should respond with response specified in a endpoint with no parameters', function(done){
            request.get('/api/query')
            .expect(200)
            .expect('Content-type', 'application/json;charset=UTF-8')
            .expect({id: 'raw'})
            .end(helper.endCb(done));
        });
    });

    describe('/api/query{?param1}', function(){
        it('should respond with response specified in a endpoint with "param1" parameter', function(done){
            request.get('/api/query?param1=1')
            .expect(200)
            .expect('Content-type', 'application/json;charset=UTF-8')
            .expect({id: 'parameter1'})
            .end(helper.endCb(done));
        });
    });

    describe('/api/query{?param2}', function(){
        it('should respond with response specified in a endpoint with "param2" parameter', function(done){
            request.get('/api/query?param2=2')
                .expect(200)
                .expect('Content-type', 'application/json;charset=UTF-8')
                .expect({id: 'parameter2'})
                .end(helper.endCb(done));
        });

        it('should respond with response specified in a endpoint with "param2" parameter - scenario 2', function(done){
            request.get('/api/query?param2=2&param7=7')
                .expect(200)
                .expect('Content-type', 'application/json;charset=UTF-8')
                .expect({id: 'parameter2'})
                .end(helper.endCb(done));
        });
    });

    describe('/api/things?param1{&param2}', function(){
        it('should respond with response specified in a endpoint with "param1" and "param2" parameters - scenario 1', function(done){
            request.get('/api/query?param1=1&param2=2')
                .expect(200)
                .expect('Content-type', 'application/json;charset=UTF-8')
                .expect({id: 'parameter1_parameter2'})
                .end(helper.endCb(done));
        });
        it('should respond with response specified in a endpoint with "param1" and "param2" parameters  - scenario 2 (inverted position)', function(done){
            request.get('/api/query?param2=2&param1=1')
                .expect(200)
                .expect('Content-type', 'application/json;charset=UTF-8')
                .expect({id: 'parameter1_parameter2'})
                .end(helper.endCb(done));
        });
    });

    describe('/api/query{?param2,param3}', function(){
        it('should respond with response specified in a endpoint with "param2" and "param3" parameters', function(done){
            request.get('/api/query?param2=2&param3=3')
                .expect(200)
                .expect('Content-type', 'application/json;charset=UTF-8')
                .expect({id: 'parameter2_parameter3'})
                .end(helper.endCb(done));
        });
    });

    describe('/api/things?param1=12345{&param2}', function(){
        it('should respond with response specified in a endpoint with "param1" and "param2" parameters', function(done){
            request.get('/api/query?param1=12345&param2=2')
                .expect(200)
                .expect('Content-type', 'application/json;charset=UTF-8')
                .expect({id: 'parameter1_12345_parameter2'})
                .end(helper.endCb(done));
        });
    });

    describe('/api/things?param1=12345&param1=6789', function(){
        it('should respond with response specified in a endpoint with "param1" parameter as array', function(done){
            request.get('/api/query?param1=12345&param1=6789')
                .expect(200)
                .expect('Content-type', 'application/json;charset=UTF-8')
                .expect({id: 'parameter1_12345_6789'})
                .end(helper.endCb(done));
        });
    });

    describe('/api/things?param1[key1]=12345&param1[key2]=6789', function(){
        it('should respond with response specified in a endpoint with "param1" parameter as object', function(done){
            request.get('/api/query?param1[key1]=12345&param1[key2]=6789')
                .expect(200)
                .expect('Content-type', 'application/json;charset=UTF-8')
                .expect({id: 'parameter1_key1_12345_key2_6789'})
                .end(helper.endCb(done));
        });
    });
});
