'use strict';

angular.module('harsco-pk')

    .controller('HomeCtrl', [
        '$scope',
        '$timeout',
        '$state',
        'ssSideNav',
        '$mdSidenav',
        function ($scope, $timeout, $state, ssSideNav, $mdSidenav) {

            $scope.loginClick = function () {
                $state.go('common.boilers');
            };

            $scope.login = function () {
                console.log("login");
                $state.go('login');
            };

            $scope.forgotpassword = function () {
                $state.go('forgot-password');
            };

            $scope.register = function () {
                $state.go('register');
            };

            $scope.verify = function () {
                $state.go('verify');
            };

            $scope.BoilerMain_Support = function () {

            }
        }
    ]);
