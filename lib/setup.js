var fs = require('fs');
var https = require('https');

var version = require('../package.json').version;

exports.isSSL = false;

exports.startServer = function (argv, app, cb) {

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

        if (argv.public === true) {
            return https.createServer(sslOptions, app).listen(argv.serverPort, startCb);
        } else {
            return https.createServer(sslOptions, app).listen(argv.serverPort, 'localhost', startCb);
        }
    } else {
        if (argv.public === true) {
            return app.listen(argv.serverPort, startCb);
        } else {
            return app.listen(argv.serverPort, 'localhost', startCb);
        }
    }

};
