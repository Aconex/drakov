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

            describe('/', function() {
                describe('GET', function() {
                    it('should get discover page', function(done) {
                        request.get('/')
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

            describe('/', function() {
                describe('GET', function() {
                    it('should get 404', function(done) {
                        request.get('/')
                            .expect(404)
                            .end(helper.endCb(done));
                    });
                });
            });
        });
    });

    describe('Root-Level-API', function() {
        describe('Discover option not specified', function() {
            before(function(done) {
                helper.drakov.run({sourceFiles: 'test/example/md/root-level-api.md'}, done);
            });

            after(function(done) {
                helper.drakov.stop(done);
            });

            describe('/', function() {
                describe('GET', function() {
                    it('should get root level request rather than discover page', function(done) {
                        request.get('/')
                            .expect(200)
                            .expect('Content-type', 'application/json;charset=UTF-8')
                            .expect({Slash: 'http://images5.fanpop.com/image/photos/31200000/Slash-slash-31278382-1707-2560.jpg'})
                            .end(helper.endCb(done));
                    });
                });
            });
        });

        describe('Discover option true', function() {
            before(function(done) {
                helper.drakov.run({sourceFiles: 'test/example/md/root-level-api.md', discover: true}, done);
            });

            after(function(done) {
                helper.drakov.stop(done);
            });

            describe('/', function() {
                describe('GET', function() {
                    it('should get root level request rather than discover page', function(done) {
                        request.get('/')
                            .expect(200)
                            .expect('Content-type', 'application/json;charset=UTF-8')
                            .expect({Slash: 'http://images5.fanpop.com/image/photos/31200000/Slash-slash-31278382-1707-2560.jpg'})
                            .end(helper.endCb(done));
                    });
                });
            });
        });
    });
});
