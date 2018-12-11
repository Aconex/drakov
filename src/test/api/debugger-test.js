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
            function matchingReturnedBody(expectedBody) {
                 return function (response) {
                    var actualBodyString = JSON.stringify(response.body.body);
                    var expectedBodyString = JSON.stringify(expectedBody);
                    if (actualBodyString !== expectedBodyString) {
                      throw new Error('Expected: ' + expectedBodyString + ', but got: ' + actualBodyString);
                    }
                 };
            }

            var content = { key1: 'value1', key2: 2 };
            request.post('/api/things-not-found')
                .set('Content-type', 'application/json')
                .send(content)
                .expect(404)
                .expect('Content-type', 'application/json; charset=utf-8')
                .expect(matchingReturnedBody(content))
                .end(helper.endCb(done));

        });
    });

});
