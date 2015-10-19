(function () {
    'use strict';

    var content = require('../../lib/content');
    var assert = require('assert');

    describe('Content', function () {
        describe('areContentTypeSame', function () {
            it('should be the same', function () {
                var httpReq = {
                    'headers': {
                        'content-type': 'application/json'
                    }
                };

                var specReq = {
                    headers: [
                        {name: 'Content-Type', value: 'application/json'}
                    ]
                };

                assert.equal(content.areContentTypesSame(httpReq, specReq), true);
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

                assert.equal(content.areContentTypesSame(httpReq, specReq), false);
            });
        });

        describe('matchesBody', function () {
            it('should match body when there are no spec request', function () {
                var httpReq = {
                    body: ''
                };

                var specReq = null;

                assert.equal(content.matchesBody(httpReq, specReq), true);
            });

            describe('content type is json', function () {
                var httpReq = {
                    'headers': {
                        'content-type': 'application/json'
                    }
                };

                it('should match body', function () {
                    httpReq.body = '{"text": "Hyperspeed jet"}';

                    var specReq = {
                        body: '{\n    "text": "Hyperspeed jet"\n}\n'
                    };

                    assert.equal(content.matchesBody(httpReq, specReq), true);
                });

                it('should not match body', function () {
                    httpReq.body = '{"text": "Hyperspeed jet!!"}';

                    var specReq = {
                        body: '{\n    "text": "Hyperspeed jet"\n}\n'
                    };

                    assert.equal(content.matchesBody(httpReq, specReq), false);
                });
            });

            describe('content type is not json', function () {
                var httpReq = {
                    'headers': {
                        'content-type': 'multipart'
                    }
                };

                it('should match body', function () {
                    httpReq.body = '{"text": "Hyperspeed jet"}';

                    var specReq = {
                        body: '{"text": "Hyperspeed jet"}'
                    };

                    assert.equal(content.matchesBody(httpReq, specReq), true);
                });

                it('should not match body', function () {
                    httpReq.body = '{"text": "Hyperspeed jet!!"}';

                    var specReq = {
                        body: '{\n    "text": "Hyperspeed jet"\n}\n'
                    };

                    assert.equal(content.matchesBody(httpReq, specReq), false);
                });
            });
        });

        describe('matchesSchema', function () {
            it('should match when spec request is null', function () {
                assert.equal(content.matchesSchema({}, null), true);
            });

            describe('schema exist', function () {
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

                it('should match with schema', function () {
                    var httpReq = {
                        'headers': {
                            'content-type': 'application/json'
                        },
                        body: '{"first": "text", "second": "text2"}'
                    };

                    assert.equal(content.matchesSchema(httpReq, specReq), true);
                });

                it('should not match with schema', function () {
                    var httpReq = {
                        'headers': {
                            'content-type': 'application/json'
                        },
                        body: '{"first": "text", "third": "text2"}'
                    };

                    assert.equal(content.matchesSchema(httpReq, specReq), false);
                });
            });
        });

        describe('matchesHeader', function () {
            it('should match when spec request is null', function () {
                assert.equal(content.matchesHeader({}, null), true);
            });

            it('should match when there are no headers', function () {
                assert.equal(content.matchesHeader({}, {headers: ''}), true);
            });

            describe('header exist', function () {
                var specReq = {
                    headers: [
                        {name: 'Content-Type', value: 'application/json'},
                        {name: 'Custom-header', value: 'test'},
                        {name: 'Hello', value: 'World'}
                    ]
                };

                it('should match header', function () {
                    var httpReq = {
                        'headers': {
                            'random-value': 'random',
                            'content-type': 'application/json',
                            'hello': 'World',
                            'custom-header': 'test'
                        }
                    };

                    assert.equal(content.matchesHeader(httpReq, specReq), true);
                });

                it('should not match header', function () {
                    var httpReq = {
                        'headers': {
                            'random-value': 'random',
                            'content-type': 'application/json',
                            'Hello': 'World'
                        }
                    };

                    assert.equal(content.matchesHeader(httpReq, specReq), false);
                });
            });
        });
    });
})();
