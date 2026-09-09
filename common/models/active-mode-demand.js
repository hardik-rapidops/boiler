'use strict';

module.exports = function (ActiveModeDemand) {

    ActiveModeDemand.remoteMethod(
        'deleteAll',
        {
            description: "Private method, don't call this method.",
            http: {path: '/all', verb: 'delete'},
            returns: {
                arg: 'response', type: 'object',
                default: {"success": true}
            }
        });

    ActiveModeDemand.deleteAll = function (cb) {
        ActiveModeDemand.destroyAll(function (err, result) {
            cb(null, {success: true});
        })
    };


    ActiveModeDemand.remoteMethod(
        'deleteMany',
        {
            description: "Private method, don't call this method.",
            http: {path: '/brandAMD', verb: 'delete'},
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

    ActiveModeDemand.deleteMany = function (brand, cb) {
        // var query;
        var brandValue = brand ? brand : "0";
        // if(brand) {
        //     query = {
        //         "brand": brand
        //     }
        // } else {
        //     query = {
        //         "brand": { "$exists": false }
        //     }
        // }
        ActiveModeDemand.remove({"brand": brandValue}, function (err, result) {
            cb(null, {success: true});
        })
    };

    ActiveModeDemand.remoteMethod(
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

    ActiveModeDemand.findByBrand = function (brand, req, res, cb) {
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
        ActiveModeDemand.find(query, function (err, result) {
            res.status(200).send(result);
        })
    };
};
