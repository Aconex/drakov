var helper = require('./lib');
var request = require('supertest')('http://localhost:' + helper.port);

describe('HTTP 404', function(){
    it('should return http 404', function(done){
        request.get('/notMappedResource')
        .expect(404)
        .end(helper.endCb(done));
    });

});
