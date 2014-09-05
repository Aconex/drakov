require('colors');

var stealthMode = false;

exports.setStealthMode = function(isStealthMode) {
    stealthMode = isStealthMode;
};

exports.log = function(logArguments) {
    if (stealthMode) {
        return;
    }
    console.log(logArguments);
};