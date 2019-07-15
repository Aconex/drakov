const assert = require('assert');
const types = require('../../lib/parse/types-checker');

describe('type checker', () => {
    describe('GIVEN subject is an array', () => {
        let subject = ["array item"];
        it('WHEN checking for array IT returns true', () => {
            assert.ok(types.typeMatches(subject, "array"));
        });

    });

    describe('GIVEN subject is an json array as string', () => {
        let subject = '["array item"]';
        it('WHEN checking for array IT returns true', () => {
            assert.ok(types.typeMatches(subject, "array"));
        });

    });

    describe('GIVEN subject is not an array', () => {
        let subject = {};
        it('WHEN checking for array IT returns false', () => {
            assert.strictEqual(types.typeMatches(subject, "string"), false);
        });
    });

    describe('GIVEN subject is a boolean', () => {
        let subject = true;
        it('WHEN checking for boolean IT returns true', () => {
            assert.ok(types.typeMatches(subject, "boolean"));
        });

    });

    describe('GIVEN subject is string parsable as boolean', () => {
        let subject = 'true';
        it('WHEN checking for boolean IT returns true', () => {
            assert.ok(types.typeMatches(subject, "boolean"));
        });

    });

    describe('GIVEN subject is not a boolean', () => {
        let subject = {};
        it('WHEN checking for boolean IT returns false', () => {
            assert.strictEqual(types.typeMatches(subject, "boolean"), false);
        });
    });

    describe('GIVEN subject is a number', () => {
        let subject = 123;
        it('WHEN checking for number IT returns true', () => {
            assert.ok(types.typeMatches(subject, "number"));
        });

    });

    describe('GIVEN subject is string parsable as number', () => {
        let subject = '123';
        it('WHEN checking for number IT returns true', () => {
            assert.ok(types.typeMatches(subject, "number"));
        });

    });

    describe('GIVEN subject is not a number', () => {
        let subject = {};
        it('WHEN checking for number IT returns false', () => {
            assert.strictEqual(types.typeMatches(subject, "number"), false);
        });
    });

    describe('GIVEN subject is an object', () => {
        let subject = {};
        it('WHEN checking for object IT returns true', () => {
            assert.ok(types.typeMatches(subject, "object"));
        });

    });

    describe('GIVEN subject is string parsable as object', () => {
        let subject = '{}';
        it('WHEN checking for object IT returns true', () => {
            assert.ok(types.typeMatches(subject, "object"));
        });

    });

    describe('GIVEN subject is not an object', () => {
        let subject = "asdas";
        it('WHEN checking for object IT returns false', () => {
            assert.strictEqual(types.typeMatches(subject, "object"), false);
        });
    });

    describe('GIVEN subject is a string', () => {
        let subject = "a string";
        it('WHEN checking for string IT returns true', () => {
            assert.ok(types.typeMatches(subject, "string"));
        });

    });
    describe('GIVEN subject is not a string', () => {
        let subject = {};
        it('WHEN checking for string IT returns false', () => {
            assert.strictEqual(types.typeMatches(subject, "string"), false);
        });
    });

    describe('GIVEN the type is unexpected', () => {
        it('THEN it throws error',() =>{
            assert.throws(() => types.typeMatches(null, 'shmergenbergen'));
        });
    });

});

