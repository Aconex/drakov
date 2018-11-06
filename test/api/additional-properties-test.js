var helper = require('../lib');
var request = helper.getRequest();

describe('Reject addtional properties', function(){
    before(function (done) {
        helper.drakov.run({sourceFiles: 'test/example/md/json-schema.md'}, done);
    });

    after(function (done) {
        helper.drakov.stop(done);
    });

    describe('POST with additional properties', function(){
        describe('when the `reject-unknown-props` header is false', function(){
            it('should respond with success', function(done){
                request.post('/notes')
                .set('Content-type', 'application/json')
                .send({id: 1, moo: 'moo'})
                .expect(201)
                .end(helper.endCb(done));
            });
        });

        describe('when the `reject-unknown-props` header is true', function(){
            it('should reject with error message', function(done){
                request.post('/notes')
                    .set('Content-type', 'application/json')
                    .set('reject-unknown-props', true)
                    .send({id: 1, moo: 'moo'})
                    .expect(400, '["/moo Additional properties not allowed"]')
                    .end(helper.endCb(done));
            });
        });
    });

});
