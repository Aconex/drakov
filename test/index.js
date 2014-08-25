// Would normally do a `require('drakov') in your project
var drakov = require('../lib/drakov');

var argv = {
    sourceFiles: 'example/md/**.md',
    serverPort: 1337,
    staticPaths: 'example/static'
};

drakov.run(argv, function() {
    console.log('Completed Meming All The Things!');
});
