# Drakov API Blueprint Mock Server

Mock server that implements the [API Blueprint](http://apiblueprint.org/) specification:


## Note on Dependencies

You will need to have `g++` and `make` installed on your system so `npm install` can compile the [Snow Crash](https://github.com/apiaryio/snowcrash) library.


## Installation instructions

1. Do an `npm install`
2. Make drakov executable `chmod +x drakov`

**NOTE:** Ensure that drakov is executable file by following step 2 above


## Running

`./drakov -f <glob expression to your md files> -s <comma delimited list of static file paths> -p <server port>`


**Argument Notes:**

- Glob expression is required
- If a list of static file paths are provided, then Drakov will proxy the static files
- Server port is optional and defaults to **3000**


**Examples**

With only a glob expression

`./drakov -f ../com/foo/contracts/*.md`


With glob expression and single static path

`./drakov -f ../com/foo/contracts/*.md -s ../path/to/static/files`
                                                                  

With glob expression and multiple static paths (must be comma delimited with no spaces)

`./drakov -f ../com/foo/contracts/*.md -s ../path/to/static/files,../second/path/to/static/files`


With glob expression and specified server port

`./drakov -f ../com/foo/contracts/*.md -p 4007`



## FAQ

**Q:** If I have multiple requests/responses on the same API endpoint, which response will I get?

**A:** Drakov will respond with the first response matching the request body for that API endpoint.


**Q:** If I have multiple responses on a single request, which response will I get?

**A:** Drakov will respond with the first response.