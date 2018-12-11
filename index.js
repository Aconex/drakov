var drakov = require('./build/src/drakov');

module.exports = {
    run: drakov.run,
    stop: drakov.stop,
    middleware: require('./build/middleware')
};
