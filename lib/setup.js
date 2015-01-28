var fs = require('fs');
var https = require('https');

var version = require('../package.json').version;

exports.isSSL = false;

exports.startServer = function (argv, app, cb) {

    var startCb = function() {
        console.log('\n', ('  Drakov  ' + version + '  ').bold.inverse, 'server listening on port ' + argv.serverPort.toString().bold.red);
        if (argv.stealthmode) {
            console.log('\n', '   STEALTH MODE   '.grey.bold.inverse, 'running silently'.grey, '\n');
        }
        cb();
    };

    if (argv.sslKeyFile && argv.sslCrtFile) {
        exports.isSSL = true;
        var sslOptions = {
            key: fs.readFileSync(argv.sslKeyFile, 'utf8' ),
            cert: fs.readFileSync(argv.sslCrtFile, 'utf8' ),
            rejectUnauthorized: false
        };
        return https.createServer(sslOptions, app).listen(argv.serverPort, startCb);
    } else {
        return app.listen(argv.serverPort, startCb);
    }

};