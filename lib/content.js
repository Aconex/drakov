var logger = require('./logger');
var lodash = require('lodash');
var specSchema= require('./spec-schema');
var contentTypeChecker = require('./content-type');

var isJson = contentTypeChecker.isJson;
var isMultipart = contentTypeChecker.isMultipart;

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

function getPreferHeaderFromHttpReq( httpReq, preference ) {
    var preferHeader = getHeaderFromHttpReq( httpReq, 'prefer' );
    var preferenceRegExp = new RegExp(preference + '=(.*)', 'i');
    var matchedStatus;
    if ( preferHeader ) {
        matchedStatus = preferHeader.match(preferenceRegExp);
        if (matchedStatus) {
            return matchedStatus[1];
        }
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

function validateJson(reqBody, specBody, schema){
    if (schema){
        return specSchema.matchWithSchema(reqBody, schema);
    }
    return lodash.isEqual(reqBody, specBody);
}

function isBodyEqual( httpReq, specReq, contentType ) {
    if (!specReq && !httpReq.body){
        return true;
    }

    var reqBody = getBodyContent(httpReq, isJson(contentType));
    var specBody = getBodyContent(specReq, isJson(contentType));

    if (reqBody === specBody){
        return true;
    }

    if(isMultipart(contentType)) {
        return true;
    }

    if (isJson(contentType)) {
        return validateJson(reqBody, specBody, specReq.schema);
    }

    return false;
}

function hasHeaders( httpReq, specReq ){
    if (!specReq || !specReq.headers){
        return true;
    }

    function containsHeader( header ){
        var httpReqHeader = header.name.toLowerCase();

        if(header.name === 'Content-Type'){
            return true;
        }

        if(!httpReq.headers.hasOwnProperty(httpReqHeader) || httpReq.headers[httpReqHeader] !== header.value){
            return false;
        }

        return true;
    }

    return specReq.headers.every(containsHeader);
}

function areContentTypesSame(httpMediaType, specMediaType) {
    if(httpMediaType === specMediaType) {
        return true;
    }

    if(isMultipart(httpMediaType) && isMultipart(specMediaType)) {
        return true;
    }

    return false;
}

function isPreferredStatus(spec, preferredStatus) {
    return spec.response.name === preferredStatus;
}

exports.matches = function( httpReq, spec ) {
    var specReq = spec.request;
    var httpMediaType = getMediaTypeFromHttpReq(httpReq);
    var specMediaType = getMediaTypeFromSpecReq(specReq);
    var preferredStatus = getPreferHeaderFromHttpReq(httpReq, 'status');

    if (!preferredStatus || isPreferredStatus(spec, preferredStatus)) {
        if (areContentTypesSame(httpMediaType, specMediaType)) {
            if (!hasHeaders(httpReq, specReq)) {
                return false;
            }

            if (isBodyEqual(httpReq, specReq, httpMediaType)) {
                return true;
            } else {
                return false;
            }

        } else {
            return false;
        }

    } else {
        return false;
    }
};
