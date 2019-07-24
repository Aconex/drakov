//@flow
const logger = require('../logging/logger');
const isArray = (subject: any): boolean => {
    if (Array.isArray(subject)) {
        return true;
    }

    try {
        const parsed = JSON.parse(subject);
        return Array.isArray(parsed);
    } catch (e) {
        return false;
    }

};

const isBoolean = (subject: any): boolean => {
    if (typeof subject === 'boolean') {
        return true;
    }

    try {
        const parsed = JSON.parse(subject);
        return typeof parsed === 'boolean';
    } catch (e) {
        return false;
    }

};

const isNumber = (subject: any): boolean => {
    if (typeof subject === 'number') {
        return true;
    }
    // Number('') == 0
    if (subject === '') {
        return false;
    }

    return !isNaN(Number(subject))

};

const isObject = (subject: any): boolean => {
    // js `typeof array === object` ...sigh
    if (typeof subject === 'object' && !Array.isArray(subject)) {
        return true;
    }

    try {
        const parsed = JSON.parse(subject);
        return typeof parsed === 'object' && !Array.isArray(parsed);
    } catch (e) {
        return false;
    }

};

const isString = (subject: any): boolean => {
    return typeof subject === "string";
};

exports.typeMatches = (subject: any, type: string): boolean => {
    // allow types like array[string]
    if (type.startsWith("array")) {
        type = "array";
    }
    switch (type) {
        case "array":
            return isArray(subject);
        case "boolean":
            return isBoolean(subject);
        case "number":
            return isNumber(subject);
        case "object":
            return isObject(subject);
        case "string":
            return isString(subject);
        default:
            logger.warn(`Trying to do type check for unknown type ${type}. Allowing match.`)
            return true;
    }
};

const expectedTypes = [
    "string",
    "number",
    "boolean",
    "object",
    "array",
];

exports.isExpectedType = (type: string): boolean => {
    // allow 'array[<type>]
    if (type.startsWith("array")) {
        return true;
    }
    return expectedTypes.includes(type);
};
