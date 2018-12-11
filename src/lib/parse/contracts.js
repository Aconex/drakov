// @flow 
const fs = require('fs');

const logger = require('../../lib/logger');

let parseContracts = (fileNames: Array<string>): Array<Buffer> => {
    const contents: Array<Buffer> = [];
    fileNames.forEach((name: string) => {
        try {
            contents.push(fs.readFileSync(name));
        } catch (e) {
            logger.error(`Unable to open file "${name}"`);
        }
    });

    return contents;
};

module.exports = {
    parseContracts
}