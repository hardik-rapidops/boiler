// CommonJS package manager support


(function (window, angular, undefined) {
    'use strict';

    var module = angular.module("harsco-pk");

    /**
     *
     * Storage factory
     * Here, we are holding all the keys to save in localstorage
     * also, the methods to store, get, remove items from localstorage.
     * we will clear out all the values once the user logs out.
     *
     */
    module.factory(
        "$notifications", ['$rootScope', 'LoopBackAuth', 'User', '$user', '$toast', 'localStorageService', function ($rootScope, LoopBackAuth, User, $user, $toast, localStorageService) {



            function success(data, error) {
                console.log('sent device token successfully');
            }

            function fail(error) {
                console.log('Unable send device token');
            }

            var notificationobj = {
                /* Sending Device token to the database for sending the push notifications by server.*/
                sendDeviceTokenToDB: function (device_token) {
                    var newdeviceData = {
                        deviceType: device.platform,
                        deviceName: device.model,
                        deviceToken: device_token,
                        deviceUUID: device.uuid,
                        status: 1,
                    };
                    var deviceData = {
                        deviceType: device.platform,
                        deviceName: device.model,
                        deviceToken: device_token,
                        deviceUUID: device.uuid,
                    };
                    var userId = {
                        id: LoopBackAuth.currentUserId,
                    };
                    var filter = {
                        id: $user.getUserId(),
                        filter: { where: { deviceUUID: device.uuid } },
                    };
                    // TODO user createOrUpdate for device relation
                    User.devices(filter).$promise.then(function (data) {
                        if (data.length == 0) {
                            var devices = User.devices.create(
                                userId,
                                newdeviceData
                            ).$promise;
                            devices.then(success, fail);
                        } else {
                            var params = {
                                id: $user.getUserId(),
                                fk: data[0].id,
                            };
                            var devices = User.devices.updateById(
                                params,
                                deviceData
                            ).$promise;
                            devices.then(success, fail);
                        }
                    });
                },

                /* Register for Push Notifications
                    . Android - We need to give the sendorId/ProjectId:123456789, also update api key into server
                    . iOS - all will take care with certificates from developer.apple.com
                */

                registerPushNotifications: function () {
                    console.log("[registerPushNotifications] called");

                    if (!checkIfIsDevice()) {
                        console.log(
                            "[registerPushNotifications] Not running on a device. Exiting."
                        );
                        return;
                    }

                    if (
                        typeof FirebasePlugin.setAutoInitEnabled === "function"
                    ) {
                        console.log(
                            "[registerPushNotifications] Enabling Firebase Auto Init"
                        );
                        FirebasePlugin.setAutoInitEnabled(true);
                    }

                    console.log(
                        "[registerPushNotifications] Detecting platform..."
                    );
                    var platform = device.platform
                        ? device.platform.toLowerCase()
                        : "unknown";
                    console.log(
                        "[registerPushNotifications] Platform:",
                        platform
                    );

                    // ✅ Fetch token depending on platform
                    if (platform === "ios") {
                        console.log(
                            "[registerPushNotifications] Getting APNs token for iOS..."
                        );
                        FirebasePlugin.getAPNSToken(
                            function (apnsToken) {
                                if (apnsToken) {
                                    console.log(
                                        "[registerPushNotifications] APNs token received:",
                                        apnsToken
                                    );
                                    localStorageService.set(
                                        "FirebaseToken",
                                        apnsToken
                                    );
                                    notificationobj.sendDeviceTokenToDB(
                                        apnsToken
                                    );
                                } else {
                                    console.warn(
                                        "[registerPushNotifications] No APNs token returned, fallback to Firebase token..."
                                    );
                                    // fallback in rare cases if APNs not ready
                                    FirebasePlugin.getToken(
                                        function (token) {
                                            console.log(
                                                "[registerPushNotifications] Firebase FCM token fallback:",
                                                token
                                            );
                                            localStorageService.set(
                                                "FirebaseToken",
                                                token
                                            );
                                            notificationobj.sendDeviceTokenToDB(
                                                token
                                            );
                                        },
                                        function (error) {
                                            console.error(
                                                "[registerPushNotifications] Failed to get Firebase fallback token:",
                                                error
                                            );
                                        }
                                    );
                                }
                            },
                            function (error) {
                                console.error(
                                    "[registerPushNotifications] Failed to get APNs token:",
                                    error
                                );
                            }
                        );
                    } else {
                        console.log(
                            "[registerPushNotifications] Getting Firebase token for Android..."
                        );
                        FirebasePlugin.getToken(
                            function (token) {
                                console.log(
                                    "[registerPushNotifications] Firebase token received:",
                                    token
                                );
                                localStorageService.set("FirebaseToken", token);
                                notificationobj.sendDeviceTokenToDB(token);
                            },
                            function (error) {
                                console.error(
                                    "[registerPushNotifications] Failed to get Firebase token:",
                                    error
                                );
                            }
                        );
                    }

                    // 🔔 Foreground message listener
                    console.log(
                        "[registerPushNotifications] Setting up foreground message listener..."
                    );
                    FirebasePlugin.onMessageReceived(
                        function (payload) {
                            console.log(
                                "[registerPushNotifications] Message received:",
                                payload
                            );

                            if (payload && payload.body) {
                                $toast.show(payload.body, $toast.types.SUCCESS);

                                if (payload.sound) {
                                    console.log(
                                        "[registerPushNotifications] Playing sound"
                                    );
                                    var snd = new Media(
                                        "/android_asset/Chord.mp3"
                                    );
                                    snd.play();
                                }
                            }
                        },
                        function (error) {
                            console.error(
                                "[registerPushNotifications] onMessageReceived error:",
                                error
                            );
                        }
                    );

                    // 🔁 Token refresh listener
                    console.log(
                        "[registerPushNotifications] Setting up token refresh listener..."
                    );
                    FirebasePlugin.onTokenRefresh(
                        function (newToken) {
                            console.log(
                                "[registerPushNotifications] Token refreshed:",
                                newToken
                            );
                            localStorageService.set("FirebaseToken", newToken);
                            notificationobj.sendDeviceTokenToDB(newToken);
                        },
                        function (error) {
                            console.error(
                                "[registerPushNotifications] onTokenRefresh error:",
                                error
                            );
                        }
                    );

                    console.log("[registerPushNotifications] setup complete");
                },
                checkAndRegisterPushPermission: function () {
                    console.log("[checkAndRegisterPushPermission] called");

                    if (
                        window.FirebasePlugin &&
                        typeof FirebasePlugin.hasPermission === "function"
                    ) {
                        console.log(
                            "[checkAndRegisterPushPermission] Checking Firebase messaging permission..."
                        );

                        FirebasePlugin.hasPermission(
                            function (granted) {
                                if (granted) {
                                    console.log(
                                        "[checkAndRegisterPushPermission] Permission already granted."
                                    );
                                    notificationobj.registerPushNotifications();
                                } else {
                                    console.warn(
                                        "[checkAndRegisterPushPermission] Permission not granted yet."
                                    );
                                    // Optional: request if needed
                                    FirebasePlugin.grantPermission(
                                        function (grantedAgain) {
                                            if (grantedAgain) {
                                                console.log(
                                                    "[checkAndRegisterPushPermission] Permission granted after prompt."
                                                );
                                                notificationobj.registerPushNotifications();
                                            } else {
                                                console.warn(
                                                    "[checkAndRegisterPushPermission] User denied permission again."
                                                );
                                            }
                                        },
                                        function (err) {
                                            console.error(
                                                "[checkAndRegisterPushPermission] Error requesting permission:",
                                                err
                                            );
                                        }
                                    );
                                }
                            },
                            function (err) {
                                console.error(
                                    "[checkAndRegisterPushPermission] Error checking permission:",
                                    err
                                );
                            }
                        );
                    } else {
                        console.warn(
                            "[checkAndRegisterPushPermission] FirebasePlugin not available."
                        );
                        notificationobj.registerPushNotifications();
                    }
                },
            };

            function checkIfIsDevice() {
                var standalone = window.navigator.standalone,
                    userAgent = window.navigator.userAgent.toLowerCase(),
                    safari = /safari/.test(userAgent),
                    ios = /iphone|ipod|ipad/.test(userAgent),
                    androidversion = /version/.test(userAgent),
                    android = /android/.test(userAgent);
                if (ios) {
                    if (!standalone && safari) {
                        return false;
                    } else if (standalone && !safari) {
                        return true
                    } else if (!standalone && !safari) {
                        return true;
                    }
                } else {
                    //not iOS
                    if (androidversion && android) {
                        return true;
                    } else {
                        //browser
                        return false;
                    }
                }
            }

            notificationobj.checkIfIsDevice = checkIfIsDevice;

            return notificationobj;
        }]
    );

})(window, window.angular);
