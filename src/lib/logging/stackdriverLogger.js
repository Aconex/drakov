// @flow
/* eslint-disable no-console */
import type {Logger} from "./types";

// GCS Levels
type Level =  "ERROR" | "WARNING" | "INFO" | "DEBUG";

function StackdriverLogger(serviceName: string): Logger {

    const serviceContext = {
        service: serviceName,
        version: process.env.VERSION || 'unknown',
    };

    const formatAsStackdriverPayload: (string, Level) => string = (message, severity) => {
        //required payload shape (including serviceContext)
        return JSON.stringify({
            message,
            severity,
            serviceContext,
        })
    };

    this.debug = (message) => {
        console.log(formatAsStackdriverPayload(message, "DEBUG"));
    };

    this.info = (message) => {
        console.log(formatAsStackdriverPayload(message, "INFO"));
    };

    this.warn = (message) => {
        console.log(formatAsStackdriverPayload(message, "WARNING"));
    };

    this.error = (message) => {
        console.error(formatAsStackdriverPayload(message, "ERROR"));
    };

    return this;
}

module.exports = {StackdriverLogger: StackdriverLogger};
