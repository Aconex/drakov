var helper = require('../lib');
var request = helper.getRequest();

describe('HTTP 404', function(){

    before(function (done) {
        helper.drakov.run({sourceFiles: 'test/example/md/simple-api.md'}, done);
    });

    after(function (done) {
        helper.drakov.stop(done);
    });

    it('should return http 404', function(done){
        request.get('/notMappedResource')
        .expect(404)
        .end(helper.endCb(done));
    });

});
