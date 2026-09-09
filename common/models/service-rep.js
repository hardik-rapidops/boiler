'use strict';

module.exports = function(ServiceRep) {

    var app = require('../../server/server');

    ServiceRep.remoteMethod(
        'zip',
        {
            description: "Use this method to fetch the service rep by zip code.",
            http:{path: '/zip/:id', verb: 'get'},
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

    ServiceRep.zip = function (zip, req, res, cb) {

        var ZipCodes = app.models.ZipCodes;
        var Counties = app.models.Counties;

        var _default = {
            Contact: "Contact: Patterson-Kelley",
            OfficeName: "Harsco Industrial Patterson-Kelley",
            Email: "pkboilersales@harsco.com",
            Phone: "(570) 476-7261",
            Fax: "(570) 476-7261"
        };

        if(zip == '0') {
            cb(null, _default);
            return;
        }

        ZipCodes.find({where: {"zip": zip}})
            .then(function (rec) {

                if(!rec || rec.length === 0) {
                    return;
                }

                var countyI = new RegExp('.*'+rec[0].county+'.*', "i"); /* case-insensitive RegExp search */
                var stateI = new RegExp('.*'+rec[0].state+'.*', "i"); /* case-insensitive RegExp search */

                return Counties.find({where: {'county':{ like: countyI} , 'state': { like: stateI}}});
            })
            .then(function (rec) {

                if(!rec || rec.length === 0) {
                    return;
                }

                var repno = rec[0].both;
                repno = repno ? repno : rec[0].boiler;
                return ServiceRep.find({where: {'RepNumber': repno}});
            })
            .then(function (rec) {
                if (!rec || rec.length === 0) {
                    cb(null, _default);

                    return;
                }

                cb(null, rec[0]);
            })
            .catch(function (err) {
                console.log(err);

                cb(null, _default);
            });
    };
};
