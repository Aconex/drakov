var restify = require('restify');
var drakovMiddleware = require('../index.js').middleware;

var app = restify.createServer();
app.pre(restify.bodyParser());  // need to have a body parser for the middleware to work

drakovOptions  = {
    sourceFiles: '../test/example/**/*.md'
};

// currently need to initialise the middleware asynchronously due to protagonist parse in async
drakovMiddleware.init(app, drakovOptions, function(err, middlewareFunction) {
    if (err) {
        throw err;
    }
    app.pre(middlewareFunction);
    app.listen(8000, function() {
        console.log('server started with Drakov middleware on Restify');
    });
});
