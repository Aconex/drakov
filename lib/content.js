var lodash = require('lodash');

var mediaTypeRe = /^\s*([^;]+)/i;

function getMediaType( contentType ) {
    return contentType.match( mediaTypeRe )[0].toLowerCase();
}

function getMediaTypeFromSpecReq( specReq ) {
    if( specReq && specReq.headers ) {
        specReq.headers.forEach(function( r, header ) {
            if(/content\-type/i.test( header.name )) {
                return getMediaType( header.value );
            }
        });
    }
    return null;
}

function getMediaTypeFromHttpReq( httpReq ) {
    if( 'content-type' in httpReq.headers ) {
        return getMediaType( httpReq.headers['content-type'] );
    }
    return null;
}

function isContentTypeEqual( httpReq, specReq ) {
    return getMediaTypeFromSpecReq( specReq ) === getMediaTypeFromHttpReq( httpReq );
}

function isBodyEqual( httpReq, specReq, contentType ) {
    if (!specReq && !httpReq.body){
        return true;
    }

    if (/json/i.test(contentType)){
        return lodash.isEqual(JSON.parse(httpReq.body), JSON.parse(specReq.body));
    } else {
        return httpReq.body === specReq.body;
    }
}

exports.matches = function( httpReq, specReq ) {
    if ( isContentTypeEqual( httpReq, specReq )) {
        if ( isBodyEqual(httpReq, specReq, getMediaTypeFromHttpReq( httpReq ))){
            return true;
        } else {
            console.warn('Skip. Different body');
            return false;
        }

    } else {
        console.warn('Skip. Different content-types');
        return false;
    }

};
