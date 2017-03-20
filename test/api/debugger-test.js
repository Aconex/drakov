var helper = require('../lib');
var request = helper.getRequest();

describe('Debug Mode', function(){


    describe('Debug mode disabled', function(){

        before(function (done) {
            helper.drakov.run({sourceFiles: 'test/example/md/simple-api.md'}, done);
        });

        after(function (done) {
            helper.drakov.stop(done);
        });

        it('should respond with spec response', function(done){
            request.post('/api/things-not-found')
                .set('Content-type', 'application/json')
                .send({ key1: 'value1', key2: 2 })
                .expect(404)
                .expect('Content-type', 'text/html; charset=utf-8')
                .expect('Endpoint not found')
                .end(helper.endCb(done));

        });
    });

    describe('Debug mode enabled', function(){

        before(function (done) {
            helper.drakov.run({sourceFiles: 'test/example/md/simple-api.md', debugMode: true}, done);
        });

        after(function (done) {
            helper.drakov.stop(done);
        });

        it('should respond with spec response', function(done){
            var expectedResponsePayload = {
                    originalUrl:'/api/things-not-found',
                    body: {'key1':'value1','key2':2},
                    method: 'POST',
                    headers:{'host':'localhost:3003','accept-encoding':'gzip, deflate','user-agent':'node-superagent/3.5.1','content-type':'application/json','content-length':'26','connection':'close'},
                    query:{}
            };

            request.post('/api/things-not-found')
                .set('Content-type', 'application/json')
                .send({ key1: 'value1', key2: 2 })
                .expect(404)
                .expect('Content-type', 'application/json; charset=utf-8')
                .expect(expectedResponsePayload)
                .end(helper.endCb(done));

        });
    });

});
