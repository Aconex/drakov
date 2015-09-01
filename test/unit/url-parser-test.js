var assert = require ('assert');
var urlParser = require('../../lib/parse/url');

describe('URL Parser', function() {

    describe ('URL with no parameters at all', function(){
        it('Should get path and no parameters', function(){
            var url = '/api/things';
            var parsed = urlParser.parse(url);

            assert.equal(parsed.url, url);
            assert.deepEqual(parsed.queryParams, {});

        });
    });

    describe ('URL with URL parameters', function(){
        it('Should get path with parameters translated to express', function(){
            var url = '/api/{meow}/{woof}/things';
            var parsed = urlParser.parse(url);

            assert.equal(parsed.url, '/api/:meow/:woof/things');
            assert.deepEqual(parsed.queryParams, {});

        });
    });

    describe ('URL with query parameters', function(){
        it('Should get path and query parameters: scenario 1', function(){
            var url = '/api/things?param';
            var parsed = urlParser.parse(url);

            assert.equal(parsed.url, '/api/things');
            assert.deepEqual(parsed.queryParams, {'param': ''});
        });

        it('Should get path and query parameters: scenario 2', function(){
            var url = '/api/things?param{&param2}';
            var parsed = urlParser.parse(url);

            assert.equal(parsed.url, '/api/things');
            assert.deepEqual(parsed.queryParams, {'param': '', 'param2': ''});
        });

        it('Should get path and query parameters: scenario 3', function(){
            var url = '/api/things?param{&param2,param3}';
            var parsed = urlParser.parse(url);

            assert.equal(parsed.url, '/api/things');
            assert.deepEqual(parsed.queryParams, {'param': '','param2': '','param3': ''});
        });

        it('Should get path and query parameters: scenario 4', function(){
            var url = '/api/things{?param1,param2}';
            var parsed = urlParser.parse(url);

            assert.equal(parsed.url, '/api/things');
            assert.deepEqual(parsed.queryParams, {'param1': '','param2': ''});
        });

        it('Should get path and query parameters: scenario 5', function(){
            var url = '/api/things?param1=12345{&param2}';
            var parsed = urlParser.parse(url);

            assert.equal(parsed.url, '/api/things');
            assert.deepEqual(parsed.queryParams, {'param1': '12345','param2': ''});
        });

        it('Should get path and query parameters: scenario 6', function(){
            var url = '/api/things?param1=12345&param1=6789{&param2}';
            var parsed = urlParser.parse(url);

            assert.equal(parsed.url, '/api/things');
            assert.deepEqual(parsed.queryParams, {'param1': ['12345','6789'],'param2': ''});
        });

        it('Should get path and query parameters: scenario 7', function(){
            var url = '/api/things?param1[key1]=12345&param1[key2]=6789{&param2}';
            var parsed = urlParser.parse(url);

            assert.equal(parsed.url, '/api/things');
            assert.deepEqual(parsed.queryParams, {'param1': { 'key1': '12345','key2': '6789'},'param2': ''});
        });

    });

    describe ('URL with URL and query parameters', function() {
        it('Should get path and query parameter', function () {
            var url = '/api/{meow}/things?param';
            var parsed = urlParser.parse(url);

            assert.equal(parsed.url, '/api/:meow/things');
            assert.deepEqual(parsed.queryParams, {'param': ''});
        });
    });

});
