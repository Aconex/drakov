var assert = require ('assert');
var sorter = require('../../lib/middleware/endpoint-sorter');

describe('Endpoint Sorter', function() {
    it('Should prioritize static path over parametrized one', function(){
        var routeMap = {
            '/aaa/bbb/:ccc': {},
            '/aaa/bbb/ccc': {}
        };

        var sortedKeys = Object.keys(sorter.sort(routeMap));

        assert.deepEqual(sortedKeys, ['/aaa/bbb/ccc', '/aaa/bbb/:ccc']);
    });

    it('Should static path exist closer to the beginning of the URL to be prioritised', function(){
        var routeMaps = {
                '/:aaa/:bbb/:ccc': {},
                '/:aaa/bbb/:ccc': {},
                '/:aaa/bbb/ccc': {},
                '/aaa/bbb/ccc': {},
                '/aaa/bbb/:ccc': {},
                '/aaa/:bbb/ccc': {},
                '/aaa/:bbb/:ccc': {},
                '/:aaa/:bbb/ccc': {}
        };

        var sortedKeys = Object.keys(sorter.sort(routeMaps));

        var expected = ['/aaa/bbb/ccc',
            '/aaa/bbb/:ccc',
            '/aaa/:bbb/ccc',
            '/aaa/:bbb/:ccc',
            '/:aaa/bbb/ccc',
            '/:aaa/bbb/:ccc',
            '/:aaa/:bbb/ccc',
            '/:aaa/:bbb/:ccc'];

            assert.deepEqual(sortedKeys, expected);
    });
});
