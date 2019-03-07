// @flow
import type {Logger} from "./types";

const {consoleLogger} = require("./consoleLogger");
const {GcsLogger} = require( "./gcsLogger");

const logName = process.env.GCS_LOG_NAME;

// Choose logging strategy
const log: Logger = logName ? new GcsLogger(logName) : consoleLogger;

const levels: {[key: string]: number} = {
    NONE: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4
};

//$FlowFixMe
exports.levels = Object.keys(levels);

let logLevel = levels.INFO;

exports.setLogLevel = function (level: string) {
    const newLevel = levels[level];
    if (newLevel !== undefined) {
        logLevel = newLevel;
    }
};

exports.debug = function (...args: Array<string>) {
    if (logLevel >= levels.DEBUG) {
        log.debug(args.join(' '));
    }
};

exports.info = function (...args: Array<string>) {
    if (logLevel >= levels.INFO) {
        log.info(args.join(' '));
    }
};

exports.warn = function (...args: Array<string>) {
    if (logLevel >= levels.WARN) {
        log.warn(args.join(' '));
    }
};

exports.error = function (...args: Array<string>) {
    if (logLevel >= levels.ERROR) {
        log.error(args.join(' '));
    }
};

