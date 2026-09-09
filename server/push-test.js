module.exports = function () {
    var app = require('../../server/server');
    var Notification = app.models.notification;
    var Application = app.models.application;
    var PushModel = app.models.push;

    function startPushServer() {
        // Add our custom routes
        var badge = 1;
        app.post('/notify/:id', function (req, res, next) {
            var note = new Notification({
                expirationInterval: 3600, // Expires 1 hour from now.
                badge: badge--,
                sound: 'ping.aiff',
                alert: '\uD83D\uDCE7 \u2709 ' - 'Hello',
                messageFrom: 'Ray'
            });

            PushModel.notifyById(req.params.id, note, function (err) {
                if (err) {
                    console.error('Cannot notify %j: %s', req.params.id, err.stack);
                    next(err);
                    return;
                }
                console.log('pushing notification to %j', req.params.id);
                res.send(200, 'OK');
            });
        });

        PushModel.on('error', function (err) {
            console.error('Push Notification error: ', err.stack);
        });

        // Pre-register an application that is ready to be used for testing.
        // You should tweak config options in ./config.js

        var config = require('./config');

        var demoApp = {
            id: 'loopback-component-push-app',
            userId: 'strongloop',
            name: config.appName,

            description: 'LoopBack Push Notification Demo Application',
            pushSettings: {
                apns: {
                    certData: config.apnsCertData,
                    keyData: config.apnsKeyData,
                    pushOptions: {
                        // Extra options can go here for APN
                    },
                    feedbackOptions: {
                        batchFeedback: true,
                        interval: 300
                    }
                },
                gcm: {
                    serverApiKey: config.gcmServerApiKey
                }
            }
        };

//        updateOrCreateApp(function (err, appModel) {
//            if (err) {
//                throw err;
//            }
//            console.log('Application id: %j', appModel.id);
//        });

    }

    startPushServer();
};
/**
 * Created by home on 12/22/16.
 */
