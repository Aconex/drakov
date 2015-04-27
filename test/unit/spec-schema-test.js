var assert = require ('assert');
var specSchema = require('../../lib/spec-schema');

var schema =  {
    type: 'object',
    required: ['id'],
    properties: {
        id: {type: 'number'},
        title: {type: 'string' }
    }
};

describe('Spec Schema', function() {

    describe ('hasSchema', function() {
        it('Should return true when the spec object has a schema property', function () {
            assert.equal(specSchema.hasSchema({schema: {}}), true);
        });

        it('Should return false when the spec object has a schema property', function () {
            assert.equal(specSchema.hasSchema({}), false);
        });
    });

    describe ('matchWithSchema', function() {
        it('Should return true when json is validated against schema', function () {
            assert.equal(specSchema.matchWithSchema({id: 1}, schema), true);
        });

        it('Should return false when json is not validated against schema', function () {
            assert.equal(specSchema.matchWithSchema({idea: 1}, schema), false);
        });
    });

    describe ('validateAndParseSchema', function() {
        it('Should parse and validate schema', function () {
            var spec = specSchema.validateAndParseSchema({schema: JSON.stringify(schema)});
            assert.deepEqual(spec.schema, schema);
        });

        it('Should throw error when spec schema is not a valid JSON Schema V4 Schema', function () {
            assert.throws(function(){
                specSchema.validateAndParseSchema({schema: JSON.stringify({type: 'passionfruit'})});
            }, Error);
        });
    });
});
