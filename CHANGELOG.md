### [0.1.5] May 7, 2015

#### Changes

* Updated version of Protaganist so Drakov can build on 0.12 of node.js [link](https://github.com/Aconex/drakov/pull/52)
* Updated dependencies

#### Thanks

A quick thank you to all the people in the community who contributed code to this release!

* Rostislav https://github.com/galkinrost


### [0.1.4] April 27, 2015

#### Changes

* Added support for JSON schema for request/response pair matching [link](https://github.com/Aconex/drakov/pull/50)


### [0.1.3] April 8, 2015

#### Fixes

* Dredd fails because of setting encoding  [link](https://github.com/Aconex/drakov/issues/44)
* Fix body content comparison [link](https://github.com/Aconex/drakov/issues/49)


### [0.1.2] February 27, 2015

#### Fixes

* Fix stop() killing Drakov when called before start()
* Add unit tests to main Drakov module


### [0.1.1] February 19, 2015

#### Changes

* Support for x-www--form-urlencoded content type [link](https://github.com/Aconex/drakov/pull/34)
* Support for request/responses based on query parameters [link](https://github.com/Aconex/drakov/issues/11)


#### Fixes

* Fix to guarantee only one route handler executes
* Fix to bring back route setup logging


#### Thanks

A quick thank you to all the people in the community who contributed code to this release!

* Mohit Suman https://github.com/mohitjee15


### [0.1.0] February 11, 2015

#### Changes

* Can use Drakov as express middleware
* Compare headers in the request to find the right response
* CORS header support
* Support for deliberate response delay


#### Fixes

* Query string breaking express route URL
* Bad behaviour with GET and Content-Type header
* Handle undefined callback in setup module
* Missed callback passed to queued function calls sent to async


#### Thanks

A quick thank you to all the people in the community who contributed code to this release!

* Rostislav https://github.com/galkinrost
* Pedro Teixeira https://github.com/pedro-teixeira
* Stephen Kawaguchi https://github.com/skawaguchi
* Jakub Jelen https://github.com/fastman
* Egor Voronov https://github.com/egorvoronov
