var drakov = require('../index.js');
// you would use the following line for require Drakov properly in your own app
// var drakov = require('drakov');

var drakovOptions  = {
    sourceFiles: '../test/example/**/*.md',
    serverPort: 3000
};


drakov.run(drakovOptions, function(err){
    if (err) {
        throw err;
        console.log('-- STARTED --');
    }
    drakov.stop(function(err) {
        if (err) {
            throw err;
        }
        console.log('-- STOPPED --');
    });
});
