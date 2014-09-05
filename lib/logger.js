require('colors');

var stealthMode = false;

exports.setStealthMode = function(isStealthMode) {
    stealthMode = isStealthMode;
};

exports.log = function() {
    if (stealthMode) {
        return;
    }
    console.log(Array.prototype.slice.call(arguments).join(' '));
};