'use strict';

module.exports = function (Boilerreadrecord) {

    var app = require('../../server/server');
    var ops = require('../middleware/operations.js');
    var DB = require('../middleware/mongo.js');
    var Notifications = require('../middleware/notifications.js');
    const messaging = require("../middleware/firebaseConfig.js");
    // const serviceAccount = require("../middleware/harsco-bd9c2-firebase-adminsdk-ljnrv-5253ab63c0.json"); // adjust path
    
    // admin.initializeApp({
    //     credential: admin.credential.cert(serviceAccount)
    // });
    
    // var FCM = require('fcm-node');
    var apn = require('apn');
    var email = require('../middleware/mails.js');
    var config = require('../middleware/config');
    // var fcm = new FCM(config.fcmServerKey);

    Boilerreadrecord.disableRemoteMethodByName('__get__boiler', false);

    Boilerreadrecord.remoteMethod(
        'newRecord',
        {
            description: "Boiler to call this method to update new records.",
            http: {path: '/newRecord', verb: 'post'},
            accepts: [
                {arg: 'signature', type: 'string', http: {source: 'header'}},
                {
                    arg: 'record', type: 'object', http: {source: 'body'},
                    default: {
                        "version": "0.0.1",
                        "date": "123456789",
                        "update": {
                            "updateId": 234,
                            "success": true,
                            "error": "error message" //error message only if success is false
                        },
                        "data": {
                            "supply": 770,
                            "return": 770,
                            "stack": 771,
                            "dhw": 772,
                            "header": 773,
                            "hx": 774,
                            "oda": 775,
                            "analogin": 23,
                            "analogout": 24,
                            "digitalio": 255,
                            "annunciator": 64,
                            "activedemand": 0,
                            "state": 0,
                            "status": 0,
                            "flame": 100,
                            "fan": 300,
                            "firerate": 30,
                            "errorcode": 0,
                            "errortype": 0,
                            "cycles": 1234,
                            "runtime": 1234,
                            "chcontrol": 0,
                            "chsetpoint": 770,
                            "dhwcontrol": 0,
                            "dhwsetpoint": 770,
                            "dhwtanksetpoint": 770,
                            "model": 0,
                            "software": "xyz",
                            "nuro": "AA:BB:CC:DD:EE:FF",
                            "sola": "xyz",
                            "cascade": 0,
                            "fuel": 1000,
                            "securitymode": 0
                        }
                    },
                },
                {arg: 'req', type: 'object', 'http': {source: 'req'}},
            ],
            returns: {
                arg: 'response', type: 'object',
                default: {
                    "success": true,
                    "error": "Error message, why it failed", //error message only if success is false
                    "update": {
                        "updateid": 123,
                        "data": {
                            "chcontrol": 0,
                            "chsetpoint": 770,
                            "dhwcontrol": 0,
                            "dhwsetpoint": 770,
                            "dhwtanksetpoint": 770,
                            "passcode": 123456
                        },
                        "file": {
                            "type": 1,  //1: screenshot, 2: parameters, 3: error log
                            "uploadURL": "http://www.xyz.com/file/<uniquetoken>"
                        }
                    }
                }
            }
        });

        Boilerreadrecord.remoteMethod(
            'boilerNewRecord',
            {
                description: "Boiler to call this method to update new records.",
                http: {path: '/boilerNewRecord', verb: 'post'},
                accepts: [
                    {arg: 'signature', type: 'string', http: {source: 'header'}},
                    {
                        arg: 'record', type: 'object', http: {source: 'body'},
                        default: {
                            "version": "0.0.1",
                            "date": "123456789",
                            "update": {
                                "updateId": 234,
                                "success": true,
                                "error": "error message" //error message only if success is false
                            },
                            "data": {
                                "supply": 770,
                                "return": 770,
                                "stack": 771,
                                "dhw": 772,
                                "header": 773,
                                "hx": 774,
                                "oda": 775,
                                "analogin": 23,
                                "analogout": 24,
                                "digitalio": 255,
                                "annunciator": 64,
                                "activedemand": 0,
                                "state": 0,
                                "status": 0,
                                "flame": 100,
                                "fan": 300,
                                "firerate": 30,
                                "errorcode": 0,
                                "errortype": 0,
                                "cycles": 1234,
                                "runtime": 1234,
                                "chcontrol": 0,
                                "chsetpoint": 770,
                                "dhwcontrol": 0,
                                "dhwsetpoint": 770,
                                "dhwtanksetpoint": 770,
                                "model": 0,
                                "software": "xyz",
                                "nuro": "AA:BB:CC:DD:EE:FF",
                                "sola": "xyz",
                                "cascade": 0,
                                "fuel": 1000,
                                "securitymode": 0
                            }
                        },
                    },
                    {arg: 'req', type: 'object', 'http': {source: 'req'}},
                ],
                returns: {
                    arg: 'response', type: 'object',
                    default: {
                        "success": true,
                        "error": "Error message, why it failed", //error message only if success is false
                        "update": {
                            "updateid": 123,
                            "data": {
                                "chcontrol": 0,
                                "chsetpoint": 770,
                                "dhwcontrol": 0,
                                "dhwsetpoint": 770,
                                "dhwtanksetpoint": 770,
                                "passcode": 123456
                            },
                            "file": {
                                "type": 1,  //1: screenshot, 2: parameters, 3: error log
                                "uploadURL": "http://www.xyz.com/file/<uniquetoken>"
                            }
                        }
                    }
                }
            });

    Boilerreadrecord.remoteMethod(
        'replace',
        {
            description: "Use this method to fetch the records by filter.",
            http: {path: '/:boilerId/replace', verb: 'get'},
            accepts: [
                {arg: 'boilerId', type: 'string'},
                {arg: 'update', type: 'object', 'http': {source: 'query'}},
                {arg: 'req', type: 'object', http: {source: 'req'}},
                {arg: 'res', type: 'object', http: {source: 'res'}}
            ],
            returns: {
                arg: 'response',
                type: 'array',
                root:true,
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

    Boilerreadrecord.newRecord = function (signature, record, req, cb) {

        if (!signature || !record.date || !record.data.nuro) {
            cb({success: false}, null);
            return;
        }

        var Boiler = app.models.Boiler;
        var UserToSite = app.models.UserToSite;
        var User = app.models.User;
        var Site = app.models.Site;

        var boilerId = '';

        var receivedDate = new Date();

        // var minIndex = receivedDate.getMinutes();
        // var secIndex = receivedDate.getSeconds();
        //
        // receivedDate.setMinutes(0);
        // receivedDate.setSeconds(0);
        // receivedDate.setMilliseconds(0);

        var insertRecord,
            boiler;

        Boiler.find({where: {'nuroSN': record.data.nuro}})
            .then(function (rec) {

                if (rec.length !== 1) {
                    return;
                }

                //Validate signature: date xor nuro serial xor unique key

                var generated = ops.decoder(ops.decoder(record.date, record.data.nuro), rec[0].uniqueKey);

                if (signature != generated) {
                    console.log('Received invalid signature for boiler '+record.data.nuro);
                    throw new Error('Invalid Data');
                    return;
                }

                boilerId = rec[0].id;
                boiler = rec[0];
                if(record.data.software && record.data.software.substring(0,1).toLowerCase() == 'w'){
                    record.data.brand = 1
                }

                //check if we have any boiler info variables to update

                var updateBoilerInfo = {lastUpdated:receivedDate};
                updateBoilerInfo['isPaid'] = true; // Making boiler By Default true

                if(record.data.state >= 0) updateBoilerInfo['state'] = record.data.state;
                if(record.data.status >= 0) updateBoilerInfo['status'] = record.data.status;
                if(record.data.errorcode >= 0) updateBoilerInfo['errorcode'] = record.data.errorcode; // When errorCode is 0 condition will become false
                if(record.data.errortype >= 0 ) updateBoilerInfo['errortype'] = record.data.errortype; // When errorType is 0 condition will become false

                if(record.data.model >= 0) updateBoilerInfo['model'] = record.data.model;
                if(record.data.cascade >= 0) updateBoilerInfo['cascade'] = record.data.cascade;
                if(record.data.software) updateBoilerInfo['software'] = record.data.software;
                if(record.data.securitymode >= 0) updateBoilerInfo['securitymode'] = record.data.securitymode;
                if(record.data.chsetpointwrite >= 0) updateBoilerInfo['chsetpointwrite'] = record.data.chsetpointwrite;
                if(record.data.dhwsetpointwrite >= 0) updateBoilerInfo['dhwsetpointwrite'] = record.data.dhwsetpointwrite;
                if(record.data.dhwtanksetpointwrite >= 0) updateBoilerInfo['dhwtanksetpointwrite'] = record.data.dhwtanksetpointwrite;

                if(record.data.flowswitch >= 0) updateBoilerInfo['flowswitch'] = record.data.flowswitch;
                if(record.data.dhwsensormode >= 0) updateBoilerInfo['dhwsensormode'] = record.data.dhwsensormode;

                if(record.data.relayassignmenta >= 0) updateBoilerInfo['relayassignmenta'] = record.data.relayassignmenta;
                if(record.data.relayassignmentb >= 0) updateBoilerInfo['relayassignmentb'] = record.data.relayassignmentb;
                if(record.data.relayassignmentc >= 0) updateBoilerInfo['relayassignmentc'] = record.data.relayassignmentc;
                if(record.data.relayassignmentd >= 0) updateBoilerInfo['relayassignmentd'] = record.data.relayassignmentd;
                if(record.data.sola && record.data.sola.trim()) updateBoilerInfo['solaSN'] = record.data.sola;
                rec[0].updateAttributes(updateBoilerInfo);
                //
                insertRecord = {
                    receivedDate: receivedDate,
                    boilerId: boilerId
                };

                //check if there is an existing record for this hour, else create it
                return Boilerreadrecord.create(insertRecord);
            })
            .then(function (result) {
                // Disable the single record creation
                // //insert the data into the table
                // var temp = result[0].receivedData;
                // if (!temp) temp = {};
                //
                // var temp1 = temp[minIndex];
                // if (!temp1) temp1 = {};
                //
                // temp1[secIndex] = record;
                // temp[minIndex] = temp1;
                //
                // result[0].receivedData = temp;

                result.receivedData = record;

                return Boilerreadrecord.upsertWithWhere({id: result.id}, result)
            })
            .then(function (err, data) {

                var updateMsg = {};
                var fileMsg = {};

                var BoilerWriteRecord = app.models.BoilerWriteRecord;

                //check if we got a response for any previous writes and update db with results
                if (record.update && record.update.updateId) {
                    BoilerWriteRecord.find({where: {id: record.update.updateId}})
                        .then(function (result) {
                            if (result.length === 1) {
                                return result[0].updateAttributes({writeComplete:true,writeCompleteDate:new Date(),writeError:record.update.error });
                            }
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                }

                //see if there is write pending
                BoilerWriteRecord.find({where: {boilerId: boilerId, writeComplete: false}})
                    .then(function (result) {
                        try {
                            if (result.length != 0) {
                                var updateId = result[0].id;
                                updateMsg = {
                                    "updateId": updateId,
                                    "data": JSON.parse(result[0].writeRecord)
                                }
                            }
                        } catch (err) {
                            console.log('Invalid write record for boilerId'+boilerId);
                        }

                        var BoilerFile = app.models.BoilerFile;

                        //see if there is a file read pending
                        return BoilerFile.find({where: {boilerId: boilerId, uploadComplete: false}});
                    })
                    .then(function (result) {
                        if (result.length != 0) {
                            var fileId = result[0].id;
                            fileMsg = {
                                "type": result[0].fileType,
                                "uploadURL": 'https://' + req.headers.host + '/api/BoilerFiles/' + fileId + '/upload'
                            }
                        }

                        var BoilerNotification = app.models.BoilerNotification;

                        var isBoilerHaveNotifications = (boiler.alertsDisabled) &&
                            (boiler.lockoutErrorAlert == true || boiler.holdErrorAlert == true || boiler.relayEnergizedAlert == true || (boiler.tempAlerts && boiler.tempAlerts.length > 0));

                        if(isBoilerHaveNotifications ) {

                            BoilerNotification.find({
                                where: {'boilerId': boilerId}, limit: 1,order:"notifiedDate DESC"
                            }).then(function(lastNotification) {

                                var boilerName = '',
                                    message = '',
                                    boilerState = '',
                                    notifiyUsers = [];

                                var intervaltime = 24 * 3600;//default to one day
                                if (boiler.alertInterval == 0) {
                                    intervaltime = 3600;
                                }
                                else if (boiler.alertInterval == 1 ) {
                                    intervaltime = 24 * 3600;
                                }

                                var now = Math.floor(Date.now() / 1000),
                                    lastSentTime = 0;

                                if(lastNotification.length > 0)
                                    lastSentTime =  Math.floor((new Date(lastNotification[0].notifiedDate).getTime())/1000);

                                if(lastNotification.length == 0 || (parseInt(now) - parseInt(lastSentTime) >= parseInt(intervaltime))) {

                                    /**
                                     * Condition: either the boiler did not sent any notification yet,
                                     * or The boilers last sent notification time is greater than the alert interval
                                     * I.E. (boiler's alert interval <= current time - last notification sent time)
                                     *
                                     */

                                    // console.log(boiler.name + " Notification started");

                                    boilerName = boiler.name;

                                    var lockoutErrorAlert = boiler.lockoutErrorAlert;
                                    var holdErrorAlert = boiler.holdErrorAlert;
                                    var relayEnergizedAlert = boiler.relayEnergizedAlert;

                                    for (var i = 0; i < boiler.tempAlerts.length; i++) {

                                        var _msg = getAlertType(boiler.tempAlerts[i].tempType,
                                                                boiler.tempAlerts[i].under,
                                                                record.data[getTempVariable(boiler.tempAlerts[i].tempType)],
                                                                boiler.tempAlerts[i].value,
                                                                boiler.alertonOverTempstatus,
                                                                boiler.alertonUnderTempstatus);

                                        if(_msg.length > 0) {
                                            if(message.length > 0) message+= ", ";
                                            message += _msg
                                        }
                                    }

                                    if (record.data.state == 2 && lockoutErrorAlert == true) {
                                        boilerState = ' Boiler in Lockout state';
                                    }
                                    if (record.data.state == 3 && holdErrorAlert == true) {
                                        boilerState = ' Boiler in Hold state';
                                    }

                                    var bits = parseInt(record.data.digitalio).toString(2);
                                    bits = "0000000000000000".substr(bits.length) + bits;

                                    var digitalio = bits.split('');

                                    if (digitalio[8] == 1 && relayEnergizedAlert == true) {

                                        if (boilerState.trim() != '') boilerState += ', ';

                                        boilerState += ' Alert on Alarm Relay Energized';
                                    }

                                    if(boilerState.trim().length > 0 && message.trim().length >0) {
                                        boilerState = boilerState + ', ';
                                    }

                                    var pushNotification = boilerState + " "+ message;

                                    var  deviceTokens = [];
                                    if(pushNotification.trim().length > 0) {
                                        // process the notification only when you have text is push notification.
                                        var boilerNotificationRecord;

                                        var  _notification = {
                                            notifiedDate : new Date(),
                                            boilerId : boiler.id,
                                            notificationText : boilerName
                                        };

                                        BoilerNotification.create(_notification).
                                            then(function(_record) {
                                                boilerNotificationRecord = _record;
                                            });

                                        Site.find({
                                            where: {
                                                "id": boiler.siteId}
                                        }).then(function(site) {

                                            if(site[0].disableNotification == false) {

                                                UserToSite.find(
                                                    {
                                                        where: {
                                                            "siteId": boiler.siteId}
                                                    }).then(function (siteUsers) {

                                                        var mails = [],

                                                            notifiedUsers = [],
                                                            _notification = {};

                                                        for(var i=0; i< siteUsers.length; i++ ) {

                                                            if(siteUsers.length-1 == i ) {
                                                                _notification = {
                                                                    notificationText : boilerName + " " +pushNotification,
                                                                    notifiedDate : new Date(),
                                                                    sentToUsers  : notifiedUsers,
                                                                    boilerId : boiler.id
                                                                };

                                                                boilerNotificationRecord?.updateAttributes(_notification).
                                                                    then(function(_record) {
                                                                    })
                                                            }

                                                            if(siteUsers[i].disableNotification == false) {

                                                                notifiedUsers.push(siteUsers[i].userId);

                                                                User.findById(
                                                                    siteUsers[i].userId,
                                                                    {
                                                                        include: {
                                                                            relation: "devices"
                                                                        }
                                                                    }).then(async function (user) {
                                                                        if(user) {

                                                                            var devices = new (user.devices);
                                                                            for(var j=0; j< devices.length; j++) {

                                                                                if (deviceTokens.filter(function(token) { return token.deviceToken == devices[j].deviceToken; }).length == 0) {
                                                                                    /* disconnectDetails doesn't contains the element we're looking for */

                                                                                    deviceTokens.push(devices[j]);

                                                                                }
                                                                            }

                                                                            var pushMessage = boilerName + ' at ' + site[0].name + ':' + pushNotification;

                                                                            pushMessage= pushMessage+'<br /><br />'+"This message was automatically generated from nuroconnect.com. To change how notifications are received, log in with your account and click the Notifications link in the side bar.";

                                                                            if(!!user.created && user.emailNotifications == true) {
                                                                                /**
                                                                                 * Conditions - by default user will not have flag  emailNotifications in his object, unless he check or uncheck from UI,
                                                                                 * it will not create the property for him, so, user.emailNotifictions is false only when the user disabled it from UI.
                                                                                 * user.created - when a user is invited he should not added to Harsco site, but we are saving his details in User model.
                                                                                 * unless a user went and creare him self from the invite link he will not have the property user.created in his object.
                                                                                 */

                                                                                email.send({
                                                                                    to: user.email,
                                                                                    subject: "Notifications from Nuro Connect - "+boilerName,
                                                                                    html:   pushMessage
                                                                                });
                                                                            }

                                                                            for(var j = 0; j< deviceTokens.length; j++) {

                                                                                if(parseInt(deviceTokens[j].status) == 1) {

                                                                                    if (deviceTokens[j].deviceType === 'iOS') {

                                                                                        var options = {
                                                                                            token: {
                                                                                                key: "/home/ec2-user/harsco/server/prod/AuthKey_92N5KG4Y7T.p8",
                                                                                                keyId: "92N5KG4Y7T",
                                                                                                teamId: "5K5L7AR5G2"
                                                                                            },
                                                                                            production: false
                                                                                        };

                                                                                        const topic = "com.vensi.harscopk"; // setting to prod by default

                                                                                        // if(process.env.NODE_ENV == 'development') {
                                                                                        //     options = {
                                                                                        //         token: {
                                                                                        //             key: "/home/ec2-user/harsco/server/prod/AuthKey_92N5KG4Y7T.p8",
                                                                                        //             keyId: "8HFA37USR6",
                                                                                        //             teamId: "84KLUUGWB3"
                                                                                        //         },
                                                                                        //         production: true
                                                                                        //     };
                                                                                        //     topic = "com.vensi.harsco-dev";
                                                                                        // }

                                                                                        var apnProvider = new apn.Provider(options);

                                                                                        var note = new apn.Notification();

                                                                                        note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                                                                                        note.badge = 0;
                                                                                        note.sound = "ping.aiff";
                                                                                        note.alert = boilerName + ' at ' + site[0].name +':'+ pushNotification;
                                                                                        note.payload = {'messageFrom': 'Nuro Connect'};
                                                                                        note.topic = topic;

                                                                                        if(!deviceTokens[j].sent){
                                                                                            deviceTokens[j].sent = true;
                                                                                            apnProvider.send(note, deviceTokens[j].deviceToken)
                                                                                            .then(response => {
                                                                                                console.log("✅ APNs response:", JSON.stringify(response));
                                                                                                if (response.failed && response.failed.length > 0) {
                                                                                                    console.error("❌ Failed tokens:", response.failed);
                                                                                                }
                                                                                            })
                                                                                            .catch(err => {
                                                                                                console.error("❌ APNs error:", err);
                                                                                            });

                                                                                            // apnProvider.send(note, deviceTokens[j].deviceToken).then(function (response,err) {

                                                                                            // });
                                                                                        }
                                                                                    }

                                                                                    else if (deviceTokens[j].deviceType === 'Android') {
                                                                                        var message = {
                                                                                            collapse_key: 'Nuro Connect',
                                                                                    
                                                                                            notification: {
                                                                                                title: 'Nuro Connect',
                                                                                                body: boilerName + ' at ' + site[0].name + ':' + pushNotification
                                                                                            },
                                                                                    
                                                                                            data: {
                                                                                                msgcnt: '0',
                                                                                            }
                                                                                        };
                                                                                    
                                                                                        var registrationIds = [];
                                                                                        registrationIds.push(deviceTokens[j].deviceToken);
                                                                                    
                                                                                        if (!deviceTokens[j].sent) {
                                                                                            deviceTokens[j].sent = true;
                                                                                    
                                                                                            const adminMessage = {
                                                                                                notification: message.notification,
                                                                                                data: message.data
                                                                                            };

                                                                                            try {
                                                                                                const responses = await Promise.all(
                                                                                                    registrationIds.map(token => messaging.send({ ...adminMessage, token }))
                                                                                                );
                                                                                                console.log('✅ Sent to all tokens:', responses);
                                                                                              } catch (err) {
                                                                                                console.error('❌ Error sending to tokens:', err);
                                                                                            }
                                                                                    
                                                                                            // messaging.sendMulticast(adminMessage)
                                                                                            //     .then(function(response) {
                                                                                            //         console.log("Successfully sent with response: ", response);
                                                                                            //     })
                                                                                            //     .catch(function(err) {
                                                                                            //         console.log("Something has gone wrong!");
                                                                                            //         console.error(err);
                                                                                            //     });
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    });
                                                            }
                                                        }
                                                    })
                                            }
                                        });
                                    }
                                }
                            });
                        }

                        cb(null, {
                            "success": true,
                            "update": updateMsg,
                            "file": fileMsg
                        });
                    })
                    .catch(function (err) {
                        cb({success: false}, null);
                    });

            })
            .catch(function (err) {
                cb({success: false}, null);
            });
    };

    Boilerreadrecord.boilerNewRecord = function (signature, record, req, cb) {

        if (!signature || !record.date || !record.data.nuro) {
            cb({success: false}, null);
            return;
        }

        var Boiler = app.models.Boiler;
        var UserToSite = app.models.UserToSite;
        var User = app.models.User;
        var Site = app.models.Site;

        var boilerId = '';

        var receivedDate = new Date();

        // var minIndex = receivedDate.getMinutes();
        // var secIndex = receivedDate.getSeconds();
        //
        // receivedDate.setMinutes(0);
        // receivedDate.setSeconds(0);
        // receivedDate.setMilliseconds(0);

        var insertRecord,
            boiler;

        Boiler.find({where: {'nuroSN': record.data.nuro}})
            .then(function (rec) {

                if (rec.length !== 1) {
                    return;
                }

                //Validate signature: date xor nuro serial xor unique key

                var generated = ops.decoder(ops.decoder(record.date, record.data.nuro), rec[0].uniqueKey);

                if (signature != generated) {
                    console.log('Received invalid signature for boiler '+record.data.nuro);
                    throw new Error('Invalid Data');
                    return;
                }

                boilerId = rec[0].id;
                boiler = rec[0];

                //check if we have any boiler info variables to update

                var updateBoilerInfo = {lastUpdated:receivedDate};
                updateBoilerInfo['isPaid'] = true; // Making boiler By Default true

                if(record.data.state >= 0) updateBoilerInfo['state'] = record.data.state;
                if(record.data.status >= 0) updateBoilerInfo['status'] = record.data.status;
                if(record.data.errorcode >= 0) updateBoilerInfo['errorcode'] = record.data.errorcode; // When errorCode is 0 condition will become false
                if(record.data.errortype >= 0 ) updateBoilerInfo['errortype'] = record.data.errortype; // When errorType is 0 condition will become false

                if(record.data.model >= 0) updateBoilerInfo['model'] = record.data.model;
                if(record.data.cascade >= 0) updateBoilerInfo['cascade'] = record.data.cascade;
                if(record.data.software) updateBoilerInfo['software'] = record.data.software;
                if(record.data.securitymode >= 0) updateBoilerInfo['securitymode'] = record.data.securitymode;
                if(record.data.chsetpointwrite >= 0) updateBoilerInfo['chsetpointwrite'] = record.data.chsetpointwrite;
                if(record.data.dhwsetpointwrite >= 0) updateBoilerInfo['dhwsetpointwrite'] = record.data.dhwsetpointwrite;
                if(record.data.dhwtanksetpointwrite >= 0) updateBoilerInfo['dhwtanksetpointwrite'] = record.data.dhwtanksetpointwrite;

                if(record.data.flowswitch >= 0) updateBoilerInfo['flowswitch'] = record.data.flowswitch;
                if(record.data.dhwsensormode >= 0) updateBoilerInfo['dhwsensormode'] = record.data.dhwsensormode;

                if(record.data.relayassignmenta >= 0) updateBoilerInfo['relayassignmenta'] = record.data.relayassignmenta;
                if(record.data.relayassignmentb >= 0) updateBoilerInfo['relayassignmentb'] = record.data.relayassignmentb;
                if(record.data.relayassignmentc >= 0) updateBoilerInfo['relayassignmentc'] = record.data.relayassignmentc;
                if(record.data.relayassignmentd >= 0) updateBoilerInfo['relayassignmentd'] = record.data.relayassignmentd;
                rec[0].updateAttributes(updateBoilerInfo);
                //
                insertRecord = {
                    receivedDate: receivedDate,
                    boilerId: boilerId
                };

                //check if there is an existing record for this hour, else create it
                return Boilerreadrecord.create(insertRecord);
            })
            .then(function (result) {
                // Disable the single record creation
                // //insert the data into the table
                // var temp = result[0].receivedData;
                // if (!temp) temp = {};
                //
                // var temp1 = temp[minIndex];
                // if (!temp1) temp1 = {};
                //
                // temp1[secIndex] = record;
                // temp[minIndex] = temp1;
                //
                // result[0].receivedData = temp;

                result.receivedData = record;

                return Boilerreadrecord.upsertWithWhere({id: result.id}, result)
            })
            .then(function (err, data) {

                var updateMsg = {};
                var fileMsg = {};

                var BoilerWriteRecord = app.models.BoilerWriteRecord;

                //check if we got a response for any previous writes and update db with results
                if (record.update && record.update.updateId) {
                    BoilerWriteRecord.find({where: {id: record.update.updateId}})
                        .then(function (result) {
                            if (result.length === 1) {
                                return result[0].updateAttributes({writeComplete:true,writeCompleteDate:new Date(),writeError:record.update.error });
                            }
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                }

                //see if there is write pending
                BoilerWriteRecord.find({where: {boilerId: boilerId, writeComplete: false}})
                    .then(function (result) {
                        try {
                            if (result.length != 0) {
                                var updateId = result[0].id;
                                updateMsg = {
                                    "updateId": updateId,
                                    "data": JSON.parse(result[0].writeRecord)
                                }
                            }
                        } catch (err) {
                            console.log('Invalid write record for boilerId'+boilerId);
                        }

                        var BoilerFile = app.models.BoilerFile;

                        //see if there is a file read pending
                        return BoilerFile.find({where: {boilerId: boilerId, uploadComplete: false}});
                    })
                    .then(function (result) {
                        if (result.length != 0) {
                            var fileId = result[0].id;
                            fileMsg = {
                                "type": result[0].fileType,
                                "uploadURL": 'https://' + req.headers.host + '/api/BoilerFiles/' + fileId + '/upload'
                            }
                        }

                        var BoilerNotification = app.models.BoilerNotification;

                        var isBoilerHaveNotifications = (boiler.alertsDisabled) &&
                            (boiler.lockoutErrorAlert == true || boiler.holdErrorAlert == true || boiler.relayEnergizedAlert == true || (boiler.tempAlerts && boiler.tempAlerts.length > 0));

                        if(isBoilerHaveNotifications ) {

                            BoilerNotification.find({
                                where: {'boilerId': boilerId}, limit: 1,order:"notifiedDate DESC"
                            }).then(function(lastNotification) {

                                var boilerName = '',
                                    message = '',
                                    boilerState = '',
                                    notifiyUsers = [];

                                var intervaltime = 24 * 3600;//default to one day
                                if (boiler.alertInterval == 0) {
                                    intervaltime = 3600;
                                }
                                else if (boiler.alertInterval == 1 ) {
                                    intervaltime = 24 * 3600;
                                }

                                var now = Math.floor(Date.now() / 1000),
                                    lastSentTime = 0;

                                if(lastNotification.length > 0)
                                    lastSentTime =  Math.floor((new Date(lastNotification[0].notifiedDate).getTime())/1000);

                                if(lastNotification.length == 0 || (parseInt(now) - parseInt(lastSentTime) >= parseInt(intervaltime))) {

                                    /**
                                     * Condition: either the boiler did not sent any notification yet,
                                     * or The boilers last sent notification time is greater than the alert interval
                                     * I.E. (boiler's alert interval <= current time - last notification sent time)
                                     *
                                     */

                                    // console.log(boiler.name + " Notification started");

                                    boilerName = boiler.name;

                                    var lockoutErrorAlert = boiler.lockoutErrorAlert;
                                    var holdErrorAlert = boiler.holdErrorAlert;
                                    var relayEnergizedAlert = boiler.relayEnergizedAlert;

                                    for (var i = 0; i < boiler.tempAlerts.length; i++) {

                                        var _msg = getAlertType(boiler.tempAlerts[i].tempType,
                                                                boiler.tempAlerts[i].under,
                                                                record.data[getTempVariable(boiler.tempAlerts[i].tempType)],
                                                                boiler.tempAlerts[i].value,
                                                                boiler.alertonOverTempstatus,
                                                                boiler.alertonUnderTempstatus);

                                        if(_msg.length > 0) {
                                            if(message.length > 0) message+= ", ";
                                            message += _msg
                                        }
                                    }

                                    if (record.data.state == 2 && lockoutErrorAlert == true) {
                                        boilerState = ' Boiler in Lockout state';
                                    }
                                    if (record.data.state == 3 && holdErrorAlert == true) {
                                        boilerState = ' Boiler in Hold state';
                                    }

                                    var bits = parseInt(record.data.digitalio).toString(2);
                                    bits = "0000000000000000".substr(bits.length) + bits;

                                    var digitalio = bits.split('');

                                    if (digitalio[8] == 1 && relayEnergizedAlert == true) {

                                        if (boilerState.trim() != '') boilerState += ', ';

                                        boilerState += ' Alert on Alarm Relay Energized';
                                    }

                                    if(boilerState.trim().length > 0 && message.trim().length >0) {
                                        boilerState = boilerState + ', ';
                                    }

                                    var pushNotification = boilerState + " "+ message;

                                    var  deviceTokens = [];
                                    if(pushNotification.trim().length > 0) {
                                        // process the notification only when you have text is push notification.
                                        var boilerNotificationRecord;

                                        var  _notification = {
                                            notifiedDate : new Date(),
                                            boilerId : boiler.id,
                                            notificationText : boilerName
                                        };

                                        BoilerNotification.create(_notification).
                                            then(function(_record) {
                                                boilerNotificationRecord = _record;
                                            });

                                        Site.find({
                                            where: {
                                                "id": boiler.siteId}
                                        }).then(function(site) {

                                            if(site[0].disableNotification == false) {

                                                UserToSite.find(
                                                    {
                                                        where: {
                                                            "siteId": boiler.siteId}
                                                    }).then(async function (siteUsers) {

                                                        var mails = [],

                                                            notifiedUsers = [],
                                                            _notification = {};

                                                        for(var i=0; i< siteUsers.length; i++ ) {

                                                            if(siteUsers.length-1 == i ) {
                                                                _notification = {
                                                                    notificationText : boilerName + " " +pushNotification,
                                                                    notifiedDate : new Date(),
                                                                    sentToUsers  : notifiedUsers,
                                                                    boilerId : boiler.id
                                                                };

                                                                boilerNotificationRecord.updateAttributes(_notification).
                                                                    then(function(_record) {
                                                                    })
                                                            }

                                                            if(siteUsers[i].disableNotification == false) {

                                                                notifiedUsers.push(siteUsers[i].userId);

                                                                User.findById(
                                                                    siteUsers[i].userId,
                                                                    {
                                                                        include: {
                                                                            relation: "devices"
                                                                        }
                                                                    }).then(async function (user) {
                                                                        if(user) {

                                                                            var devices = new (user.devices);
                                                                            for(var j=0; j< devices.length; j++) {

                                                                                if (deviceTokens.filter(function(token) { return token.deviceToken == devices[j].deviceToken; }).length == 0) {
                                                                                    /* disconnectDetails doesn't contains the element we're looking for */

                                                                                    deviceTokens.push(devices[j]);

                                                                                }
                                                                            }

                                                                            var pushMessage = boilerName + ' at ' + site[0].name + ':' + pushNotification;

                                                                            pushMessage= pushMessage+'<br /><br />'+"This message was automatically generated from nuroconnect.com. To change how notifications are received, log in with your account and click the Notifications link in the side bar.";

                                                                            if(!!user.created && user.emailNotifications == true) {
                                                                                /**
                                                                                 * Conditions - by default user will not have flag  emailNotifications in his object, unless he check or uncheck from UI,
                                                                                 * it will not create the property for him, so, user.emailNotifictions is false only when the user disabled it from UI.
                                                                                 * user.created - when a user is invited he should not added to Harsco site, but we are saving his details in User model.
                                                                                 * unless a user went and creare him self from the invite link he will not have the property user.created in his object.
                                                                                 */

                                                                                email.send({
                                                                                    to: user.email,
                                                                                    subject: "Notifications from Nuro Connect - "+boilerName,
                                                                                    html:   pushMessage
                                                                                });
                                                                            }

                                                                            for(var j = 0; j< deviceTokens.length; j++) {

                                                                                if(parseInt(deviceTokens[j].status) == 1) {

                                                                                    if (deviceTokens[j].deviceType === 'iOS') {

                                                                                        var options = {
                                                                                            token: {
                                                                                                key: "/home/ec2-user/harsco/server/prod/AuthKey_92N5KG4Y7T.p8",
                                                                                                keyId: "92N5KG4Y7T",
                                                                                                teamId: "5K5L7AR5G2"
                                                                                            },
                                                                                            production: false
                                                                                        };

                                                                                        var topic = "com.vensi.harscopk"; // setting to prod by default

                                                                                        // if(process.env.NODE_ENV == 'development') {
                                                                                        //     options = {
                                                                                        //         token: {
                                                                                        //             key: "/home/ec2-user/harsco/server/dev/key.p8",
                                                                                        //             keyId: "8HFA37USR6",
                                                                                        //             teamId: "84KLUUGWB3"
                                                                                        //         },
                                                                                        //         production: true
                                                                                        //     };
                                                                                        //     topic = "com.vensi.harsco-dev";
                                                                                        // }

                                                                                        var apnProvider = new apn.Provider(options);

                                                                                        var note = new apn.Notification();

                                                                                        note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                                                                                        note.badge = 0;
                                                                                        note.sound = "ping.aiff";
                                                                                        note.alert = boilerName + ' at ' + site[0].name +':'+ pushNotification;
                                                                                        note.payload = {'messageFrom': 'Nuro Connect'};
                                                                                        note.topic = topic;

                                                                                        if(!deviceTokens[j].sent){
                                                                                            deviceTokens[j].sent = true;
                                                                                            // apnProvider.send(note, deviceTokens[j].deviceToken).then(function (response,err) {

                                                                                            // });

                                                                                            apnProvider.send(note, deviceTokens[j].deviceToken)
                                                                                            .then(response => {
                                                                                                console.log("✅ APNs response:", JSON.stringify(response));
                                                                                                if (response.failed && response.failed.length > 0) {
                                                                                                    console.error("❌ Failed tokens:", response.failed);
                                                                                                }
                                                                                            })
                                                                                            .catch(err => {
                                                                                                console.error("❌ APNs error:", err);
                                                                                            });
                                                                                        }
                                                                                    }

                                                                                    else if (deviceTokens[j].deviceType === 'Android') {
                                                                                        var message = {
                                                                                            collapse_key: 'Nuro Connect',
                                                                                    
                                                                                            notification: {
                                                                                                title: 'Nuro Connect',
                                                                                                body: boilerName + ' at ' + site[0].name + ':' + pushNotification
                                                                                            },
                                                                                    
                                                                                            data: {
                                                                                                msgcnt: '0',
                                                                                            }
                                                                                        };
                                                                                    
                                                                                        var registrationIds = [];
                                                                                        registrationIds.push(deviceTokens[j].deviceToken);
                                                                                    
                                                                                        if (!deviceTokens[j].sent) {
                                                                                            deviceTokens[j].sent = true;
                                                                                    
                                                                                            const adminMessage = {
                                                                                                notification: message.notification,
                                                                                                data: message.data
                                                                                            };

                                                                                            try {
                                                                                                const responses = await Promise.all(
                                                                                                    registrationIds.map(token => messaging.send({ ...adminMessage, token }))
                                                                                                );
                                                                                                console.log('✅ Sent to all tokens:', responses);
                                                                                              } catch (err) {
                                                                                                console.error('❌ Error sending to tokens:', err);
                                                                                            }
                                                                                    
                                                                                            // messaging.sendMulticast(adminMessage)
                                                                                            //     .then(function(response) {
                                                                                            //         console.log("Successfully sent with response: ", response);
                                                                                            //     })
                                                                                            //     .catch(function(err) {
                                                                                            //         console.log("Something has gone wrong!");
                                                                                            //         console.error(err);
                                                                                            //     });
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    });
                                                            }
                                                        }
                                                    })
                                            }
                                        });
                                    }
                                }
                            });
                        }

                        cb(null, {
                            "success": true,
                            "update": updateMsg,
                            "file": fileMsg
                        });
                    })
                    .catch(function (err) {
                        cb({success: false}, null);
                    });

            })
            .catch(function (err) {
                cb({success: false}, null);
            });
    };

    Boilerreadrecord.replace = function (boilerId, update, req, res, cb) {

        app.models.BoilerReadRecord.getDataSource().connector.connect( (err,db) => {

            //var boilerId = "2c743933-4136-44bd-bae2-1e3a54021430";
            //TODO: check if the boiler belongs to the site the user has access to

            update = update || {};

        var Boiler = app.models.Boiler;
        var UserToSite = app.models.UserToSite;



        Boiler.find({where: {'id': boilerId}}).then(function(record) {

            var siteId = record[0].siteId;
            var userId = req.accessToken.userId;

            UserToSite.find({where:{'userId':userId,'siteId':siteId}}).then(function(userToSite) {
                var role = userToSite[0].role;
                if(role == ops.siteroles.manager ){
                    db.collection('BoilerReadRecord').updateOne(
                        { 'boilerId': boilerId },
                        {
                            $set: {
                                boilerId: update.boilerId
                            }
                        },
                        {
                            upsert: false,
                            multi:true
                        }
                    );

                    res.status(200).send({'message':"Replace Success!"});

                }
                else {
                    res.status(401).send({'message':"Unauthorized access"});
                }
            })
        })


    });
};

    function getTempVariable(type) {
        var _temp = '';

        type = parseInt(type);
        switch(type) {
            case 0:
                _temp = "supply";
                break;
            case 1:
                _temp = "dhw";
                break;
            case 2:
                _temp = "return";
                break;
            case 3:
                _temp = "stack";
                break;
            case 4:
                _temp = "header";
                break;
            case 5:
                _temp = "hx";
                break;
            case 6:
                _temp = "oda";
                break;
            default:
                break;
        }

        return _temp;
    }

function getTempType(type) {
    var _temp = '';

    type = parseInt(type);
    switch(type) {
        case 0:
            _temp = "Supply temperature";
            break;
        case 1:
            _temp = "DHW temperature";
            break;
        case 2:
            _temp = "Return temperature";
            break;
        case 3:
            _temp = "Stack temperature";
            break;
        case 4:
            _temp = "Header temperature";
            break;
        case 5:
            _temp = "Heat Exchanger temperature";
            break;
        case 6:
            _temp = "Outdoor Air temperature";
            break;
        default:
            _temp = "Supply temperature";
            break;
    }

    return _temp;
}

    function getAlertType(type, isUnder, value, threshold, overTempStatus, underTempStatus) {

        var _message = '';

        if (isUnder == true && ((value / 10) < threshold) && underTempStatus == true)
            _message = getTempType(type) + " is under alert limit";
        else if (isUnder == false && ((value / 10) > threshold) && overTempStatus == true)
            _message = getTempType(type) + " is over alert limit";

        return _message;
    }

};
