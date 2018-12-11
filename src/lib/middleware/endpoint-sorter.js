module.exports.sort = function(routeMap) {
    function getBinaryFromUrl(url) {
        return url.split('/').map(function (section) {
            return section.indexOf(':') < 0 ? '1' : '0';
        }).join('');
    }

    function getUrlWeight (url){
        return parseInt(getBinaryFromUrl(url), 2);
    }

    return Object.keys(routeMap)
        .map(function(key){
            return {key: key, rank: getUrlWeight(key)};
        }).sort(function(r1, r2){
            return r2.rank - r1.rank;
        }).reduce(function(prev, current){
            prev[current.key] = routeMap[current.key];
            return prev;
        }, {});
};
