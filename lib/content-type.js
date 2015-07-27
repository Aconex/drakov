var ContentTypeChecker = function(contentType) {
    function match(regex, contentType) {
        return contentType ? regex.test(contentType) : false;
    }

    return {
        isJson: function() {
            return match(/json/i, contentType);
        },
        isMultipart: function() {
            return match(/multipart\/form-data/i, contentType);
        },
        isFormUrlEncoded: function() {
            return match(/application\/x-www-form-urlencoded/i, contentType);
        }
    }
};

module.exports = ContentTypeChecker;
