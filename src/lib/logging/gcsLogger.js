// @flow
/* eslint-disable no-global-assign */
import type {Logger} from "./types";
const util = require('util');

// GCS logging needs this defined on the global object or else it uses a shim that breaks drafter :(
// $FlowFixMe
TextEncoder = new util.TextEncoder();

const {Entry, Logging} = require("@google-cloud/logging");

const projectId = "fubotv-infra";

function GcsLogger(logName: string): Logger {

    const log = new Logging({projectId})
        .log(logName);

    const makeEntry = (message: string): Entry => {
        return log.entry({}, message)
    };

    this.debug = (message: string) => {
        log.debug(makeEntry(message))
            .catch()
    };

    this.info = (message: string) => {
        log.info(makeEntry(message))
    };

    this.warn = (message: string) => {
        log.warning(makeEntry(message))
    };

    this.error = (message: string) => {
        log.critical(makeEntry(message))
    };

    return this;
}

module.exports = {GcsLogger};
