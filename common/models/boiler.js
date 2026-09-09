'use strict';

module.exports = function (Boiler) {

    var app = require('../../server/server');
    var ops = require('../middleware/operations.js');
    var LoopBackContext = require('loopback-context');

    Boiler.disableRemoteMethodByName('deleteById', false);

    Boiler.beforeRemote('replaceOrCreate', function (context, boiler, next) {
        if (Object.keys(context.req.body).length === 0) {
            invalid();
            return;
        }

        let paramID = context.req.query.id;
        let userID = context.req.accessToken.userId;
        let siteID = context.req.body.siteId;
        if (!paramID || !siteID) {
            invalid();
            return;
        }

        var userRole = 0;
        app.models.User.find({ where: { id: userID } }, function (err, user) {
            if (user.length > 0) {
                user[0].roles(function (err, roles) {
                    if (roles.length > 0) {
                        if (roles[0].name == 'pkAdmin' || roles[0].name == 'pkTech') {
                            userRole = 1;
                        }
                    }
                    app.models.UserToSite.find({ where: { siteId: siteID, userId: userID } }).then(function (record) {
                        if (record.length > 0 || userRole == 1) {
                            Boiler.find({ where: { id: paramID } }, function (err, result) {
                                if (result.length > 0) {
                                    context.req.body.isDeleted = result[0].isDeleted;
                                    context.req.body.lastUpdated = result[0].lastUpdated;
                                    context.req.body.status = result[0].status;
                                    context.req.body.id = paramID;
                                    context.req.body.isPaid = result[0].isPaid;
                                    context.req.body.uniqueKey = result[0].uniqueKey;
                                    context.req.body.model = result[0].model;
                                    context.req.body.nuroSN = result[0].nuroSN;
                                    context.req.body.solaSN = result[0].solaSN;
                                    context.req.body.software = result[0].software;
                                    context.req.body.version = result[0].version;
                                    next();
                                } else {
                                    invalid();
                                }
                            });
                        } else {
                            failure();
                        }
                    });


                });
            } else {
                failure();
            }
        });


        function failure() {
            let error = { success: false, message: "Unauthorized Access. Please check the account." };
            context.res.status(401).send(error);
        }


        function invalid() {
            let error = { success: false, message: "Invalid Data." };
            context.res.status(400).send(error);
        }


    });

    Boiler.afterRemote('findById', function (context, boiler, next) {
        let boilerID = context.args.id;
        let userID = context.req.accessToken.userId;
        if (!boiler) {
            next();
            return;
        }
        var siteID = boiler.siteId;
        function failure() {
            let error = { success: false, message: "Unauthorized Access. Please check the account." };
            context.res.status(401).send(error);
        }
        var userRole = 0;
        app.models.User.find({ where: { id: userID } }, function (err, user) {
            if (user.length > 0) {
                user[0].roles(function (err, roles) {
                    if (roles.length > 0) {
                        if (roles[0].name == 'pkAdmin' || roles[0].name == 'pkTech') {
                            userRole = 1;
                        }
                    }
                    app.models.UserToSite.find({ where: { siteId: siteID, userId: userID } }).then(function (record) {
                        if (record.length > 0 || userRole == 1) {
                            next();
                        } else {
                            failure();
                        }
                    });

                });
            } else {
                failure();
            }

        });
  
    });

    Boiler.remoteMethod(
        'newBoiler',
        {
            http: { path: '/newBoiler', verb: 'post' },
            accepts: [
                { arg: 'signature', type: 'string', http: { source: 'header' } },
                {
                    arg: 'boiler', type: 'object', http: { source: 'body' },
                    default: {
                        "version": "1.0.0",
                        "date": "123456789",
                        "nuro": "AA:BB:CC:DD:EE:FF",
                        "sola": "abcdefg"
                    }
                },
                { arg: 'req', type: 'object', http: { source: 'req' } },
                { arg: 'res', type: 'object', http: { source: 'res' } }
            ],
            returns: {
                arg: 'response',
                type: 'string',
                default: {
                    "version": "1.0.0",
                    "uniqueKey": "xyz1234",
                    "code": "123456"
                }
            }
        });

    Boiler.remoteMethod(
        'exist',
        {
            http: { path: '/:signUpCode/boiler', verb: 'get' },
            accepts: [
                { arg: 'signUpCode', type: 'string' },
                { arg: 'req', type: 'object', 'http': { source: 'req' } },
                { arg: 'res', type: 'object', 'http': { source: 'res' } }
            ],
            returns: {
                arg: 'response', type: 'object',
                default: {
                    status: true,
                    boilerId: "1234567890"
                }
            }
        });

    Boiler.remoteMethod(
        'findUpdate',
        {
            http: { path: '/:signUpCode/:boilerID/boiler', verb: 'get' },
            accepts: [
                { arg: 'signUpCode', type: 'string' },
                { arg: 'boilerID', type: 'string' },
                { arg: 'req', type: 'object', 'http': { source: 'req' } },
                { arg: 'res', type: 'object', 'http': { source: 'res' } }
            ],
            returns: {
                arg: 'response', type: 'object',
                default: {
                    status: true,
                    boilerId: "1234567890"
                }
            }
        });

    Boiler.remoteMethod(
        'records',
        {
            description: "Use this method to fetch the records by filter.",
            http: { path: '/:boilerId/records', verb: 'get' },
            accepts: [
                { arg: 'boilerId', type: 'string' },
                { arg: 'filter', type: 'object', 'http': { source: 'query' } },
                { arg: 'req', type: 'object', http: { source: 'req' } },
                { arg: 'res', type: 'object', http: { source: 'res' } }
            ],
            returns: {
                arg: 'response',
                type: 'array',
                root: true,
                default: [
                    {
                        "receivedDate": "2017-02-12",
                        "receivedData": {},
                        "id": "string",
                        "boilerId": "string"
                    }
                ]
            }
        });

    Boiler.remoteMethod(
        'fuelUsage',
        {
            description: "Use this method to fetch the records by filter.",
            http: { path: '/:boilerId/fuelUsage', verb: 'get' },
            accepts: [
                { arg: 'boilerId', type: 'string' },
                { arg: 'filter', type: 'object', 'http': { source: 'query' } },
                { arg: 'req', type: 'object', http: { source: 'req' } },
                { arg: 'res', type: 'object', http: { source: 'res' } }
            ],
            returns: {
                arg: 'response',
                type: 'array',
                root: true,
                default: [
                    {
                        "receivedDate": "2017-02-12",
                        "receivedData": {},
                        "id": "string",
                        "boilerId": "string"
                    }
                ]
            }
        });

    Boiler.newBoiler = function (signature, boiler, req, res, cb) {

        if (!signature || !boiler.date || !boiler.nuro) {
            cb({ success: false, error: 'Unknown error occurred.' }, null);
            return;
        }

        //Validate signature: date xor nuro serial xor HIPK
        var generated = ops.decoder(ops.decoder(boiler.date, boiler.nuro), 'HIPK');

        if (signature != generated) {
            console.log('Received invalid signature for boiler' + boiler.nuro);
            cb({ success: false, error: 'Unknown error occurred.' }, null);
            return;
        }

        function isUniqueCode(uCode) {
            Boiler.find({ where: { signUpCode: uCode } }, function (err, result) {
                if (result.length != 0) {
                    signUpCode = ops.random(6);
                    isUniqueCode(signUpCode);
                }
            });
        }

        var signUpCode = ops.random(6);
        isUniqueCode(signUpCode);

        function isUniqueKey(uKey) {
            Boiler.find({ where: { uniqueKey: uKey } }, function (err, result) {
                if (result.length != 0) {
                    uniqueKey = ops.random(10);
                    isUniqueKey(uniqueKey);
                }
            });
        }

        var uniqueKey = ops.random(10);
        isUniqueKey(uniqueKey);

        var codeGeneratedDate = new Date();

        var data = {
            'version': boiler.version,
            'newBoilerDate': boiler.date,
            'signature': signature,
            'nuroSN': boiler.nuro,
            'solaSN': boiler.sola,
            'signUpCode': signUpCode,
            'codeGeneratedDate': codeGeneratedDate,
            'name': boiler.nuro,
            'uniqueKey': uniqueKey,
            'isPaid': true
        };

        Boiler.find({ where: { nuroSN: boiler.nuro } }).then(function (boilers) {
            if (boilers.length == 0) {
                Boiler.create(data).then(function (result) {
                    var output = {
                        "version": result.version,
                        'uniqueKey': result.uniqueKey,
                        "code": result.signUpCode
                    };

                    res.status(200).send(output);
                    return;
                })
            }
            else {
                boilers[0].updateAttributes({
                    uniqueKey: uniqueKey,
                    signUpCode: signUpCode,
                    codeGeneratedDate: codeGeneratedDate
                });
                var output = {
                    "version": boilers[0].version,
                    'uniqueKey': uniqueKey,
                    "code": signUpCode
                };

                res.status(200).send(output);
            }
        }).catch(function (err) {
            if (err) {
                cb({ "success": false }, null);
            }
        });
    };

    Boiler.exist = function (signUpCode, req, res, cb) {

        signUpCode = signUpCode.toLowerCase();

        Boiler.find({ where: { "signUpCode": signUpCode } }, function (err, result) {
            if (err || result.length != 1) {
                var obj = {
                    "status": false
                };

                res.status(200).send(obj);
                return;
            }

            var genDate = new Date(result[0].codeGeneratedDate);
            var ONE_DAY = 24 * 60 * 60 * 1000;
            /* ms */

            if (((new Date) - genDate) > ONE_DAY) {
                obj = {
                    "status": false
                };

                res.status(200).send(obj);
                return;
            } else {
                const boilerData = result[0].toJSON();
                obj = {
                    data: boilerData,
                    status: true
                }

                res.status(200).send(obj);
            }
            return;
        })
    };


    Boiler.findUpdate = function (signUpCode, boilerID, req, resServer, cb) {

        signUpCode = signUpCode.toLowerCase();
        var obj = {
            "status": false
        };

        Boiler.findById(boilerID, function (err, res) {
            if (res) {
                obj.status = true
                res.signUpCode = signUpCode;

                return res.save(function (err, boilerSaved) {
                    resServer.status(200).send(obj);
                    return;
                })

            } else {
                resServer.status(200).send(obj);
                return;
            }

        });

    };


    Boiler.records = function (boilerId, filter, req, res, cb) {

        app.models.BoilerReadRecord.getDataSource().connector.connect((err, db) => {

            //var boilerId = "2c743933-4136-44bd-bae2-1e3a54021430";
            //TODO: check if the boiler belongs to the site the user has access to

            filter = filter || {};
            var receivedDate = (((filter || {}).where || {}).receivedDate || {});
            var toDate = new Date(receivedDate.lt) || new Date();
            var fromDate = new Date(receivedDate.gte) || new Date(new Date().setHours(toDate.getHours() - 1));
            var interval = filter.interval || 15;

            /*
            // this is old non-working code
            if (filter.interval >= 720) {
                var cursor = db.collection('BoilerReadYearlyRecord').find({
                    boilerId: boilerId,
                    receivedDate: {$gte: fromDate, $lt: toDate}
                })
            }
            else {
            */
            var cursor = db.collection('BoilerReadRecord').aggregate([
                {
                    $match: {
                        boilerId: boilerId,
                        receivedDate: { $gte: fromDate, $lt: toDate }
                    }
                },
                {
                    $group: {
                        "_id": {
                            "$add": [
                                {
                                    "$subtract": [
                                        { "$subtract": ["$receivedDate", new Date(0)] },
                                        {
                                            "$mod": [
                                                { "$subtract": ["$receivedDate", new Date(0)] },
                                                1000 * 60 * interval
                                            ]
                                        }
                                    ]
                                },
                                new Date(0)
                            ]
                        },
                        _rid: { $first: "$_id" },
                        _data: { $first: "$receivedData.data" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: -1 } },
                {
                    $project: {
                        _id: "$_rid",
                        receivedDate: "$_id",
                        receivedData: { data: "$_data" }
                    }
                }
            ]);
            // this is old non-working code (remove if)
            // }

            cursor.toArray(function (err, results) {
                //  db.close();
                res.status(200).send(results);
            });
        });
    };

    Boiler.fuelUsage = function (boilerId, filter, req, res, cb) {

        app.models.BoilerReadRecord.getDataSource().connector.connect((err, db) => {

            //var boilerId = "2c743933-4136-44bd-bae2-1e3a54021430";
            //TODO: check if the boiler belongs to the site the user has access to

            filter = filter || {};
            var receivedDate = (((filter || {}).where || {}).receivedDate || {});
            var toDate = new Date(receivedDate.lt) || new Date();
            var fromDate = new Date(receivedDate.gte) || new Date(new Date().setHours(toDate.getHours() - 1));
            var interval = filter.interval || 15;

            var cursor = db.collection('BoilerReadRecord').aggregate([
                {
                    $match: {
                        boilerId: boilerId,
                        receivedDate: { $gte: fromDate, $lt: toDate }
                    }
                },
                { $unwind: "$receivedData" },
                {
                    $group: {
                        "_id": null,
                        "_fuel": { $sum: "$receivedData.data.fuel" }
                    }
                },
                { $sort: { _id: -1 } },
                {
                    $project: {
                        _id: "$_id",
                        fuelusage: "$_fuel"
                    }
                }
            ]);

            cursor.toArray(function (err, results) {
                // db.close();
                res.status(200).send(results);
            });
        });
    };
};
