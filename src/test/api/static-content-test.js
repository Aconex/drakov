var helper = require('../lib');
var request = helper.getRequest();

describe('Static content', function(){

    before(function (done) {
        helper.drakov.run({sourceFiles: 'test/example/md/simple-api.md', staticPaths: 'test/example/static'}, done);
    });

    after(function (done) {
        helper.drakov.stop(done);
    });

    it('should be able to GET things.txt', function(done){
        request.get('/things.txt')
        .expect(200)
        .expect('Content-type', 'text/plain; charset=UTF-8')
        .expect('Zip2\nX.com\nSpaceX\nSolar City\nHyperloop\n')
        .end(helper.endCb(done));
    });
});
