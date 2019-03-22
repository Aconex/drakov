// @flow
// Stackdriver property names: https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#HttpRequest
export type HttpRequest = {
    "requestMethod": string,
    "requestUrl": string,
    "status": number,
    "headers": {[string]: string}
}

export interface Logger {
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;

    logHttpRequest(message: string, httpRequest: HttpRequest): void;
}
