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

exports.formEncodedStringToJson = function(keyValue) {
    var obj = {},
        key_value,
        key;

    function isDefined(value) {
        return typeof value !== 'undefined';
    }

    function tryDecodeURIComponent(value) {
        try {
            return decodeURIComponent(value);
        } catch(e) {
            // Ignore any invalid uri component
        }
    }

    (keyValue || '').split('&').forEach(function(keyValue) {
        if ( keyValue ) {
            key_value = keyValue.replace(/\+/g,'%20').split('=');
            key = tryDecodeURIComponent(key_value[0]);
            if ( isDefined(key) ) {
                var val = isDefined(key_value[1]) ? tryDecodeURIComponent(key_value[1]) : true;
                if (!Object.prototype.hasOwnProperty.call(obj, key)) {
                    obj[key] = val;
                } else if(Array.isArray(obj[key])) {
                    obj[key].push(val);
                } else {
                    obj[key] = [obj[key],val];
                }
            }
        }
    });

    return obj;
};
