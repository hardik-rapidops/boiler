// CommonJS package manager support


(function (window, angular, undefined) {
    'use strict';

    var module = angular.module("harsco-pk");

    /**
     *
     * User factory
     * User factory is the middleware for all the modules,
     * All the controllers can access user data from here,
     *
     */

    module.factory(
        "$user", ['$storage', '$q', 'User', 'Boiler', 'Site', 'LoopBackAuth', function ($storage, $q, User, Boiler, Site, LoopBackAuth) {

            var user,
                access_token = null,
                user_id = null,
                authorized = false,
                isApp = false,
                isIos = false;

            function setUser(data) {
                user = data;
                localStorage.setItem("user-data", JSON.stringify(data));
            }

            function getUser() {
                return LoopBackAuth.currentUserData ? LoopBackAuth.currentUserData : localStorage.getItem("user-data") ? JSON.parse(localStorage.getItem("user-data")) : null;
            }

            function getBoiler(boilerID) {
                var params = {
                    "id": boilerID
                };

                return Boiler.findById(params).$promise;
            }

            function getSite(siteID) {
                var site_filter = {
                    filter: {
                        where: {
                            id: siteID
                        }
                    }
                };
                return Site.find(site_filter).$promise;
            }


            function getAccessId() {
                return LoopBackAuth.accessTokenId;
            }


            function getUserId() {
                return LoopBackAuth.currentUserId;
            }


            function getAuthorize() {
                return LoopBackAuth.currentUserId != undefined;
            }

            function updateUser(user) {
                setUser(user);
            }

            var ok = function (_user) {
                setUser(_user);
                LoopBackAuth.currentUserData = _user;
            };

            function authorize(success, fail) {
                if(!LoopBackAuth.currentUserId){
                    return fail();
                }
                var params = {
                    id: LoopBackAuth.currentUserId,
                    filter: {
                        include: ['roles', 'devices']

                    }
                };
                var promise = User.findById(
                    params,
                    ok,
                    angular.noop
                ).$promise;

                promise.then(success, fail);
            }

            function logout(ok, fail) {
                var params = {
                    access_token: LoopBackAuth.accessTokenId
                };
                User.logout(params, ok, fail)
            }

            function get_me() {
                return  getUser();
            }

            function replace(data, ok, fail) {
                var params = {
                    id: LoopBackAuth.currentUserId
                };
                User.prototype$patchAttributes(params,data).$promise.
                    then(ok,fail);
            }

            // TODO - Move it to notifications factory.. all the device stuff should goto one factory
            function isAppCheck() {
                var standalone = window.navigator.standalone,
                    userAgent = window.navigator.userAgent.toLowerCase(),
                    safari = /safari/.test(userAgent),
                    ios = /iphone|ipod|ipad/.test(userAgent),
                    androidversion = /version/.test(userAgent),
                    android = /android/.test(userAgent);
                if (ios) {
                    if (!standalone && !safari) {
                        isApp = true;
                    }
                } else {
                    if (androidversion && android) {
                        isApp = true;
                    }
                }

                return isApp;
            }

            function isApptype() {
                var standalone = window.navigator.standalone,
                    userAgent = window.navigator.userAgent.toLowerCase(),
                    safari = /safari/.test(userAgent),
                    ios = /iphone|ipod|ipad/.test(userAgent),
                    androidversion = /version/.test(userAgent),
                    android = /android/.test(userAgent);
                if (ios) {
                    if (!standalone && !safari) {
                        isIos = true;
                    }
                } else {
                    if (androidversion && android) {
                        isIos = false;
                    }
                }

                return isIos;
            }

            var me = {};

            me.user = getUser();
            me.boilerdata = getBoiler;
            me.sitedata = getSite;
            me.authorize = authorize;
            me.logout = logout;
            me.get = get_me;
            me.replace = replace;
            me.getUserId = getUserId;
            me.getUser = getUser;
            me.updateUser = updateUser;
            me.getAccessId = getAccessId;
            me.isApp = isAppCheck();
            me.isIos = isApptype();

            return me;

        }]
    );

})(window, window.angular);
