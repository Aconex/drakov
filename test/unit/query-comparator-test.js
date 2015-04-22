var assert = require ('assert');
var queryComparator = require('../../lib/query-comparator');

describe('Query Comparator', function() {

    describe('noParamComparator', function() {
        it('Should sort by number of query parameters in the specification', function(){
            var requests = [
                {parsedUrl: {queryParams: [1,2,4]}},
                {parsedUrl: {queryParams: [1,4]}},
                {parsedUrl: {queryParams: [1]}},
                {parsedUrl: {queryParams: []}}
            ];

            var expected = [
                {parsedUrl: {queryParams: []}},
                {parsedUrl: {queryParams: [1]}},
                {parsedUrl: {queryParams: [1, 4]}},
                {parsedUrl: {queryParams: [1, 2, 4]}}
            ];

            requests.sort(queryComparator.noParamComparator);
            assert.deepEqual(requests, expected);
        });
    });

    describe('queryParameterComparator', function() {
        it('Should sort by number of query parameters in the specification', function(){
            var requests = [
                {matchingQueryParams: 1, nonMatchingQueryParams: 5},
                {matchingQueryParams: 2, nonMatchingQueryParams: 1},
                {matchingQueryParams: 2, nonMatchingQueryParams: 2},
                {matchingQueryParams: 4, nonMatchingQueryParams: 1}
            ];

            var expected = [
                {matchingQueryParams: 4, nonMatchingQueryParams: 1},
                {matchingQueryParams: 2, nonMatchingQueryParams: 1},
                {matchingQueryParams: 2, nonMatchingQueryParams: 2},
                {matchingQueryParams: 1, nonMatchingQueryParams: 5}
            ];

            requests.sort(queryComparator.queryParameterComparator);
            assert.deepEqual(requests, expected);
        });
    });

    describe('countMatchingQueryParms', function() {
        it('Should count the number of matching and non matching query parameters against handlers query parameters', function(){

            var handlers = [
                {parsedUrl: {queryParams: ['param1']}},
                {parsedUrl: {queryParams: ['param1', 'param2', 'param3']}},
                {parsedUrl: {queryParams: ['param3', 'param4']}}
            ];

            var requestParams = ['param1', 'param2'];

            queryComparator.countMatchingQueryParms(handlers, requestParams);
            assert.equal(handlers[0].matchingQueryParams, 1);
            assert.equal(handlers[0].nonMatchingQueryParams, 0);
            assert.equal(handlers[1].matchingQueryParams, 2);
            assert.equal(handlers[1].nonMatchingQueryParams, 1);
            assert.equal(handlers[2].matchingQueryParams, 0);
            assert.equal(handlers[2].nonMatchingQueryParams, 2);
        });
    });

});
