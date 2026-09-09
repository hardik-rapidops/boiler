var https = require('https');
var http = require('http');

var thirdParty = {};

thirdParty.APIs = {

    captcha : {
        host:'https://www.google.com/recaptcha/api/siteverify?secret={secret}&response={response}'
    },
    weatherReport : {
        host:'http://api.openweathermap.org/data/2.5/weather?zip={zip}&APPID={appid}',

    },
    apiXUWhetherApi : {
        host: "http://api.apixu.com/v1/current.json?key={key}&q={q}"
    }
};

thirdParty.post = function(options, success, failure) {

    var httpModule = http;

    // if(url.indexOf('https')) {
    //     httpModule = https;
    // }

    var callback = function(response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            success(str);
        });
    };

    //TODO: hack we are using https for catpcha and http below, the variable was defined as http
    https.request(options, callback).end();//This is the data we are posting, it needs to be a string or a buffer

};

thirdParty.get = function(url, success, failure) {

    var httpModule = http;

    if(url.indexOf('https') != -1) {
        httpModule = https;
    }

    httpModule.get(url, function(response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('error', function () {
            failure();
        });

        response.on('end', function () {
            success(str);
        });
    });
};

module.exports = thirdParty;