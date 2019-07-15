// @flow
// A wrapper around fetch to allow stubbing in tests

const fetchInternal = require('node-fetch');

const fetch = (url: string, options?: { [string]: any }): Promise<string> => {
    return fetchInternal(url, options)
        .then(res => res.text());
}
module.exports = {
    fetch
};
