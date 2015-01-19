var request = require('supertest')('http://localhost:3000');
var endCB = require('./lib/final-callback.js');

describe('HTTP 404', function(){
    it('should return http 404', function(done){
        request.get('/notMappedResource')
        .expect(404)
        .end(endCB(done));
    });

});
