# Drakov API Blueprint Mock Server

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/Aconex/drakov?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/Aconex/drakov.svg)](https://travis-ci.org/Aconex/drakov)

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


## Stealth Mode

In some cases you may wish to suppress the logging output of Drakov. To do so, run is with the `--stealthmode` options.

`drakov -f "../com/foo/contracts/*.md" --stealthmode`


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
        stealthmode: true
    };
    
    drakov.run(argv);

## FAQ

**Q:** If I have multiple requests/responses on the same API endpoint, which response will I get?

**A:** Drakov will respond with the first response matching the request body for that API endpoint.


**Q:** If I have multiple responses on a single request, which response will I get?

**A:** Drakov will respond with the first response.


**Q:** Drakov is too loud (outputting too much logging), can I turn off request and API responses?

**A:** You can suppress all but the startup output of Drakov with `--stealthmode`.



## CONTRIBUTORS

Yakov Khalinsky <ykhalinsky@aconex.com>

Marcelo Garcia de Oliveira <moliveira@aconex.com>

*Huge thanks to Eva Mansk for the funky logo!*
