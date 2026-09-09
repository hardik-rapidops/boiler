'use strict';

module.exports = function (Boilerstate) {

    Boilerstate.remoteMethod(
        'deleteAll',
        {
            description: "Private method, don't call this method.",
            http: {path: '/all', verb: 'delete'},
            returns: {
                arg: 'response', type: 'object',
                default: {"success": true}
            }
        });

    Boilerstate.deleteAll = function (cb) {
        Boilerstate.destroyAll(function (err, result) {
            cb(null, {success: true});
        })
    };

    Boilerstate.remoteMethod(
        'deleteMany',
        {
            description: "Private method, don't call this method.",
            http: {path: '/brandBS', verb: 'delete'},
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

    Boilerstate.deleteMany = function (brand, cb) {
        var brandValue = brand ? brand : "0";
        Boilerstate.remove({"brand": brandValue}, function (err, result) {
            cb(null, {success: true});
        })
    };

    Boilerstate.remoteMethod(
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

    Boilerstate.findByBrand = function (brand, req, res, cb) {
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
        Boilerstate.find(query, function (err, result) {
            res.status(200).send(result);
        })
    };
};
