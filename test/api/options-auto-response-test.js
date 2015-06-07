var helper = require('../lib');
var request = helper.getRequest();

describe('Auto OPTIONS', function(){

    before(function (done) {
        helper.drakov.run({sourceFiles: 'test/example/md/headers.md', autoOptions: true}, done);
    });

    after(function (done) {
        helper.drakov.stop(done);
    });

    describe('/headers', function() {
        it('should respond for OPTIONS despite its not defined in api blueprint', function (done) {
            request.options('/headers')
                .expect(200)
                .end(helper.endCb(done));
        });
    });

    describe('/fjselifjsleifjselij', function(){
        it('should not respond for OPTIONS for every path', function(done){
            request.options('/fjselifjsleifjselij')
                .expect(404)
                .end(helper.endCb(done));
        });

    });

});
