var drakov = require('../../lib/drakov');

describe('Drakov module' ,function() {

    var drakovOptions = null;

    before(function(){
        drakovOptions = {
            sourceFiles: '../../test/example/md/simple-api.md',
            serverPort: 10000
        };
    });

    describe('drakov.run()', function() {
        after(function(done) {
            drakov.stop(done);
        });

        it('Should successfully start Drakov', function(done) {
            var cb = function() {
                done();
            };

            drakov.run(drakovOptions, cb);
        });
    });

    describe('drakov.stop()', function() {
        it('Should gracefully exit when Drakov has not been started', function(done) {
            var cb = function() {
                done();
            };

            drakov.stop(cb);
        });
    });

});
