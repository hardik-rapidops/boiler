'use strict';

module.exports = function(Errorcode) {

    Errorcode.remoteMethod(
        'deleteAll',
        {
            description: "Private method, don't call this method.",
            http: {path: '/all', verb: 'delete'},
            returns: {
                arg: 'response', type: 'object',
                default: {"success": true}
            }
        });

    Errorcode.deleteAll = function (cb) {
        Errorcode.destroyAll(function (err, result) {
            cb(null, {success: true});
        })
    };

    Errorcode.remoteMethod(
        'deleteMany',
        {
            description: "Private method, don't call this method.",
            http: {path: '/brandEC', verb: 'delete'},
            accepts: [
                {
                    arg: 'brand',
                    type: 'string'
                }
            ],
            returns: {
                arg: 'response', type: 'object',
                default: {"success": true}
            }
        });

    Errorcode.deleteMany = function (brand, cb) {
        var brandValue = brand ? brand : "0";
        Errorcode.remove({"brand": brandValue}, function (err, result) {
            cb(null, {success: true});
        })
    };

    Errorcode.remoteMethod(
        'findByBrand',
        {
            description: "Private method, don't call this method.",
            http: {path: '/findByBrand', verb: 'get'},
            accepts: [
                {
                    arg: 'brand',
                    type: 'string'
                },
                { arg: 'req', type: 'object', http: { source: 'req' } },
                { arg: 'res', type: 'object', http: { source: 'res' } }
            ],
            returns: {
                arg: 'response',
                type: 'array',
                root: true
            }
        });

    Errorcode.findByBrand = function (brand, req, res, cb) {
        var query;
        // if(brand) {
        //     query = {
        //         where: {
        //             brand: brand
        //         }
        //     }
        // } else {
        //     query = {
        //         where: {
        //             "brand": { "$exists": false }
        //         }
        //     }
        // }
        var brandValue = brand ? brand : "0";
        query = {
            where: {
                brand: brandValue
            }
        }
        Errorcode.find(query, function (err, result) {
            res.status(200).send(result);
        })
    };
    
};
