//@flow
/* eslint-disable no-console */
const colors = require('colors/safe');

import type {Logger} from "./types";

const consoleLogger: Logger = {
    debug: (message) => {
        console.log(colors.gray('[DEBUG]  '), message);
    },

    info: (message) => {
        console.log(colors.white('[INFO ]  '), message);
    },

    warn: (message) => {
        console.error(colors.yellow('[WARN ]  '), message);
    },

    error: (message) => {
        console.error(colors.red('[ERROR]  '), message);
    },

    logHttpRequest: (message, httpRequest, errors) => {
        let errMsg = '';
        if (errors && errors.length) {
            errMsg = `\n\t${errors.join('\n\t')}`;
        }
        console.log(`${colors.white('[INFO ]  ')} ${colors.bold(httpRequest.status)}  ${message} ${JSON.stringify(httpRequest)}${errMsg}`);
    }
};

module.exports = {consoleLogger};
