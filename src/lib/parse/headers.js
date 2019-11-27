"use strict";
//@flow

const types = require('./types-checker');
const logger = require('../logging/logger');

export type HeaderDef = {
    name: string,
    value: string,
    type: string,
    required?: boolean,
};
type Match = {
    groups: MatchGroups
};

type MatchGroups = {
    required: string,
    value: string,
    type: string
};

export type HeaderValidation = {
    valid: boolean,
    messages: Array<string>
};

const regExp = /`?(?<value>[^`]*?)`?\s*\((?<type>[^,]*),?\s?(?<required>.*)\)/;

const parseHeaderValue = (rawHeader: HeaderDef): HeaderDef => {
    // $FlowFixMe - flow does not support match group names
    let match: ?Match = regExp.exec(rawHeader.value);
    if (match) {
        let required: boolean;
        switch (match.groups.required) {
            case 'required':
            case '':
                required = true;
                break;
            case 'optional':
                required = false;
                break;
            default:
                throw new Error(`For header "${rawHeader.name}", unrecognized optionality: "${match.groups.required}"`);
        }
        let type = match.groups.type;
        if (type && !types.isExpectedType(type)){
            logger.warn(`For header "${rawHeader.name}" found unknown type: ${type}; type checking will be disabled for this header.`);
            type = '';
        }

        return {
            name: rawHeader.name,
            value: match.groups.value,
            type: type,
            required: required,
        };
    }

    return {
        name: rawHeader.name,
        value: rawHeader.value,
        type: '',
        required: true,
    };
};

const compareFixtureAndContractHeaders = (fixtureHeaders: ?Array<HeaderDef>, contractHeaders: Array<HeaderDef>): HeaderValidation => {
    fixtureHeaders = fixtureHeaders || [];
    const result = {
        valid: true,
        messages: [],
    };

    // making a map of header name to definition to avoid a nested loop and because it is clearer to use
    const fixtureMap = fixtureHeaders.reduce((map, item) => {
        map[item.name] = item;
        return map;
    }, {});

    contractHeaders.forEach(contract => {
        const fixture: HeaderDef = fixtureMap[contract.name];
        if (!fixture) {
            if (contract.required) {
                result.valid = false;
                result.messages.push(`Header "${contract.name}" is required but not in the fixture`);
            }
            return;
        }

        if (!fixture.required && contract.required) {
            result.valid = false;
            result.messages.push(`Header "${contract.name}" is required in the contract but is optional in the fixture`);
            return;
        }

        if (fixture.type) {
            if (fixture.type !== contract.type) {
                result.valid = false;
                result.messages.push(`Header "${contract.name}" types mismatch: expected contract type "${contract.type}", but got type "${fixture.type}"`);
                return;
            }
        } else if (contract.type) {
            if(!types.headerTypeMatches(fixture.value, contract.type)) {
                result.valid = false;
                result.messages.push(`Header "${contract.name}" value does not match type: expected contract type "${contract.type}", but got value "${fixture.value}"`);
                return;
            }
        } else {
            if (fixture.value !== contract.value) {
                result.valid = false;
                result.messages.push(`Header "${contract.name}" value does not match contract: expected contract value "${contract.value}", but got value "${fixture.value}"`);
                return;
            }
        }

    });

    return result;
};

module.exports = {
    parseHeaderValue,
    compareFixtureAndContractHeaders,
};
