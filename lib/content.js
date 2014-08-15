var lodash = require('lodash');

exports.getContentTypeFrom = function (headers, defaultContentType){
    if (Array.isArray(headers)) {
        var contentTypeHeader = headers.filter(function(header){
            if (/content\-type/i.test(header.name)){
                return true;
            }
        });

        if (contentTypeHeader.length){
            return contentTypeHeader[0].value.replace(/\s/g, '');
        }
    } else if (headers['content-type']) {
        return headers['content-type'].replace(/\s/g, '');

    }

    return defaultContentType || 'application/text';
};

exports.isContentTypeEqual = function (req, specReq) {
    var regex = new RegExp('^' + exports.getContentTypeFrom(specReq.headers), 'i');
    return regex.test(exports.getContentTypeFrom(req.headers));
};

exports.isBodyEqual = function (req, specReq, contentType) {

    if (!specReq && !req.body){
        return true;
    }

    if (/json/i.test(contentType)){
        return lodash.isEqual(JSON.parse(req.body), JSON.parse(specReq.body));
    } else {
        return req.body === specReq.body;
    }

    //TODO: application/xml, for future improvements
    //https://www.npmjs.org/package/xml-parser
};
