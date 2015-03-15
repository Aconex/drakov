var fs = require('fs');
var path = require('path');

var helper = require('../lib');
var request = helper.getRequest();

var watcher = require('../../lib/watcher');

describe('Watcher', function(){
    var createDir = function(){
        try { fs.mkdirSync('md'); } catch (e) {}
    };

    var deleteDir = function(){
        fs.rmdirSync('md');
    };

    var copyFileToWatcher = function (){
        fs.linkSync(path.resolve('test/example/md/simple-api.md'), path.resolve('test/watcher/md/simple-api.md'));
    };

    var deleteFilesFromWatcher = function (){
        fs.unlinkSync(path.resolve('test/watcher/md/simple-api.md'));
    };

    before(function (done) {
        createDir();
        helper.drakov.run({sourceFiles: 'test/watcher/md/*.md'}, function() {
            watcher.watch(helper.drakov.argv, done);
        });
    });

    after(function (done) {
        helper.drakov.stop(done);
        deleteDir();
    });

    it(' 1 should watch file for changes and update drakov on the fly', function(done) {
        request.get('/api/things')
            .expect(404)
            .end(helper.endCb(done));
    });
    it(' 2 should watch file for changes and update drakov on the fly', function(done) {
        copyFileToWatcher();
        setTimeout(function(){
            request.get('/api/things')
                .expect(200)
                .end(helper.endCb(done));

        }, 1000);
    });

    it(' 3 should watch file for changes and update drakov on the fly', function(done) {
        deleteFilesFromWatcher();

        request.get('/api/things')
            .expect(404)
            .end(helper.endCb(done));

    });

});
