var logger = require('./logger');
var lodash = require('lodash');
var specSchema= require('./spec-schema');
var contentTypeChecker = require('./content-type');

var isJson = contentTypeChecker.isJson;

var mediaTypeRe = /^\s*([^;]+)/i;

function getMediaType(contentType) {
    return contentType.match( mediaTypeRe )[0].toLowerCase();
}

function getMediaTypeFromSpecReq( specReq ) {
    if( specReq && specReq.headers ) {
        for( var i = 0; i < specReq.headers.length; i++ ) {
            if(/content\-type/i.test( specReq.headers[i].name )) {
                return getMediaType( specReq.headers[i].value );
            }
        }
    }
    return null;
}

function getMediaTypeFromHttpReq( httpReq ) {
    var contentTypeHeader = getHeaderFromHttpReq( httpReq, 'content-type' );
    if( contentTypeHeader ) {
        return getMediaType( contentTypeHeader );
    }
    return null;
}

function getHeaderFromHttpReq( httpReq, header ) {
    if ( header in httpReq.headers ) {
        return httpReq.headers[header];
    }
    return null;
}

function getBodyContent(req, parseToJson){
    var body = null;
    if (req && req.body) {
        body = req.body.trim();
    }

    if (parseToJson){
        try {
            body = JSON.parse(body);
        } catch (e) {
            logger.log('[WARNING]'.red, 'JSON body could not be parsed. Using body as is.');
        }
    }

    return body;
}

exports.areContentTypesSame = function(httpReq, specReq) {
    return getMediaTypeFromHttpReq(httpReq) === getMediaTypeFromSpecReq(specReq);
};

exports.matchesBody = function(httpReq, specReq) {
    if (!specReq) {
        return true;
    }

    var contentType = getMediaTypeFromHttpReq(httpReq);

    if (contentTypeChecker.isMultipart(contentType)) {
        return true;
    }

    var reqBody = getBodyContent(httpReq, isJson(contentType));
    var specBody = getBodyContent(specReq, isJson(contentType));

    return lodash.isEqual(reqBody, specBody);
};

exports.matchesSchema = function(httpReq, specReq) {
    if (!specReq){
        return true;
    }

    var contentType = getMediaTypeFromHttpReq(httpReq);
    var reqBody = getBodyContent(httpReq, isJson(contentType));

    return specSchema.matchWithSchema(reqBody, specReq.schema);
};

exports.matchesHeader = function(httpReq, specReq) {
    if (!specReq || !specReq.headers){
        return true;
    }

    function removeContentTypeHeader(header){
        return header.name.toLowerCase() !== 'content-type';
    }

    function containsHeader( header ){
        var httpReqHeader = header.name.toLowerCase();
        return httpReq.headers.hasOwnProperty(httpReqHeader) &&
            httpReq.headers[httpReqHeader] === header.value;
    }

    return specReq.headers.filter(removeContentTypeHeader).every(containsHeader);
};
