// @flow
import type {HttpRequest, Logger} from "./types";

const {consoleLogger} = require("./consoleLogger");
const {StackdriverLogger} = require( "./stackdriverLogger");

const serviceName = process.env.STACKDRIVER_SERVICE_NAME;

// Choose logging strategy
const log: Logger = serviceName ? new StackdriverLogger(serviceName) : consoleLogger;

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

exports.setLogLevel = (level: string) => {
    const newLevel = levels[level];
    if (newLevel !== undefined) {
        logLevel = newLevel;
    }
};

exports.debug = (...args: Array<string>) => {
    if (logLevel >= levels.DEBUG) {
        log.debug(args.join(' '));
    }
};

exports.info = (...args: Array<string>) => {
    if (logLevel >= levels.INFO) {
        log.info(args.join(' '));
    }
};

exports.warn = (...args: Array<string>) => {
    if (logLevel >= levels.WARN) {
        log.warn(args.join(' '));
    }
};

exports.error = (...args: Array<string>) => {
    if (logLevel >= levels.ERROR) {
        log.error(args.join(' '));
    }
};

exports.logHttpRequest = (message: string, httpRequest: HttpRequest) => {
    if (logLevel >= levels.INFO) {
        log.logHttpRequest(message, httpRequest);
    }
};
