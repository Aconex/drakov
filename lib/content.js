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

function areContentTypesSame(httpReq, specReq) {
    var actual = getMediaTypeFromHttpReq(httpReq);
    var expected = getMediaTypeFromSpecReq(specReq);

    var result = !expected || actual === expected;
    logger.log('[MATCHING]'.yellow,'by request content type:', expected, 'actual:', actual, logger.stringfy(result));
    return result;
}

exports.contentTypeComparator = function(specA) {

    function hasContentTypeHeader(spec){
        if (spec.request && spec.request.headers){
            return spec.request.headers.filter(function(header){ return header.name.toLowerCase() === 'content-type';}).length > 0;
        }
        return false;
    }

    return !hasContentTypeHeader(specA)? 1 : -1;
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
    var result = lodash.isEqual(reqBody, specBody);

    logger.log('[MATCHING]'.yellow,'by request body content', logger.stringfy(result));
    return result;
};

exports.matchesSchema = function(httpReq, specReq) {
    if (!specReq){
        return true;
    }

    var contentType = getMediaTypeFromHttpReq(httpReq);
    var reqBody = getBodyContent(httpReq, isJson(contentType));
    var result =  specSchema.matchWithSchema(reqBody, specReq.schema);
    logger.log('[MATCHING]'.yellow,'by request body schema', logger.stringfy(result));
    return result;
};

exports.matchesHeader = function(httpReq, specReq, ignoreHeaders) {
    if (!specReq || !specReq.headers){
        return true;
    }

    ignoreHeaders = (ignoreHeaders && ignoreHeaders.map(function (header) {
      return header.toLowerCase();
    })) || [];

    function shouldIgnoreHeader(headerName){
        return ignoreHeaders.indexOf(headerName.toLowerCase()) > -1;
    }

    function headersForEvaluation(header) {
        return header.name &&
                (header.name.toLowerCase() !== 'content-type' &&
                !shouldIgnoreHeader(header.name));
    }

    function containsHeader( header ){
        var httpReqHeader = header.name.toLowerCase();
        var result = httpReq.headers.hasOwnProperty(httpReqHeader) &&
          httpReq.headers[httpReqHeader] === header.value;

        logger.log('[MATCHING]'.yellow,'by request header', httpReqHeader, '=', header.value, logger.stringfy(result));
        return result;
    }

    return specReq.headers.filter(headersForEvaluation).every(containsHeader) &&
      (shouldIgnoreHeader('content-type') || areContentTypesSame(httpReq, specReq));
};
