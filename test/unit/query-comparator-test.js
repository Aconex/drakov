var assert = require ('assert');
var queryComparator = require('../../lib/query-comparator');

describe('Query Comparator', function() {

    describe('noParamComparator', function() {
        it('Should sort by number of query parameters in the specification', function(){
            var requests = [
                {parsedUrl: {queryParams: {'param1': ''}}},
                {parsedUrl: {queryParams: {'param1': '', 'param2': '', 'param3': ''}}},
                {parsedUrl: {queryParams: {'param3': '', 'param4': ''}}},
                {parsedUrl: {queryParams: {'param2': '', 'param4': '', 'param1': '12345'}}}
            ];

            var expected = [
                {parsedUrl: {queryParams: {'param1': ''}}},
                {parsedUrl: {queryParams: {'param3': '', 'param4': ''}}},
                {parsedUrl: {queryParams: {'param1': '', 'param2': '', 'param3': ''}}},
                {parsedUrl: {queryParams: {'param2': '', 'param4': '', 'param1': '12345'}}}
            ];

            requests.sort(queryComparator.noParamComparator);
            assert.deepEqual(requests, expected);
        });
    });

    describe('queryParameterComparator', function() {
        it('Should sort by number of query parameters in the specification', function(){
            var requests = [
                {matchingQueryParams: 1, exactMatchingQueryParams: 0, nonMatchingQueryParams: 5},
                {matchingQueryParams: 2, exactMatchingQueryParams: 0, nonMatchingQueryParams: 2},
                {matchingQueryParams: 2, exactMatchingQueryParams: 0, nonMatchingQueryParams: 1},
                {matchingQueryParams: 2, exactMatchingQueryParams: 1, nonMatchingQueryParams: 2},
                {matchingQueryParams: 4, exactMatchingQueryParams: 0, nonMatchingQueryParams: 1}
            ];

            var expected = [
                {matchingQueryParams: 4, exactMatchingQueryParams: 0, nonMatchingQueryParams: 1},
                {matchingQueryParams: 2, exactMatchingQueryParams: 1, nonMatchingQueryParams: 2},
                {matchingQueryParams: 2, exactMatchingQueryParams: 0, nonMatchingQueryParams: 1},
                {matchingQueryParams: 2, exactMatchingQueryParams: 0, nonMatchingQueryParams: 2},
                {matchingQueryParams: 1, exactMatchingQueryParams: 0, nonMatchingQueryParams: 5}
            ];

            requests.sort(queryComparator.queryParameterComparator);
            assert.deepEqual(requests, expected);
        });
    });

    describe('countMatchingQueryParms', function() {
        var requestParams = {
            'param1': '12345',
            'param2': '6789',
            'param5': ['12345','6789'],
            'param6': {'key1': '12345', 'key2': '6789'}
        };
        var handlers = null;

        beforeEach(function(){
            queryComparator.countMatchingQueryParms(handlers, requestParams);
        });

        context('when no value is given', function() {
            var handler = {parsedUrl: {queryParams: {'param1': ''}}};

            before(function(){
                handlers = [handler];
            });

            it('Should count the number of matching and non matching query parameters against handlers query parameters', function(){
                assert.equal(handler.matchingQueryParams, 1);
                assert.equal(handler.exactMatchingQueryParams, 0);
                assert.equal(handler.nonMatchingQueryParams, 0);
            });
        });

        context('when multiples params are given', function() {
            before(function(){
                handlers = [
                    {parsedUrl: {queryParams: {'param1': '', 'param2': '', 'param3': ''}}},
                    {parsedUrl: {queryParams: {'param3': '', 'param4': ''}}}
                ];
            });

            it('Should count the number of matching and non matching query parameters against handlers query parameters', function(){
                assert.equal(handlers[0].matchingQueryParams, 2);
                assert.equal(handlers[0].exactMatchingQueryParams, 0);
                assert.equal(handlers[0].nonMatchingQueryParams, 1);
                assert.equal(handlers[1].matchingQueryParams, 0);
                assert.equal(handlers[1].exactMatchingQueryParams, 0);
                assert.equal(handlers[1].nonMatchingQueryParams, 2);
            });
        });

        context('when param is a string', function() {
            var handler = {parsedUrl: {queryParams: {'param1': '12345', 'param2': '', 'param4': ''}}};

            before(function(){
                handlers = [handler];
            });

            it('Should count the number of matching and non matching query parameters against handlers query parameters', function(){
                assert.equal(handler.matchingQueryParams, 2);
                assert.equal(handler.exactMatchingQueryParams, 1);
                assert.equal(handler.nonMatchingQueryParams, 1);
            });
        });

        context('when param is an array', function() {
            var handler = {parsedUrl: {queryParams: {'param5': ['12345','6789'], 'param4': ''}}};

            before(function(){
                handlers = [handler];
            });

            it('Should count the number of matching and non matching query parameters against handlers query parameters', function(){
                assert.equal(handler.matchingQueryParams, 1);
                assert.equal(handler.exactMatchingQueryParams, 1);
                assert.equal(handler.nonMatchingQueryParams, 1);
            });
        });

        context('when param is an object', function() {
            var handler = {parsedUrl: {queryParams: {'param6': {'key1': '12345', 'key2': '6789'}, 'param4': ''}}};

            before(function(){
                handlers = [handler];
            });

            it('Should count the number of matching and non matching query parameters against handlers query parameters', function(){
                assert.equal(handler.matchingQueryParams, 1);
                assert.equal(handler.exactMatchingQueryParams, 1);
                assert.equal(handler.nonMatchingQueryParams, 1);
            });
        });
    });

});
