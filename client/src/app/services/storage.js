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
        "$storage", ['localStorageService', function (localStorageService) {

            var keys = {
                USER_ID: 'user_id',
                TOKEN: 'access_token'
            };

            function setItem(key, value) {
                localStorageService.set(key, value);
            }

            function getItem(key) {
                return localStorageService.get(key) || null;
            }

            function removeItem(key) {
                return localStorageService.remove(key);
            }

            function removeAll() {
                return localStorageService.clearAll();
            }

            var service = {};

            service.keys = keys;
            service.get = getItem;
            service.set = setItem;
            service.remove = removeItem;
            service.removeAll = removeAll;

            return service;
        }]
    );

})(window, window.angular);
