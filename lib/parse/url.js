var qs = require('qs');

//https://github.com/apiaryio/api-blueprint/blob/master/API%20Blueprint%20Specification.md#operators
var PARAMETER_OPERATORS_REGEX = /\#|\+|\?/g;
var PATHNAME_REGEX = /\{(.*?)\}/g;
var URL_SPLIT_REGEX = /\{?\?/;

exports.parse = function (url) {
    var urlArr = url.split(URL_SPLIT_REGEX);

    var processPathname = function(path){
        return path.replace(PATHNAME_REGEX, ':$1');
    };
    var processQueryParameters = function(queryParams) {
        if (!queryParams) {
            return {};
        }
        return qs.parse(queryParams.replace(/\{|\}/g,'').replace(/\,/g,'&').replace(PARAMETER_OPERATORS_REGEX, ''));
    };

    return {
        uriTemplate: url,
        queryParams: urlArr.length > 1 ? processQueryParameters(urlArr[1]) : {},
        url: processPathname(urlArr[0])
    };
};
