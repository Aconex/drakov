function match(regex, contentType) {
    return contentType ? regex.test(contentType) : false;
}

exports.isJson = function(contentType) {
    return match(/json/i, contentType);
};

exports.isMultipart = function(contentType) {
    return match(/multipart\/form-data/i, contentType);
};

exports.isFormUrlEncoded = function(contentType) {
    return match(/application\/x-www-form-urlencoded/i, contentType);
};
