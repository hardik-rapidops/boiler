'use strict';

var operations = require('../middleware/operations.js');
var thirdParty = require('../middleware/thirdparty-apis');

module.exports = function(Weather) {

    Weather.remoteMethod(
        'zip',
        {
            description: "Use this method to fetch the weather by zip code.",
            http: {path: '/zip/:id', verb: 'get'},
            accepts: [
                {arg: 'id', type: 'string'},
                {arg: 'req', type: 'object', 'http': {source: 'req'}},
                {arg: 'res', type: 'object', 'http': {source: 'res'}}
            ],
            returns: [
                {arg: 'body', type: 'object', root: true}
            ],
            default: {"success": true}
        });

    Weather.zip = function (zip, req, res, cb) {

        /**
         * openwhether credentials
         * @type {{appid: string, zip: *}}

            var apiKey = '59a6b03e800108d329354668804d9001';
            var obj = {
                appid: apiKey,
                zip: zip,
            };
         **
         */

        /**
         * APIXU credentials
         */
            var apiKey = '10fc6f73e02440829e0105722172704';
            var obj = {
                key: apiKey,
                q: zip
            };

        var url = operations.replace(thirdParty.APIs.apiXUWhetherApi.host, obj);

        function failure() {
            var error = {success: false, message: "Unable to get the weather report"};
            cb({success: false}, null);
        }

        thirdParty.get(url, function (data,error) {
           
            try {
                data = JSON.parse(data);
                var tempF = 0;
            if(!data.error) {
                 tempF = data.current.temp_f || 0;
             }
            cb(null, {temp:tempF});
            }
            catch(e) {
                cb(null, {temp:0});
            }

            

        }, failure);

    };
};
