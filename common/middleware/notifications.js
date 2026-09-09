/**
 * Notification scheduler for boiler alerts.
 * Checks boiler readings every 5 minutes and sends push/email notifications
 * for temperature alerts, lockout/hold states, relay alerts, and disconnections.
 */

var app;
const schedule = require('node-schedule');
const apn = require('apn');
const moment = require('moment-timezone');
const email = require('./mails.js');
require('events').EventEmitter.defaultMaxListeners = 0;
const messaging = require('./firebaseConfig.js');
const path = require("path");

// Map<token|email + message, { lastsendtime }> for throttling
const pushDetailsMap = new Map();
// Map<boilerId, disconnectflag> for disconnect tracking
const disconnectMap = new Map();

// Temperature type index -> { field name on data object, display label }
const TEMP_TYPES = {
    0: { field: 'supply', label: 'Supply temperature' },
    1: { field: 'dhw', label: 'DHW temperature' },
    2: { field: 'return', label: 'Return temperature' },
    3: { field: 'stack', label: 'Stack temperature' },
    4: { field: 'header', label: 'Header temperature' },
    5: { field: 'hx', label: 'Heat Exchanger temperature' },
    6: { field: 'oda', label: 'Outdoor Air temperature' },
};

var Notifications = function () {
    app = require('../../server/server');
};

/**
 * Check if a notification should be sent based on throttle interval.
 * Returns true if the notification is allowed (first time or interval elapsed).
 */
function shouldSendNotification(token, message, intervaltime) {
    const key = token + '||' + message;
    const now = Math.floor(Date.now() / 1000);
    const existing = pushDetailsMap.get(key);

    if (!existing) {
        pushDetailsMap.set(key, { lastsendtime: now });
        return true;
    }

    if (now - existing.lastsendtime >= intervaltime) {
        existing.lastsendtime = now;
        return true;
    }

    return false;
}

/**
 * Build temperature alert messages from boiler data and alert config.
 */
function buildTempAlertMessages(tempAlerts, data) {
    const messages = [];

    for (const alert of tempAlerts) {
        const tempType = TEMP_TYPES[alert.tempType];
        if (!tempType) continue;

        const actualValue = data[tempType.field] / 10;

        if (!alert.under && actualValue > alert.value) {
            messages.push(`${tempType.label} is over alert limit`);
        } else if (alert.under && actualValue < alert.value) {
            messages.push(`${tempType.label} is under alert limit`);
        }
    }

    return messages;
}

/**
 * Send email notification with throttling.
 */
function sendEmailNotification(toEmail, boilerName, pushmessage, intervaltime) {
    const fullMessage = boilerName + pushmessage;
    if (!shouldSendNotification(toEmail, fullMessage, intervaltime)) return;

    const body = fullMessage + '\r\n' +
        "This message was automatically generated from nuroconnect.com. " +
        "To change how notifications are received, log in with your account " +
        "and click the Notifications link in the side bar.";

    email.send({
        to: toEmail,
        subject: "Notifications from Nuro Connect",
        html: body
    });
}

/**
 * Send iOS push notification with throttling.
 */
function sendIOSNotification(apnProvider, deviceToken, boilerName, pushmessage, intervaltime) {
    const fullMessage = boilerName + pushmessage;
    if (!shouldSendNotification(deviceToken, fullMessage, intervaltime)) return;

    const note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.badge = 0;
    note.sound = "ping.aiff";
    note.alert = fullMessage;
    note.payload = { messageFrom: 'Nuro Connect' };
    note.topic = "com.vensi.harsco-dev";

    apnProvider.send(note, deviceToken).catch(err => {
        console.error('iOS push error:', err);
    });
}

/**
 * Send Android push notification via Firebase with throttling.
 */
async function sendAndroidNotification(deviceToken, boilerName, pushmessage, intervaltime) {
    const fullMessage = boilerName + pushmessage;
    if (!shouldSendNotification(deviceToken, fullMessage, intervaltime)) return;

    try {
        const response = await messaging.send({
            notification: {
                title: 'Nuro Connect',
                body: fullMessage
            },
            data: { msgcnt: '0' },
            token: deviceToken
        });
        console.log('✅ Android push sent:', response);
    } catch (err) {
        console.error('❌ Android push error:', err);
    }
}

/**
 * Process a single boiler's records and send notifications to all site users.
 */
async function processBoilerRecord(record, boilersById, models, db, apnProvider) {
    const { Boiler, UserToSite, User, Site } = models;
    const boiler = boilersById.get(String(record.boilerId));
    if (!boiler) return;

    const data = record.receivedData.data;
    const boilerName = boiler.name ? boiler.name + ' : ' : '';
    const boilerId = boiler.id;
    const siteid = boiler.siteId;

    // Determine alert interval in seconds
    let intervaltime = 0;
    if (boiler.alertInterval === 1) intervaltime = 3600;
    else if (boiler.alertInterval === 2) intervaltime = 24 * 3600;

    const hasAlertConfig = boiler.lockoutErrorAlert || boiler.holdErrorAlert ||
        boiler.relayEnergizedAlert || (boiler.tempAlerts && boiler.tempAlerts.length > 0);

    if (!hasAlertConfig || boiler.alertInterval <= 0) return;

    // Build temperature alert messages
    const tempAlerts = boiler.tempAlerts || [];
    const tempMessages = buildTempAlertMessages(tempAlerts, data);
    const hasTemperatureAlert = tempMessages.length > 0;

    // Build state/relay alert messages
    const alertParts = [];

    if (data.state === 2 && boiler.lockoutErrorAlert) {
        alertParts.push('Boiler in Lockout state');
    }
    if (data.state === 3 && boiler.holdErrorAlert) {
        alertParts.push('Boiler in Hold state');
    }

    const bits = parseInt(data.digitalio).toString(2).padStart(16, '0');
    if (bits[8] === '1' && boiler.relayEnergizedAlert) {
        alertParts.push('Alert on Alarm Relay Energized');
    }

    // Combine all alert messages
    alertParts.push(...tempMessages);

    // Only proceed if there's actually something to alert about
    const hasStateAlert = (data.state === 2 && boiler.lockoutErrorAlert) ||
        (data.state === 3 && boiler.holdErrorAlert) ||
        (bits[8] === '1' && boiler.relayEnergizedAlert);

    if (!hasStateAlert && !hasTemperatureAlert) return;

    let pushmessage = alertParts.join(', ');

    // Check disconnect status
    try {
        const siteinfo = await Site.find({ where: { id: siteid } });
        if (!siteinfo || siteinfo.length === 0) return;

        const nowInTZ = moment.tz(siteinfo[0].timeZone.zone);
        const lastReceivedDate = moment(record.receivedDate).tz(siteinfo[0].timeZone.zone);
        const isBoilerConnected = nowInTZ.diff(lastReceivedDate, 'hours') < 1;

        const disconnectflag = disconnectMap.get(String(boilerId)) || 0;

        if (!isBoilerConnected && disconnectflag === 1) return; // Already notified about disconnect

        if (!isBoilerConnected && disconnectflag === 0) {
            pushmessage = 'Disconnected';
            disconnectMap.set(String(boilerId), 1);
        } else if (isBoilerConnected) {
            disconnectMap.set(String(boilerId), 0);
        }

        // Get all users for this site
        const siteusers = await UserToSite.find({ where: { siteId: siteid } });

        for (const siteuser of siteusers) {
            if (siteuser.disableNotification) continue;

            try {
                const userWithDevices = await User.findById(siteuser.userId, {
                    include: { relation: "devices" }
                });

                if (!userWithDevices) continue;

                // Send email notification if enabled
                if (userWithDevices.emailNotifications && userWithDevices.email) {
                    const trimmedEmail = userWithDevices.email.trim();
                    const trimmedMessage = pushmessage.trim();
                    if (trimmedEmail && trimmedMessage) {
                        sendEmailNotification(trimmedEmail, boilerName, pushmessage, intervaltime);
                    }
                }

                // Send push notifications to devices
                const devices = userWithDevices.devices ? userWithDevices.devices() : [];
                // Deduplicate by deviceToken
                const seenTokens = new Set();
                const uniqueDevices = devices.filter(d => {
                    if (seenTokens.has(d.deviceToken)) return false;
                    seenTokens.add(d.deviceToken);
                    return true;
                });

                const trimmedMessage = pushmessage.trim();
                if (!trimmedMessage) continue;

                for (const device of uniqueDevices) {
                    if (device.status !== 1 && device.status !== '1') continue;

                    if (device.deviceType === 'iOS') {
                        sendIOSNotification(apnProvider, device.deviceToken, boilerName, pushmessage, intervaltime);
                    } else if (device.deviceType === 'Android') {
                        await sendAndroidNotification(device.deviceToken, boilerName, pushmessage, intervaltime);
                    }
                }
            } catch (err) {
                console.error('Error processing user notifications:', err);
            }
        }
    } catch (err) {
        console.error('Error in boiler notification processing:', err);
    }
}

/**
 * Main scheduled job: runs every 5 minutes.
 * Queries all boilers with alerts enabled, fetches latest readings,
 * and dispatches notifications as needed.
 */
function invoke() {
    schedule.scheduleJob('*/1 * * * *', async function () {
        app = require('../../server/server');
        const models = {
            Boiler: app.models.Boiler,
            UserToSite: app.models.UserToSite,
            User: app.models.User,
            Site: app.models.Site,
        };

        // Create a single APN provider per cron cycle (not per device)
        // const keyPath = path.join(__dirname, "../../server/prod/AuthKey_92N5KG4Y7T.p8");
        const apnOptions = {
            token: {
                key: "/home/ec2-user/harsco/server/key.p8",
                keyId: "8HFA37USR6",
                teamId: "84KLUUGWB3"
            },
            production: true
        };
        const apnProvider = new apn.Provider(apnOptions);

        try {
            const db = await new Promise((resolve, reject) => {
                models.Boiler.getDataSource().connector.connect((err, db) => {
                    if (err) reject(err);
                    else resolve(db);
                });
            });

            const boilers = await models.Boiler.find({ where: { alertsDisabled: true } });

            // Build a lookup map for boilers by ID
            const boilersById = new Map();
            for (const boiler of boilers) {
                boilersById.set(String(boiler.id), boiler);

                // Initialize disconnect tracking
                if (!disconnectMap.has(String(boiler.id))) {
                    disconnectMap.set(String(boiler.id), 0);
                }
            }

            // Filter to boilers that can actually generate alerts
            const alertableBoilers = boilers.filter(b => b.siteId && b.alertInterval > 0);

            const from = new Date(Date.now() - 3600000); // 1 hour ago

            // Process each boiler's latest record
            const recordPromises = alertableBoilers.map(boiler => {
                return db.collection('BoilerReadRecord').aggregate([
                    {
                        $match: {
                            boilerId: boiler.id,
                            receivedDate: { $gte: from, $lt: new Date() }
                        }
                    },
                    { $sort: { receivedDate: -1 } },
                    { $limit: 1 },
                    {
                        $project: {
                            _id: 1,
                            receivedDate: 1,
                            boilerId: 1,
                            receivedData: 1
                        }
                    }
                ]).toArray();
            });

            const allRecords = await Promise.all(recordPromises);

            for (const records of allRecords) {
                if (records.length > 0) {
                    await processBoilerRecord(records[0], boilersById, models, db, apnProvider);
                }
            }
        } catch (err) {
            console.error('Notification cron error:', err);
        } finally {
            apnProvider.shutdown();
        }
    });
}

function getTempType(type) {
    const entry = TEMP_TYPES[type];
    return entry ? entry.label : "Supply temperature";
}

function trim(x) {
    return x.replace(/^\s+|\s+$/gm, '');
}

async function testNotification() {
    const admin = require("firebase-admin");
    const msg = admin.messaging();

    const tokens = [
        'fiA7-LmySayuq6RYKc8PX6:APA91bHOmUifSN-2YqsC8ayTiPuDh_L6vvRPZB0ZQKJNKTYauxIk2QJ_g2xjy0YdkFGpRr5uGDZ7DLzlQp3aSpWq38iFUwfBciNtjlqvSVVQziEVShb97_E',
        'ePUEnTULQG23Vs_bL0U0d0:APA91bGi17kS_LhPPt0qj3gPuhSASXw5lzqm8QYRbKR9X59-bQZ8P1hkjYEdqNRrOGwpefhfXEXyDlQB00ZD22o5F_aodBZ2qNFC1qwBImKRi3qse0TIJpE'
    ];

    const message = {
        notification: {
            title: 'Test Notification',
            body: 'Sent via firebase-admin SDK',
        }
    };

    console.log('Sending message:', message);

    try {
        const responses = await Promise.all(
            tokens.map(token => msg.send({ ...message, token }))
        );
        console.log('✅ Sent to all tokens:', responses);
    } catch (err) {
        console.error('❌ Error sending to tokens:', err);
    }
}

function sendTestNotification(deviceToken, boilerName, pushNotification, site) {
    const keyPath = path.join(__dirname, "../../server/prod/AuthKey_92N5KG4Y7T.p8");

    const options = {
        token: {
            key: keyPath,
            keyId: "92N5KG4Y7T",
            teamId: "5K5L7AR5G2",
        },
        production: false,
    };

    const apnProvider = new apn.Provider(options);
    const note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.badge = 0;
    note.sound = "ping.aiff";
    note.alert = `${boilerName} at ${site[0].name}: ${pushNotification}`;
    note.payload = { messageFrom: "Nuro Connect" };
    note.topic = "com.vensi.harscopk";

    apnProvider.send(note, deviceToken)
        .then(response => {
            console.log("✅ APNs response:", response);
            if (response.failed && response.failed.length > 0) {
                console.error("❌ Failed tokens:", response.failed);
            }
        })
        .catch(err => {
            console.error("❌ APNs error:", err);
        })
        .finally(() => {
            apnProvider.shutdown();
        });
}

Notifications.invoke = invoke;
Notifications.test = testNotification;
Notifications.testIos = sendTestNotification;

module.exports = Notifications;