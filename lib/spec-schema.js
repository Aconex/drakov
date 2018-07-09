var tv4 = require('tv4');
var metaSchema = require('./json/meta-schema-v4');
var logger = require('./logger');

function validateSchema(schema) {
    if (metaSchema.$schema) {
        tv4.addSchema('', metaSchema);
        tv4.addSchema(metaSchema.$schema, metaSchema);
    }

    if (!tv4.validate(schema, metaSchema)) {
        throw new Error('JSON schema is not valid! ' + tv4.error.message + ' at path "' + tv4.error.dataPath + '"');
    }
}

exports.hasSchema = function(spec) {
    return !!spec.schema;
};

exports.matchWithSchema = function(json, schema) {
    result = tv4.validateResult(json, schema);
    if (!result.valid) {
        niceError = result.error.dataPath + ' ' + result.error.message
        logger.log('ERROR', niceError);
    }

    return result;
};

exports.validateAndParseSchema = function(spec) {
    if (this.hasSchema(spec)) {
        spec.schema = JSON.parse(spec.schema);
        validateSchema(spec.schema);
    }
    return spec;
};
