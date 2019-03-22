// @flow
/* eslint-disable no-console */
import type {HttpRequest, Logger} from "./types";

// GCS Levels
type Level = "ERROR" | "WARNING" | "INFO" | "DEBUG";

function StackdriverLogger(serviceName: string): Logger {

    const version = process.env.VERSION || 'unknown';

    const formatAsStackdriverPayload: (string, Level, ?HttpRequest) => string = (message, severity, httpRequest) => {
        //required payload shape for stackdriver
        let payload: any = {
            logName: serviceName,
            message,
            severity,
            version,
        };

        if (httpRequest) {
            payload.httpRequest = httpRequest;
        }
        return JSON.stringify(payload);
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

    this.logHttpRequest = (message: string, httpRequest: HttpRequest) => {
        console.log(formatAsStackdriverPayload(message, "INFO", httpRequest))
    };

    return this;
}

module.exports = {StackdriverLogger: StackdriverLogger};
