// @flow
/* eslint-disable no-console */
import type {Logger} from "./types";

// GCS Levels
type Level =  "ERROR" | "WARNING" | "INFO" | "DEBUG";

function GcsLogger(serviceName: string): Logger {

    const serviceContext = {
        service: serviceName,
        version: process.env.VERSION || 'unknown',
    };

    const makeEntry: (string, Level) => string = (message, severity) => {
        return JSON.stringify({
            message,
            severity,
            serviceContext,
        })
    };

    this.debug = (message) => {
        console.log(makeEntry(message, "DEBUG"));
    };

    this.info = (message) => {
        console.log(makeEntry(message, "INFO"));
    };

    this.warn = (message) => {
        console.log(makeEntry(message, "WARNING"));
    };

    this.error = (message) => {
        console.error(makeEntry(message, "ERROR"));
    };

    return this;
}

module.exports = {GcsLogger};
