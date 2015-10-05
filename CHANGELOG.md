### [0.1.13] July 21, 2015

#### Changes

* Remove json schema support for application/x-www-form-urlencoded [link](https://github.com/Aconex/drakov/pull/86)
* Changed query params handling to accept query params matching [link](https://github.com/Aconex/drakov/pull/87)
* FAQ Update: reference example how to request specific response [link](https://github.com/Aconex/drakov/pull/90)

#### Fixes

* Use an absolute path for views [link](https://github.com/Aconex/drakov/pull/92)

#### Thanks

A quick thank you to all the people in the community who contributed code to this release!

* Marcelo https://github.com/marcelogo
* Yohan Robert https://github.com/groyoh
* James Kruth https://github.com/artlogic


### [0.1.12] August 27, 2015

#### Changes

* Add support for Attributes [link](https://github.com/Aconex/drakov/pull/84)

#### Thanks

A quick thank you to all the people in the community who contributed code to this release!

* Peleg Rosenthal https://github.com/PelegR


### [0.1.11] July 21, 2015

#### Changes

* Add support for matching form-urlencoded http request body with schema mentioned in spec [link](https://github.com/Aconex/drakov/pull/76)
* API discoverability [link](https://github.com/Aconex/drakov/pull/74)

#### Fixes

* Fix some typos in README [link](https://github.com/Aconex/drakov/pull/77)

#### Thanks

A quick thank you to all the people in the community who contributed code to this release!

* Ilya Baryshev https://github.com/coagulant
* Subin Varghese https://github.com/subinvarghesein
* Marek Stasikowski https://github.com/kosmotaur


### [0.1.10] July 21, 2015

#### Fixes

* Refactor code using substack pattern [link](https://github.com/Aconex/drakov/pull/73)

#### Thanks

A quick thank you to all the people in the community who contributed code to this release!

* Marek Stasikowski https://github.com/kosmotaur


### [0.1.9] July 21, 2015

#### Changes

* Add support for loading configuration from a file [link](https://github.com/Aconex/drakov/pull/71)


### [0.1.8] July 2, 2015

#### Changes

* Support preflight response on OPTIONS for routes [link](https://github.com/Aconex/drakov/pull/59)
* Add support for Prefer header to coerce response by status [link](https://github.com/Aconex/drakov/pull/61)

#### Fixes

* Fix export of middleware when using Drakov as a node module dependencies in another project

#### Thanks

A quick thank you to all the people in the community who contributed code to this release!

* Martin Nuc https://github.com/MartinNuc
* Simon Adcock https://github.com/SiCurious


### [0.1.6 - 0.1.7] ~June 2, 2015

#### Changes

* Adding flag to allow users to open the drakov server to external host [link](https://github.com/Aconex/drakov/pull/55)
* Add support for multi-part [link](https://github.com/Aconex/drakov/pull/56)

#### Thanks

A quick thank you to all the people in the community who contributed code to this release!

* Jeffrey Hann https://github.com/obihann
* Subin Varghese https://github.com/subinvarghesein


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
