var assert = require ('assert');
var urlParser = require('../../lib/url-parser');

describe('URL Parser', function() {

    describe ('URL with no parameters at all', function(){
        it('Should get path and no parameters', function(){
            var url = '/api/things';
            var parsed = urlParser.parse(url);

            assert.equal(parsed.url, url);
            assert.deepEqual(parsed.queryParams, []);

        });
    });

    describe ('URL with URL parameters', function(){
        it('Should get path with parameters translated to express', function(){
            var url = '/api/{meow}/{woof}/things';
            var parsed = urlParser.parse(url);

            assert.equal(parsed.url, '/api/:meow/:woof/things');
            assert.deepEqual(parsed.queryParams, []);

        });
    });

    describe ('URL with query parameters', function(){
        it('Should get path and query parameters: scenario 1', function(){
            var url = '/api/things?param';
            var parsed = urlParser.parse(url);

            assert.equal(parsed.url, '/api/things');
            assert.deepEqual(parsed.queryParams, ['param']);
        });

        it('Should get path and query parameters: scenario 2', function(){
            var url = '/api/things?param{&param2}';
            var parsed = urlParser.parse(url);

            assert.equal(parsed.url, '/api/things');
            assert.deepEqual(parsed.queryParams, ['param','param2']);
        });

        it('Should get path and query parameters: scenario 3', function(){
            var url = '/api/things?param{&param2,param3}';
            var parsed = urlParser.parse(url);

            assert.equal(parsed.url, '/api/things');
            assert.deepEqual(parsed.queryParams, ['param','param2','param3']);
        });

        it('Should get path and query parameters: scenario 4', function(){
            var url = '/api/things{?param1,param2}';
            var parsed = urlParser.parse(url);

            assert.equal(parsed.url, '/api/things');
            assert.deepEqual(parsed.queryParams, ['param1','param2']);
        });

    });

    describe ('URL with URL and query parameters', function() {
        it('Should get path and query parameter', function () {
            var url = '/api/{meow}/things?param';
            var parsed = urlParser.parse(url);

            assert.equal(parsed.url, '/api/:meow/things');
            assert.deepEqual(parsed.queryParams, ['param']);
        });
    });

    describe('JSON to Form Encoded String', function() {
        it('should encode JSON Object as a form data for POST request', function() {

            var formObj = {
                test1: 'foo',
                test2: 'bar'
            };

            var expectedData = urlParser.jsonToFormEncodedString(formObj);
            assert.equal(expectedData, 'test1=foo&test2=bar');
        });
    });

    describe('Form Encoded string to JSON', function() {
        it('should parse a string into key-value pairs', function() {
            assert.deepEqual(urlParser.formEncodedStringToJson(''), {});
            assert.deepEqual(urlParser.formEncodedStringToJson('simple=pair'), {simple: 'pair'});
            assert.deepEqual(urlParser.formEncodedStringToJson('first=1&second=2'), {first: '1', second: '2'});
            assert.deepEqual(urlParser.formEncodedStringToJson('escaped%20key=escaped%20value'), {'escaped key': 'escaped value'});
            assert.deepEqual(urlParser.formEncodedStringToJson('emptyKey='), {emptyKey: ''});
            assert.deepEqual(urlParser.formEncodedStringToJson('flag1&key=value&flag2'), {flag1: true, key: 'value', flag2: true});
        });
        it('should ignore key values that are not valid URI components', function() {
            assert.doesNotThrow(function() { urlParser.formEncodedStringToJson('%'); });
            assert.deepEqual(urlParser.formEncodedStringToJson('%'), {});
            assert.deepEqual(urlParser.formEncodedStringToJson('invalid=%'), { invalid: undefined });
            assert.deepEqual(urlParser.formEncodedStringToJson('invalid=%&valid=good'), { invalid: undefined, valid: 'good' });
        });
        it('should parse a string into key-value pairs with duplicates grouped in an array', function() {
            assert.deepEqual(urlParser.formEncodedStringToJson(''), {});
            assert.deepEqual(urlParser.formEncodedStringToJson('duplicate=pair'), {duplicate: 'pair'});
            assert.deepEqual(urlParser.formEncodedStringToJson('first=1&first=2'), {first: ['1','2']});
            assert.deepEqual(urlParser.formEncodedStringToJson('escaped%20key=escaped%20value&&escaped%20key=escaped%20value2'), {'escaped key': ['escaped value','escaped value2']});
            assert.deepEqual(urlParser.formEncodedStringToJson('flag1&key=value&flag1'), {flag1: [true,true], key: 'value'});
            assert.deepEqual(urlParser.formEncodedStringToJson('flag1&flag1=value&flag1=value2&flag1'), {flag1: [true,'value','value2',true]});
        });
    });

});
