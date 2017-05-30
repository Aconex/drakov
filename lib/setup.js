var fs = require('fs');
var http = require('http');
var https = require('https');
var httpShutdown = require('http-shutdown');

var version = require('../package.json').version;

exports.isSSL = false;

exports.startServer = function (argv, app, cb) {

    var server = null;

    var startCb = function() {
        console.log(('   Drakov ' + version + '     ').bold.inverse, 'Listening on port ' + argv.serverPort.toString().bold.red);
        if (argv.stealthmode) {
            console.log('   STEALTH MODE     '.grey.bold.inverse, 'running silently'.grey);
        }

        if (argv.public) {
            console.log('   PUBLIC MODE     '.grey.bold.inverse, 'running publicly'.grey);
        }

        if (cb) {
          cb();
        }
    };

    if (argv.sslKeyFile && argv.sslCrtFile) {
        exports.isSSL = true;
        var sslOptions = {
            key: fs.readFileSync(argv.sslKeyFile, 'utf8' ),
            cert: fs.readFileSync(argv.sslCrtFile, 'utf8' ),
            rejectUnauthorized: false
        };
        server = https.createServer(sslOptions, app);
    } else {
        //server = app;
        server = http.createServer(app);
    }
    
    server = httpShutdown(server);


    if (argv.public) {
        return server.listen(argv.serverPort, startCb);
    }
    return server.listen(argv.serverPort, 'localhost', startCb);

};
