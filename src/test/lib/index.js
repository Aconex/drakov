const supertest = require('supertest');

module.exports = {
    endCb: require('./final-callback'),
    drakov: require('./drakov-runner'),
    getRequest: function(isSSL) {
        var url = (isSSL ? 'https' : 'http') + '://localhost:' + require('./port');
        return supertest(url);
    }
};
