var helper = require('../lib');
var request = helper.getRequest();

describe('Multipart Requests', function() {
    before(function (done) {
        helper.drakov.run({sourceFiles: 'test/example/md/multipart.md'}, done);
    });

    after(function (done) {
        helper.drakov.stop(done);
    });

    describe('/api/multipart', function() {
        it('should respond with success response for Same Multipart Content Type', function(done) {
            request.post('/api/multipart')
            .set('Content-type', 'multipart/form-data; boundary=---BOUNDARY')
            .send('-----BOUNDARY\n'+
                '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a\n' +
            'HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIy\n' +
            'MjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIA\n' +
            'AhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEB\n' +
            'AAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AL+AD//Z\n' +
            '-----BOUNDARY')
            .expect(200)
            .expect('Content-type', 'application/json;charset=UTF-8')
            .expect({success: true})
            .end(helper.endCb(done));
        });

        //it('should respond with success response for Same Multipart Content Type with different boundary', function(done) {
        //    request.post('/api/multipart')
        //    .set('Content-type', 'multipart/form-data; boundary=---WebKitFormBoundaryjy0tIlk46ESOni0H')
        //    .send()
        //    .expect(200)
        //    .expect('Content-type', 'application/json;charset=UTF-8')
        //    .expect({success: true})
        //    .end(helper.endCb(done));
        //});

        it('should respond with error when request does not have Content Type as multipart', function(done) {
            request.post('/api/multipart')
            .set('Content-type', 'application/json')
            .send()
            .expect(404)
            .expect('Content-type', 'text/html; charset=utf-8')
            .end(helper.endCb(done));
        });
    });

});
