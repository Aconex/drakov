module.exports = function(done) {
    return function(err, res){
        if (err) {
            return done(err);
        }
        done();
    };
};
