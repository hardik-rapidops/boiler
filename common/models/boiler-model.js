'use strict';

module.exports = function(Boilermodel) {

    Boilermodel.remoteMethod(
        'deleteAll',
        {
            description: "Private method, don't call this method.",
            http: {path: '/all', verb: 'delete'},
            returns: {
                arg: 'response', type: 'object',
                default: {"success": true}
            }
        });

    Boilermodel.deleteAll = function (cb) {
        Boilermodel.destroyAll(function (err, result) {
            cb(null, {success: true});
        })
    };

    Boilermodel.remoteMethod(
        'deleteMany',
        {
            description: "Private method, don't call this method.",
            http: {path: '/brandBM', verb: 'delete'},
            accepts: [
                {
                    arg: 'brand',
                    type: 'string',
                    http: { source: 'query' }
                }
            ],
            returns: {
                arg: 'response', type: 'object',
                default: {"success": true}
            }
        });

    Boilermodel.deleteMany = function (brand, cb) {
        var brandValue = brand ? brand : "0";
        console.log('brandValue',brandValue);
        Boilermodel.remove({"brand": brandValue}, function (err, result) {
            cb(null, {success: true});
        })
    };


    Boilermodel.remoteMethod(
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

    Boilermodel.findByBrand = function (brand, req, res, cb) {
        // let query = {
        //     where: {
        //         brand: brand
        //     }
        // };;
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
        Boilermodel.find(query, function (err, result) {
            // cb(null, {success: true});
            res.status(200).send(result);
        })
    };

};
