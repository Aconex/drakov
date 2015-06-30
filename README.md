# Drakov API Blueprint Mock Server

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/Aconex/drakov?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![npm version](https://badge.fury.io/js/drakov.svg)](http://badge.fury.io/js/drakov) [![Build Status](https://travis-ci.org/Aconex/drakov.svg)](https://travis-ci.org/Aconex/drakov)

![Drakov](drakov.png)

Mock server that implements the [API Blueprint](http://apiblueprint.org/) specification:


## Note on Dependencies

You will need to have `g++` and `make` installed on your system so `npm install` can compile the [Snow Crash](https://github.com/apiaryio/snowcrash) library.


## Installation instructions

`npm install -g drakov`



## Running

`drakov -f <glob expression to your md files> -s <comma delimited list of static file paths> -p <server port>`


**Argument Notes:**

- Glob expression is required
- If a list of static file paths are provided, then Drakov will proxy the static files
- Server port is optional and defaults to **3000**
- CORS headers are sent by default, you need to use the --disableCORS switch/property


**Examples**

With only a glob expression

`drakov -f "../com/foo/contracts/*.md"`

With glob expression and single static path

`drakov -f "../com/foo/contracts/*.md" -s "../path/to/static/files"`

With glob expression and multiple static paths (must be comma delimited with no spaces)

`drakov -f "../com/foo/contracts/*.md" -s "../path/to/static/files" -s "../second/path/to/static/files"`

With globa expression and static path that has a specific mount point

`drakov -f "../com/foo/contracts/*.md" -s "../path/to/static/files=/www/path"`

With globa expression and static path that has a specific mount point with different path mount delimiter

`drakov -f "../com/foo/contracts/*.md" -s "../path/to/static/files:/www/path" -d ":"`

With glob expression and specified server port

`drakov -f "../com/foo/contracts/*.md" -p 4007`

When running drakov and binding to a public IP

`drakov -f "../com/foo/contracts/*.md" --public`

## CORS Header

By default a CORS header is sent, you can disable it with the --disableCORS switch.

`drakov -f "../com/foo/contracts/*.md" --disableCORS`

## Run on Public Interface

By default Drakov only binds to localhost, to run on the public IP interface use the --public switch.

`drakov -f "../com/foo/contracts/*.md" --public`

## SSL Support

To enable SSL you must provide both key and certificate. Use parameters --sslKeyFile and --sslCrtFile to specify the path to your key and certificate files.
Once SSL is enabled Drakov will only respond to HTTPS requests.

`drakov -f "../com/foo/contracts/*.md" --sslKeyFile="./ssl/server.key" --sslCrtFile="./ssl/server.crt"`

## Stealth Mode

In some cases you may wish to suppress the logging output of Drakov. To do so, run is with the `--stealthmode` options.

`drakov -f "../com/foo/contracts/*.md" --stealthmode`

## Response Delay

In some case you may want to force Drakov to delay sending a response. To do this simple use the `--delay` argument followed by a number (ms).

`drakov -f "../com/foo/contracts/*.md" --delay 2000`

## Allow Methods Header

For HTTP methods such as DELETE, you may want Drakov to return them in the appropriate methods allow header. You can do this using the `--method` argument

`drakov -f "../com/foo/contracts/*.md" --method DELETE`

`drakov -f "../com/foo/contracts/*.md" --method DELETE --method OPTIONS`


## Using as a Node.js module

    var drakov = require('drakov');
    
    var argv = {
        sourceFiles: 'path/to/files/**.md',
        serverPort: 3000,
        staticPaths: [
            '/path/to/static/files',
            '/another/path/to/static/files',
            '/path/to/more/files=/mount/it/here'
        ],
        stealthmode: true,
        disableCORS: true,
        sslKeyFile: '/path/to/ssl/key.key',
        sslCrtFile: '/path/to/ssl/cert.crt',
        delay: 2000,
        method: ['DELETE','OPTIONS']
    };
    
    drakov.run(argv, function(){
        // started Drakov
        drakov.stop(function() {
            // stopped Drakov
        });
    });


## Using as an Express middleware

Due to protagonist parsing being async, we need to setup the middleware with an init function

    var drakovMiddleware = require('drakov');

    var argv = {
        sourceFiles: 'path/to/files/**.md',
        serverPort: 3000,
        staticPaths: [
            '/path/to/static/files',
            '/another/path/to/static/files',
            '/path/to/more/files=/mount/it/here'
        ],
        stealthmode: true,
        disableCORS: true,
        sslKeyFile: '/path/to/ssl/key.key',
        sslCrtFile: '/path/to/ssl/cert.crt',
        delay: 2000,
        method: ['DELETE','OPTIONS']
    };

    var app = express();
    drakovMiddleware.init(app, argv, function(err, middlewareFunction) {
        if (err) {
            throw err;
        }
        app.use(middlewareFunction);
        app.listen(argv.serverPort);
    });

## FAQ

**Q:** If I have multiple requests/responses on the same API endpoint, which response will I get?

**A:** Drakov will respond first with any responses that have a JSON schema with the first response matching the request body for that API endpoint. You can request a specific response by adding a `Prefer` header to the request in the form `Prefer:status=XXX` where `XXX` is the status code of the desired response.


**Q:** If I have multiple responses on a single request, which response will I get?

**A:** Drakov will respond with the first response.


**Q:** Drakov is too loud (outputting too much logging), can I turn off request and API responses?

**A:** You can suppress all but the startup output of Drakov with `--stealthmode`.


## CONTRIBUTING

Pull requests with patches for fixes and enhancements are very welcome. We have a few requirements that will help us to quickly assess your contributions.

If you have any ideas or questions you are welcome to post an issue.

### Code conventions
* Setup your editor to use the `.editorconfig` and `.jshintrc` files included in the project
* We use 4 spaces for tabs
* Most of the style issues should be resolve as long as you run `npm test` and run against the jshinting rules
* We prefer readability over compact code

### Logging in your code
* Include the `lib/logger` module and use `logger.log()`, this allows your logging be properly disabled in Drakov's stealth mode
* Always have a type qualifier in square brackets in from of your message in white, `logger.log('[TYPE]'.white`, 'Something is happening');`
* We don't have any guidelines for how to log, except that you should have your type a different colour from your actual message (better logging is in our roadmap)

### Functionality that adds CLI arguments
* Make sure you add the new argument property to the `optimistOptions` object in the [arguments module](https://github.com/Aconex/drakov/blob/master/lib/arguments.js#L3)

### Middleware functionality
* For functionality that does something with the request object add code to the [request module](https://github.com/Aconex/drakov/blob/master/lib/request.js)
* For functionality that does something with the response object add code to the [response module](https://github.com/Aconex/drakov/blob/master/lib/response.js)

### Testing
* If your contribution deals with API Blueprint request/response behaviour add an example into an existing or new markdown file in the `test/example/md` directory
* Always add a test in `test/api` for request/response behaviour tests, or `test/unit` if it is a unit test
* All test specification files must end in `-test.js`
* Always run `npm test` before you submit your build request

## CHANGELOG

A history of changes with a list of contributors can be found at https://github.com/Aconex/drakov/blob/master/CHANGELOG.md

## MAINTAINERS

Yakov Khalinsky <ykhalinsky@aconex.com>

Marcelo Garcia de Oliveira <moliveira@aconex.com>

## Drakov Logo

*Huge thanks to Eva Mansk for the funky logo!*

You are welcome to use the Drakov logo as long it is to refer to this project and you provide acknowledgement and a link back to our project.
