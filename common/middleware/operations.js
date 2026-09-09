var hat = require('hat');
var crypto = require('crypto');

var operations = function () {

};

operations.siteroles = {
    manager:0,
    superviser:1,
    user:2
}

operations.replace = function (str, obj) {

    var formatted = '';
    var keys = Object.keys(obj);

    for (var i = 0; i < keys.length; i++) {
        var regexp = new RegExp('\\{' + keys[i] + '\\}', 'gi');
        str = str.replace(regexp, obj[keys[i]]);
    }
    return str;
};

operations.unique = function (len) {
    return hat();
};

operations.random = function (length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
};

operations.decoder = function (key1, key2) {

        key2 = (key2 != null) ? key2.toString() : ' ';
        key1 = (key1 != null) ? key1.toString() : ' ';
        if (key2.length > key1.length) {
            var temp = key1;
            key1 = key2;
            key2 = temp;
        }

        var result = '';
        var charCode = 0;
        for (var i = 0; i < key1.length; i++) {
            charCode = key1[i].charCodeAt(0) ^ key2[i % key2.length].charCodeAt(0);

            charCode = charCode % 127;
            if(charCode < 33){
                charCode += 33;
            }

            result += String.fromCharCode(charCode);
        }

        return result;
};

module.exports = operations;