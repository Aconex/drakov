var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');
var out = fs.openSync('test/watcher/out.log', 'a');
var err = fs.openSync('test/watcher/out.log', 'a');

var helper = require('../lib');
var request = helper.getRequest();

var drakov = null;
var drakovPort = require('../lib/port');

describe('Watcher', function(){
    var createDir = function(){
        try {fs.mkdirSync(path.resolve('test/watcher/md'));} catch (e) {}
    };

    var deleteDir = function(){
        try {fs.rmdirSync(path.resolve('test/watcher/md'));} catch (e) {}
    };

    var copyFileToWatcher = function (){
        console.log('===> copying file');
        fs.linkSync(path.resolve('test/example/md/simple-api.md'), path.resolve('test/watcher/md/simple-api.md'));
    };

    var deleteFilesFromWatcher = function (){
        try {fs.unlinkSync(path.resolve('test/watcher/md/simple-api.md'));} catch (e) {}
    };

    before(function () {
        deleteFilesFromWatcher();
        deleteDir();
        createDir();

        var drakovParams = [];
//        drakovParams.push(path.resolve('drakov'));
        drakovParams.push('-f');
        drakovParams.push(path.resolve('test/watcher/md/*.md'));
        drakovParams.push('--serverPort');
        drakovParams.push(drakovPort.toString());
        drakovParams.push('--watch');

        var spawnParams = {
            detached: true,
            stdio: [ 'ignore', out, err ]
        };

        console.log(path.resolve('drakov'));
        drakov = spawn(path.resolve('drakov'), drakovParams, spawnParams);

        drakov.unref();

//        done();
//        drakov.on('drakovStarted', function(){
//            console.log('believe it or not');
//            done();
//        });

    });

    after(function () {
        drakov.kill();
        deleteDir();
    });

    it(' 1 should watch file for changes and update drakov on the fly', function(done) {
        setTimeout(function(){
            request.get('/api/things')
                .expect(404)
                .end(helper.endCb(done));
        }, 2000);
    });

    it(' 2 should watch file for changes and update drakov on the fly', function(done) {
        copyFileToWatcher();
        setTimeout(function(){
            request.get('/api/things')
                .expect(200)
                .end(helper.endCb(done));

        }, 2000);
    });

    it(' 3 should watch file for changes and update drakov on the fly', function(done) {
        deleteFilesFromWatcher();

        setTimeout(function(){
            request.get('/api/things')
                .expect(404)
                .end(helper.endCb(done));

        }, 2000);

    });

});
