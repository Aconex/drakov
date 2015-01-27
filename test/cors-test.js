var helper = require('./lib');
var request = require('supertest')('http://localhost:' + helper.port);

describe('/headers', function(){it('should respond with CORS header', function (done) {
    request.get('/api/things')
        .expect('Access-Control-Allow-Origin', '*')
        .end(helper.endCb(done));
    });
});
