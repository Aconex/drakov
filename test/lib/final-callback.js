module.exports = function(done) {
    return function(err){
        if (err) {
            return done(err);
        }
        done();
    };
};
