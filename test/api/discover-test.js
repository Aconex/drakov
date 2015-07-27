var helper = require('../lib');
var request = helper.getRequest();

describe('Discover', function() {
    describe('Simple-API', function() {
        describe('Discover option true', function() {
            before(function(done) {
                helper.drakov.run({sourceFiles: 'test/example/md/simple-api.md', discover: true}, done);
            });

            after(function(done) {
                helper.drakov.stop(done);
            });

            describe('/drakov', function() {
                describe('GET', function() {
                    it('should get discover page', function(done) {
                        request.get('/drakov')
                            .expect(200)
                            .expect('Content-type', 'text/html; charset=utf-8')
                            .end(helper.endCb(done));
                    });
                });
            });
        });
        describe('Discover option not specified', function() {
            before(function(done) {
                helper.drakov.run({sourceFiles: 'test/example/md/simple-api.md'}, done);
            });

            after(function(done) {
                helper.drakov.stop(done);
            });

            describe('/drakov', function() {
                describe('GET', function() {
                    it('should get 404', function(done) {
                        request.get('/drakov')
                            .expect(404)
                            .end(helper.endCb(done));
                    });
                });
            });
        });
    });

});
