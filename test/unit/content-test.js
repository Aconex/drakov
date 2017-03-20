(function () {
    'use strict';

    var content = require('../../lib/content');
    var stdoutHook = require('../lib/stdout-hook');
    var assert = require('assert');
    var loadash = require('lodash');

    describe('Content', function () {

        before(function (done) {
           var helper = require('../lib/drakov-runner');
           helper.run({stealthmode: false}, function () {
               helper.stop(done);
           });
        });

        describe('contentTypeComparator', function () {
            it('should return 1 when first spec does not contain content-type header', function () {
                var specA = {
                    request: {
                        headers: [
                            {name: 'Not-Content-Type', value: 'application/json'}
                        ]
                    }
                };

                var specB ={
                    request: {
                        headers: [
                            {name: 'Content-Type', value: 'application/json'}
                        ]
                    }
                };

                assert.equal(content.contentTypeComparator(specA, specB), 1);
            });

            it('should return -1 when first spec contains content-type header', function () {
                var specA = {
                    request: {
                        headers: [
                            {name: 'Content-Type', value: 'application/json'}
                        ]
                    }
                };

                var specB ={
                    request: {
                        headers: [
                            {name: 'Content-Type', value: 'application/json'}
                        ]
                    }
                };

                assert.equal(content.contentTypeComparator(specA, specB), -1);
            });

            it('should not be the same', function () {
                var httpReq = {
                    'headers': {
                        'content-type': 'application/xml'
                    }
                };

                var specReq = {
                    headers: [
                        {name: 'Content-Type', value: 'application/json'}
                    ]
                };

                assert.equal(content.matchesHeader(httpReq, specReq), false);
            });
        });

        describe('matchesBody', function () {

            var httpReq = {
                body: '{"text": "Hyperspeed jet"}',
            };

            context('when spec does not define', function ()  {

                it('should return true', function () {
                    var specReq = null;

                    assert.equal(content.matchesBody(httpReq, specReq), true);
                });

                it('should log to console that body matched', function () {
                    httpReq.headers = {
                        'content-type': 'application/json',
                    };

                    var specReq = {
                        body: '{\n    "text": "Hyperspeed jet"\n}\n'
                    };

                    var hook = stdoutHook.setup(function (string) {
                        assert.equal(loadash.includes(string, 'NOT_MATCHED'), false);
                    });

                    content.matchesBody(httpReq, specReq);

                    hook();
                });
            });

            context('when body correspond to spec', function ()  {

                context('when content type is json', function ()  {

                    before(function ()  {
                        httpReq.headers = {
                            'content-type': 'application/json',
                        };
                    });

                    it('should returns true', function () {
                        var specReq = {
                            body: '{\n    "text": "Hyperspeed jet"\n}\n'
                        };
                        assert.equal(content.matchesBody(httpReq, specReq), true);
                    });
                });

                context('when content type is not json', function ()  {

                    before(function () {
                        httpReq.headers = {
                            'content-type': 'multipart'
                        };
                    });

                    it('should returns true', function () {
                        var specReq = {
                            body: '{"text": "Hyperspeed jet"}'
                        };
                        assert.equal(content.matchesBody(httpReq, specReq), true);
                    });
                });

                it('should log to console that body matched', function () {
                    httpReq.headers = {
                        'content-type': 'application/json',
                    };

                    var specReq = {
                        body: '{\n    "text": "Hyperspeed jet"\n}\n'
                    };

                    var hook = stdoutHook.setup(function (string) {
                        assert.equal(loadash.includes(string, 'NOT_MATCHED'), false);
                    });

                    content.matchesBody(httpReq, specReq);

                    hook();
                });
            });

            context('when body do not correspond to spec', function ()  {

                context('when content type is json', function ()  {

                    before(function () {
                        httpReq.headers = {
                            'content-type': 'application/json',
                        };
                    });

                    it('should returns false', function () {
                        var specReq = {
                            body: '{"text": "Hyperspeed jet!!!!!"}'
                        };

                        assert.equal(content.matchesBody(httpReq, specReq), false);
                    });
                });

                context('when content type is not json', function ()  {

                    before(function () {
                        httpReq.headers = {
                            'content-type': 'multipart',
                        };
                    });

                    it('should returns false', function () {
                        var specReq = {
                            body: '{\n    "text": "Hyperspeed jet"\n}\n'
                        };

                        assert.equal(content.matchesBody(httpReq, specReq), false);
                    });
                });

                it('should log to console that body is not matched', function () {
                    httpReq.headers = {
                        'content-type': 'application/json',
                    };

                    var specReq = {
                        body: '{"text": "Hyperspeed jet!!!!"\n}\n'
                    };

                    var hook = stdoutHook.setup(function (string) {
                        assert.equal(loadash.includes(string, 'NOT_MATCHED'), true);
                    });

                    content.matchesBody(httpReq, specReq);

                    hook();
                });
            });
        });

        describe('matchesSchema', function () {

            var httpReq = {
                'headers': {
                    'content-type': 'application/json'
                },
                body: '{"first": "text", "second": "text2"}'
            };

            context('when spec does not define', function () {

                var specReq = null;

                it('should returns true', function () {
                    assert.equal(content.matchesSchema(httpReq, specReq), true);
                });

                it('should log to console that schema is matched', function () {
                    var hook = stdoutHook.setup(function (string) {
                        assert.equal(loadash.includes(string, 'NOT_MATCHED'), false);
                    });

                    content.matchesSchema(httpReq, specReq);

                    hook();
                });
            });

            context('when schema correspond to spec', function () {

                var specReq = {
                    schema: {
                        type: 'object',
                        required: ['first', 'second'],
                        properties: {
                            first: {type: 'string'},
                            second: {type: 'string'}
                        }
                    }
                };

                it('should returns true', function () {
                    assert.equal(content.matchesSchema(httpReq, specReq), true);
                });

                it('should log to console that schema is matched', function () {
                    var hook = stdoutHook.setup(function (string) {
                        assert.equal(loadash.includes(string, 'NOT_MATCHED'), false);
                    });

                    content.matchesSchema(httpReq, specReq);

                    hook();
                });
            });

            context('when schema do not correspond to spec', function () {

                var specReq = {
                    schema: {
                        type: 'object',
                        required: ['first', 'second'],
                        properties: {
                            first: {type: 'number'},
                            second: {type: 'string'}
                        }
                    }
                };

                it('should returns fals', function () {
                    assert.equal(content.matchesSchema(httpReq, specReq), false);
                });

                it('should log to console that schema is not matched', function () {
                    var hook = stdoutHook.setup(function (string) {
                        assert.equal(loadash.includes(string, 'NOT_MATCHED'), true);
                    });

                    content.matchesSchema(httpReq, specReq);

                    hook();
                });
            });
        });

        describe('matchesHeader', function () {

            var httpReq = {
                'headers': {
                    'random-value': 'random',
                    'content-type': 'application/json',
                    'hello': 'World',
                    'custom-header': 'test'
                }
            };

            context('when spec does not exist', function () {

                var specReq = null;

                it('should return true', function () {
                    assert.equal(content.matchesHeader(httpReq, specReq), true);
                });

                it('should log to console that schema is matched', function () {
                    var numberOfErrors = 0;
                    var hook = stdoutHook.setup(function (string) {
                        if (loadash.includes(string, 'NOT_MATCHED')) {
                            numberOfErrors += 1;
                        }
                    });

                    content.matchesHeader(httpReq, specReq);

                    hook();

                    assert.equal(numberOfErrors, 0);
                });
            });

            context('when spec is empty', function () {

                var specReq = { headers: '' };

                it('should return true', function () {
                    assert.equal(content.matchesHeader(httpReq, specReq), true);
                });

                it('should log to console that schema is matched', function () {
                    var numberOfErrors = 0;
                    var hook = stdoutHook.setup(function (string) {
                        if (loadash.includes(string, 'NOT_MATCHED')) {
                            numberOfErrors += 1;
                        }
                    });

                    content.matchesHeader(httpReq, specReq);

                    hook();

                    assert.equal(numberOfErrors, 0);
                });
            });

            context('when headers correspond to spec', function () {

                var specReq = {
                    headers: [
                        {name: 'Content-Type', value: 'application/json'},
                        {name: 'Custom-header', value: 'test'},
                        {name: 'Hello', value: 'World'}
                    ]
                };

                it('should return true', function () {
                    assert.equal(content.matchesHeader(httpReq, specReq), true);
                });

                it('should log to console that schema is matched', function () {
                    var numberOfErrors = 0;
                    var hook = stdoutHook.setup(function (string) {
                        if (loadash.includes(string, 'NOT_MATCHED')) {
                            numberOfErrors += 1;
                        }
                    });

                    content.matchesHeader(httpReq, specReq);

                    hook();

                    assert.equal(numberOfErrors, 0);
                });
            });

            context('when headers do not correspond to spec', function () {

                var specReq = {
                    headers: [
                        {name: 'Content-Type', value: 'application/json'},
                        {name: 'Custom-header', value: 'test'},
                        {name: 'Hello', value: 'World'},
                        {name: 'some-another-header', value: 'some value'},
                    ]
                };

                it('should return false', function () {
                    assert.equal(content.matchesHeader(httpReq, specReq), false);
                });

                it('should log to console that schema does not match', function () {
                    var numberOfErrors = 0;
                    var hook = stdoutHook.setup(function (string) {
                        if (loadash.includes(string, 'NOT_MATCHED')) {
                            numberOfErrors += 1;
                        }
                    });

                    content.matchesHeader(httpReq, specReq);

                    hook();

                    assert.equal(numberOfErrors, 1);
                });
            });

            context('with ignore headers', function () {

                var specReq = {
                    headers: [
                        {name: 'Content-Type', value: 'application/xml'},
                        {name: 'Cookie', value: 'key=vaue'}
                    ]
                };

                it('should return true', function () {
                    assert.equal(content.matchesHeader(httpReq, specReq, ['Content-Type', 'Cookie']), true);
                });

            });


            describe('regarding to content type', function () {

                var httpReq = {
                    'headers': {
                        'content-type': 'application/json'
                    }
                };

                context('when spec does not define content-type', function ()  {

                    var specReq = {
                        headers: [
                            {}
                        ]
                    };

                    it('should return true', function () {
                        assert.equal(content.matchesHeader(httpReq, specReq), true);
                    });

                    it('should log to console that content type is matched', function () {
                        var hook = stdoutHook.setup(function (string) {
                            assert.equal(loadash.includes(string, 'NOT_MATCHED'), false);
                        });

                        content.matchesHeader(httpReq, specReq);
                        hook();
                    });
                });

                context('when headers correspond to spec', function ()  {

                    var specReq = {
                        headers: [
                            {name: 'Content-Type', value: 'application/json'}
                        ]
                    };

                    it('should returns true', function () {
                        assert.equal(content.matchesHeader(httpReq, specReq), true);
                    });

                    it('should log to console that content type is matched', function () {
                        var hook = stdoutHook.setup(function (string) {
                            assert.equal(loadash.includes(string, 'NOT_MATCHED'), false);
                        });

                        content.matchesHeader(httpReq, specReq);
                        hook();
                    });
                });

                context('when headers do not correspond to spec', function ()  {

                    var specReq = {
                        headers: [
                            {name: 'Content-Type', value: 'application/xml'}
                        ],
                    };

                    it('should returns false ', function () {
                        assert.equal(content.matchesHeader(httpReq, specReq), false);
                    });

                    it('should log to console that content type is not matched', function () {
                        var hook = stdoutHook.setup(function (string) {
                            assert.equal(loadash.includes(string, 'NOT_MATCHED'), true);
                        });

                        content.matchesHeader(httpReq, specReq);
                        hook();
                    });
                });
            });
        });
    });
})();
