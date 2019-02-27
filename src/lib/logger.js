/* eslint-disable no-console */
require('colors');

const levels = {
    NONE: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4
}
exports.levels = Object.keys(levels);

var logLevel = levels.INFO;

exports.setLogLevel = function (level) {
    const newLevel = levels[level]
    if (newLevel !== undefined) {
        logLevel = newLevel;
    }
};

exports.debug = function (...args) {
    if (logLevel >= levels.DEBUG) {
        console.log('[DEBUG]  '.gray, args.join(' '));
    }
};

exports.info = function (...args) {
    if (logLevel >= levels.INFO) {
        console.log('[INFO ]  '.white, args.join(' '));
    }
};

exports.warn = function (...args) {
    if (logLevel >= levels.WARN) {
        console.error('[WARN ]  '.yellow, args.join(' '));
    }
};

exports.error = function (...args) {
    if (logLevel >= levels.ERROR) {
        console.error('[ERROR]  '.red, args.join(' '));
    }
};

