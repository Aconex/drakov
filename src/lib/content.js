var logger = require('./logging/logger');
var lodash = require('lodash');
var specSchema = require('./spec-schema');
var contentTypeChecker = require('./content-type');
var strictSchemas = require('./strict-schemas');
var types = require('./parse/types-checker');

var isJson = contentTypeChecker.isJson;

var mediaTypeRe = /^\s*([^;]+)/i;

function getMediaType(contentType) {
    return contentType.match(mediaTypeRe)[0].toLowerCase();
}

function getMediaTypeFromSpecReq(specReq) {
    if (specReq && specReq.headers) {
        for (var i = 0; i < specReq.headers.length; i++) {
            if (/content-type/i.test(specReq.headers[i].name)) {
                return getMediaType(specReq.headers[i].value);
            }
        }
    }
    return null;
}

function getMediaTypeFromHttpReq(httpReq) {
    var contentTypeHeader = getHeaderFromHttpReq(httpReq, 'content-type');
    if (contentTypeHeader) {
        return getMediaType(contentTypeHeader);
    }
    return null;
}

function getHeaderFromHttpReq(httpReq, header) {
    if (header in httpReq.headers) {
        return httpReq.headers[header];
    }
    return null;
}

function getBodyContent(req, parseToJson) {
    var body = null;
    if (req && req.body) {
        body = req.body.trim();
    }

    if (parseToJson) {
        try {
            body = JSON.parse(body);
        } catch (e) {
            logger.warn('JSON body could not be parsed. Using body as is.');
        }
    }

    return body;
}

function areContentTypesSame(httpReq, specReq) {
    var actual = getMediaTypeFromHttpReq(httpReq);
    var expected = getMediaTypeFromSpecReq(specReq);

    var result = !expected || actual === expected;
    logger.debug('Matching by request content type:', expected, 'actual:', actual, renderMatchType(result));
    return result;
}

exports.contentTypeComparator = function (specA) {

    function hasContentTypeHeader(spec) {
        if (spec.request && spec.request.headers) {
            return spec.request.headers.filter(function (header) {
                return header.name.toLowerCase() === 'content-type';
            }).length > 0;
        }
        return false;
    }

    return !hasContentTypeHeader(specA) ? 1 : -1;
};

exports.matchesBody = function (httpReq, specReq) {
    if (!specReq) {
        return true;
    }

    //if a schema is present, don't match body
    if (specReq.schema) {
        return false;
    }

    var contentType = getMediaTypeFromHttpReq(httpReq);

    if (contentTypeChecker.isMultipart(contentType)) {
        return true;
    }

    var reqBody = getBodyContent(httpReq, isJson(contentType));
    var specBody = getBodyContent(specReq, isJson(contentType));
    var result = lodash.isEqual(reqBody, specBody);

    logger.debug('Matching by request body content', renderMatchType(result));
    return result;
};

exports.matchesSchema = function (httpReq, specReq) {
    if (!specReq || !specReq.schema) {
        return {
            valid: false
        };
    }
    let rejectUnknownProps = strictSchemas.rejectUnknownProps(httpReq);

    let schema = rejectUnknownProps ? strictSchemas.getStrictSchema(specReq.schema)
        : specReq.schema;

    var contentType = getMediaTypeFromHttpReq(httpReq);
    var reqBody = getBodyContent(httpReq, isJson(contentType));
    var result = specSchema.matchWithSchema(reqBody, schema);
    logger.debug('Matching by request body schema', renderMatchType(result.valid));
    if (!result.valid) {
        logger.debug(result.formattedErrors);
    }
    return result;
};

exports.matchesHeader = function (httpReq, specReq, ignoreHeaders) {
    if (!specReq || !specReq.headers) {
        return true;
    }

    ignoreHeaders = (ignoreHeaders && ignoreHeaders.map(function (header) {
        return header.toLowerCase();
    })) || [];

    function shouldIgnoreHeader(headerName) {
        return ignoreHeaders.indexOf(headerName.toLowerCase()) > -1;
    }

    function headersForEvaluation(header) {
        return header.name &&
            (header.name.toLowerCase() !== 'content-type' &&
                !shouldIgnoreHeader(header.name));
    }

    function isValidHeader(specHeader) {
        const headerName = specHeader.name.toLowerCase();
        if (!httpReq.headers.hasOwnProperty(headerName)) {
            if (specHeader.required) {
                logger.debug(`Matching by request header: For "${headerName}" is required but missing ${'NOT_MATCHED'.red}`);
                return false;
            } else {
                logger.debug(`Matching by request header: Optional header ${headerName} omitted`);
                return true;
            }
        }

        const reqValue = httpReq.headers[headerName];
        if (specHeader.type) {
            if (!types.headerTypeMatches(reqValue, specHeader.type)) {
                logger.debug(`Matching by request header: For "${headerName}" expected type "${specHeader.type}" but got value "${reqValue}" ${'NOT_MATCHED'.red}`);
                return false;
            } else {
                logger.debug(`Matching by request header: "${headerName}" ${'MATCHED'.green}`);
                return true;
            }
        }

        if (reqValue !== specHeader.value) {
            logger.debug(`Matching by request header: For "${headerName}" expected value "${specHeader.value}" but got value "${reqValue}" ${'NOT_MATCHED'.red}`);
            return false;
        }

        logger.debug(`Matching by request header: "${headerName}" ${'MATCHED'.green}`);
        return true;
    }

    return specReq.headers.filter(headersForEvaluation).every(isValidHeader) &&
        (shouldIgnoreHeader('content-type') || areContentTypesSame(httpReq, specReq));
};

function renderMatchType(matched) {
    return matched ? 'MATCHED'.green : 'NOT_MATCHED'.red;
}
