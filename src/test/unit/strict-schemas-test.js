const assert = require('assert');
const strictSchemas = require('../../lib/strict-schemas');
const schema = {
    type: 'object',
    required: ['id'],
    properties: {
        id: {type: 'number'},
        title: {type: 'string'},
        third: {
            type: 'object',
            properties: {
                inner: {type: 'string'}
            },
        },
    }
};

describe('strictSchemas', () => {
    describe('rejectUnknownProps', () => {
        describe('when the request has reject-unknown-props == "true"', () => {
            it('returns true', () => {
                assert.strictEqual(strictSchemas.rejectUnknownProps({headers: {'reject-unknown-props': 'true'}}), true);
            });
        });

    });

    describe('getStrictSchema', () => {
        it('should add the `additionalProperties: false` to each object', () => {

            const strictSchema = strictSchemas.getStrictSchema(schema);

            assert.strictEqual(strictSchema.additionalProperties, false, 'parent schema missing property');
            assert.strictEqual(strictSchema.properties.third.additionalProperties, false, 'child missing proptery');

        });

    });
});
