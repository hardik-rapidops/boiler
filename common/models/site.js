'use strict';

module.exports = function(Site) {


    var app = require('../../server/server');
    const { ObjectID } = require('mongodb');

    Site.beforeRemote('find', function (context, site, next) {
        let userID = context.req.accessToken.userId;  
        if (context.args.filter){
            let siteID = (context.args.filter.where) ? context.args.filter.where.id : null;
            if(!siteID){
                next();
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
                        app.models.UserToSite.find({where: {siteId: siteID, userId: userID}}).then(function (record) {
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
           
        } else {
            next();
        }
        function failure() {
            let error = { success: false, message: "Unauthorized Access. Please check the account." };
            context.res.status(401).send(error);
        }
       
     
    });

    Site.beforeRemote('prototype.__destroyById__boilers', function (context, boiler, next) {
            let boilerID = context.req.params.fk;
            let siteID = context.req.params.id;
            let userID = context.req.accessToken.userId;  
            if (!siteID && !userID){
                next();
                return;
            }
            function failure() {
                let error = { success: false, message: "Unauthorized Access. Please check the account." };
                context.res.status(401).send(error);
            }

            app.models.UserToSite.find({where: {siteId: siteID, userId: userID}}).then(function (record) {
                if (record.length > 0) {
                    next();
                } else {
                   failure();
                }
           });
    

    });

    Site.remoteMethod(
        'getSites',
        {
            description: "Private method, don't call this method.",
            http: {path: '/:userId/getSites', verb: 'get'},
            accepts: [
                {
                    arg: 'userId',
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

        Site.getSites = function (userId, req, res, cb) {
            console.log("id::::", userId);
            app.models.UserToSite.getDataSource().connector.connect((err, db) => {
                
                var data = db.collection('UserToSite').aggregate([
                    {
                        $match: {
                            userId: ObjectID(userId)
                        }
                    },
                    {
                        $lookup: {
                            from: "Site",
                            localField: "siteId",
                            foreignField: "_id",
                            as: "siteData"
                        }
                    },
                    {
                        $unwind: "$siteData"
                    },
                    {
                        $lookup: {
                            from: "Boiler",
                            localField: "siteData._id",
                            foreignField: "siteId",
                            as: "boilerData",
                            pipeline: [
                                {
                                    $match: {
                                        isDeleted: false
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: "$boilerData"
                    },
                    {
                        $lookup: {
                            from: "BoilerReadRecord",
                            localField: "boilerData._id",
                            foreignField: "boilerId",
                            as: "boilerReadRecordData",
                            pipeline: [
                                {
                                    '$sort': {  'receivedDate': -1 }
                                },
                                { 
                                    $limit: 500
                                }
                             ]
                        }
                    },
                    {
                        $group: {
                            _id: "$boilerData._id",
                            name: {$first: "$boilerData.name"},
                            nuroSN : {$first: "$boilerData.nuroSN"},
                            solaSN : {$first: "$boilerData.solaSN"},
                            model : {$first: "$boilerData.model"},
                            alertsDisabled : {$first: "$boilerData.alertsDisabled"},
                            relayEnergizedAlert : {$first: "$boilerData.relayEnergizedAlert"},
                            holdErrorAlert : {$first: "$boilerData.holdErrorAlert"},
                            lockoutErrorAlert : {$first: "$boilerData.lockoutErrorAlert"},
                            alertInterval : {$first: "$boilerData.alertInterval"},
                            name : {$first: "$boilerData.name"},
                            isPaid : {$first: "$boilerData.isPaid"},
                            tempAlerts : {$first: "$boilerData.tempAlerts"},
                            siteId : {$first: "$boilerData.siteId"},
                            version : {$first: "$boilerData.version"},
                            signUpCode : {$first: "$boilerData.signUpCode"},
                            uniqueKey : {$first: "$boilerData.uniqueKey"},
                            lastUpdated : {$first: "$boilerData.lastUpdated"},
                            state : {$first: "$boilerData.state"},
                            status : {$first: "$boilerData.status"},
                            errorcode : {$first: "$boilerData.errorcode"},
                            errortype : {$first: "$boilerData.errortype"},
                            cascade : {$first: "$boilerData.cascade"},
                            software : {$first: "$boilerData.software"},
                            securitymode : {$first: "$boilerData.securitymode"},
                            chsetpointwrite : {$first: "$boilerData.chsetpointwrite"},
                            dhwsetpointwrite : {$first: "$boilerData.dhwsetpointwrite"},
                            dhwtanksetpointwrite : {$first: "$boilerData.dhwtanksetpointwrite"},
                            flowswitch : {$first: "$boilerData.flowswitch"},
                            dhwsensormode : {$first: "$boilerData.dhwsensormode"},
                            relayassignmenta : {$first: "$boilerData.relayassignmenta"},
                            relayassignmentb : {$first: "$boilerData.relayassignmentb"},
                            relayassignmentc : {$first: "$boilerData.relayassignmentc"},
                            relayassignmentd : {$first: "$boilerData.relayassignmentd"},
                            isDeleted : {$first: "$boilerData.isDeleted"},
                            boilerReadRecordData: {$push: "$boilerReadRecordData"},
                            siteData: {$first: "$siteData"},
                        }
                    },
                    {
                        $group: {
                            _id: "$siteData._id",
                            address: {$first: "$siteData.address"},
                            city: {$first: "$siteData.city"},
                            name: {$first: "$siteData.name"},
                            state: {$first: "$siteData.state"},
                            zip : {$first: "$siteData.zip"},
                            disableNotification : {$first: "$siteData.disableNotification"},
                            timeZone : {$first: "$siteData.timeZone"},
                            fuel : {$first: "$siteData.fuel"},
                            id : {$first: "$siteData._id"},
                            boilers: {
                                $push: {
                                        _id: "$_id",
                                        nuroSN : "$nuroSN",
                                        solaSN : "$solaSN",
                                        model : "$model",
                                        alertsDisabled : "$alertsDisabled",
                                        relayEnergizedAlert : "$relayEnergizedAlert",
                                        holdErrorAlert : "$holdErrorAlert",
                                        lockoutErrorAlert : "$lockoutErrorAlert",
                                        alertInterval : "$alertInterval",
                                        name : "$name",
                                        isPaid : "$isPaid",
                                        tempAlerts : "$tempAlerts",
                                        siteId : "$siteId",
                                        version : "$version",
                                        signUpCode : "$signUpCode",
                                        uniqueKey : "$uniqueKey",
                                        lastUpdated : "$lastUpdated",
                                        state : "$state",
                                        status : "$status",
                                        errorcode : "$errorcode",
                                        errortype : "$errortype",
                                        cascade : "$cascade",
                                        software : "$software",
                                        securitymode : "$securitymode",
                                        chsetpointwrite : "$chsetpointwrite",
                                        dhwsetpointwrite : "$dhwsetpointwrite",
                                        dhwtanksetpointwrite : "$dhwtanksetpointwrite",
                                        flowswitch : "$flowswitch",
                                        dhwsensormode : "$dhwsensormode",
                                        relayassignmenta : "$relayassignmenta",
                                        relayassignmentb : "$relayassignmentb",
                                        relayassignmentc : "$relayassignmentc",
                                        relayassignmentd : "$relayassignmentd",
                                        isDeleted : "$isDeleted",
                                        boilerReadRecordData: "$boilerReadRecordData",
                                    }
                                 }
                            }
                        }
                    ])


                data.toArray(function (err, results) {
                    //  db.close();
                    if(results && results.length > 0) {
                        res.status(200).send(results);
                    } else {
                        res.status(200).send([]);
                    }
                }); 
            })
        }

};
