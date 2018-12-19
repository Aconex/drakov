var tv4 = require('tv4');
var metaSchema = require('./json/meta-schema-v4');

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

    let result = tv4.validateMultiple(json, schema);

    var niceErrors = [];
    if (!result.valid) {

        result.errors.forEach(function(error) {
            niceErrors.push(error.dataPath + ' ' + error.message);
        });

        result.niceErrors = niceErrors;
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
