//https://github.com/apiaryio/api-blueprint/blob/master/API%20Blueprint%20Specification.md#operators
var PARAMETER_OPERATORS_REGEX = /\#|\+|\?|\&/g;
var PATHNAME_REGEX = /\{(.*?)\}/g;
var URL_SPLIT_REGEX = /\{?\?/;

exports.parse = function (url) {

    var urlArr = url.split(URL_SPLIT_REGEX);

    var processPathname = function(path){
        return path.replace(PATHNAME_REGEX, ':$1');
    };

    var processQueryParameters = function(queryParams) {
        if (!queryParams) {
            return [];
        }

        return queryParams.split(/\,|\{|\}/g).map(function(i){
            return i.replace(PARAMETER_OPERATORS_REGEX, '');
        }).filter(function(i){
            return i.length > 0;
        });
    };

    return {
        uriTemplate: url,
        queryParams: urlArr.length > 1 ? processQueryParameters(urlArr[1]) : [],
        url: processPathname(urlArr[0])
    };
};

exports.jsonToFormEncodedString = function(objectData) {
    //To transform data as form data so that backend can understand as Form Data rather Payload
    var arrayStr = [];
    for(var key in objectData) {
        arrayStr.push(encodeURIComponent(key) + '=' + encodeURIComponent(objectData[key]));
    }
    return arrayStr.join('&');
};
