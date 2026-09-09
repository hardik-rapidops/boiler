(function (window, angular, undefined) {
    'use strict';

    var module = angular.module("harsco-pk");

    module.factory(
        "$sharedMethods", function () {

            function prettyDate(time, timezone) {

                if (timezone) {
                    var dbTime = new Date(time).toLocaleString('en-US', {timeZone: timezone});
                    var today = new Date().toLocaleString('en-US', {timeZone: timezone});
                }
                else {
                    var dbTime = new Date(time);
                    var today = new Date().getTime();
                }
                var dateadded = dbTime.getTime();

                var diffMs = (today - dateadded);
                var diffDays = Math.floor(diffMs / 86400000); // days
                var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
                var diffMins = Math.floor(((diffMs % 86400000) % 3600000) / 60000); // minutes
                var diffSecs = Math.floor((((diffMs % 86400000) % 3600000) % 60000) / 1000); // seconds
                if (diffDays > 5) {
                    var yyyy = dbTime.getFullYear().toString();
                    var mm = (dbTime.getMonth() + 1).toString(); // getMonth() is zero-based
                    var dd = dbTime.getDate().toString();
                    return (yyyy + '-' + (mm[1] ? mm : '0' + mm[0]) + '-' + (dd[1] ? dd : '0' + dd[0]));
                } else if (diffDays >= 2 && diffDays <= 5) {

                    return (diffDays + ' days ago ');
                } else if (diffDays >= 1 && diffDays < 2) {

                    return (' yesterday ');
                } else if (diffHrs >= 2 && diffHrs < 24) {

                    return (diffHrs + ' hours ago ');
                } else if (diffHrs >= 1 && diffHrs < 2) {

                    return (' an hour ago ');
                } else if (diffMins >= 2 && diffMins <= 59) {

                    return (diffMins + ' minutes ago ');
                } else if (diffMins >= 1 && diffMins < 2) {

                    return (' a minute ago ');
                } else if (diffSecs > 1 && diffSecs <= 59) {

                    return (diffSecs + ' secs ago ');
                } else if (diffSecs == 1) {

                    return (diffSecs + ' sec ago ');
                } else if (diffSecs < 0) {
                    return ( -(diffSecs) + " secs ago");
                }
                else {
                    return "Just now"
                }
            }


            var loginInit = false;
            var sharedMethods = {};

            function random(max) {
                return Math.random().toString(36).substr(2, max);
            }

            function setLoginInit(bool) {
                loginInit = bool;
            }

            function getLoginInit() {
                return loginInit;
            }

            sharedMethods.random = random;
            sharedMethods.prettyDate = prettyDate;
            sharedMethods.setLoginInit = setLoginInit;
            sharedMethods.getLoginInit = getLoginInit;

            return sharedMethods;
        }
    );

})(window, window.angular);
