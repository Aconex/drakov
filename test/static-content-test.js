var helper = require('./lib');
var request = require('supertest')('http://localhost:' + helper.port);

describe('Static content', function(){
    it('should be able to GET things.txt', function(done){
        request.get('/things.txt')
        .expect(200)
        .expect('Content-type', 'text/plain; charset=UTF-8')
        .expect('Zip2\nX.com\nSpaceX\nSolar City\nHyperloop\n')
        .end(helper.endCb(done));
    });
});
