require('colors');

var stealthMode = false;

exports.setStealthMode = function(isStealthMode) {
    stealthMode = isStealthMode;
};

exports.log = function() {
    if (stealthMode) {
        return;
    }
    // eslint-disable-next-line no-console
    console.log(Array.prototype.slice.call(arguments).join(' '));
};

exports.error = function() {
    if (stealthMode) {
        return;
    }
    // eslint-disable-next-line no-console
    console.error('[ERROR]'.red, Array.prototype.slice.call(arguments).join(' '));
};

exports.stringfy = function(matched) {
  return matched ? 'MATCHED'.green : 'NOT_MATCHED'.red;
};
