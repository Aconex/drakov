var helper = require('../lib');
var request = helper.getRequest();

describe('CORS', function(){

    describe('/headers', function() {
        before(function (done) {
            helper.drakov.run(null, done);
        });

        after(function (done) {
            helper.drakov.stop(done);
        });

        it('should respond with CORS header', function (done) {
            request.get('/api/things')
                .expect('Access-Control-Allow-Origin', '*')
                .end(helper.endCb(done));
        });
    });

    describe('/headers', function() {
        before(function (done) {
            helper.drakov.run({disableCORS: true}, done);
        });

        after(function (done) {
            helper.drakov.stop(done);
        });

        it('should NOT respond with CORS header', function (done) {
            request.get('/api/things')
                .end(function(err, res){
                    if (err){
                        done(err);
                    }
                    if (res.header['access-control-allow-origin']){
                        done('Response should NOT include "Access-Control-Allow-Origin" header');
                    }
                    done();
                });
        });
    });

});
