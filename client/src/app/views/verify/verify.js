/**
 * Created by home on 11/17/16.
 */

angular.module('harsco-pk')

    .controller('VerificationControl', [
        '$scope',
        '$timeout',
        '$state',
        'User',
        function ($scope, $timeout, $state,User) {

            console.log(User);
            var vm = this;
            vm.user = {};

            function success(data,error) {
                if(error) alert(error.message);
                else {
                    $state.go('verify');
                }
            };

            function fail(data,error) {

            }


            function register() {
                vm.user.realm = "";
                vm.user.challenges = {};
                vm.user.emailVerified = false;
                vm.user.status = 0;
                vm.user.created = new Date();
                vm.user.lastUpdated = new Date();
                vm.user.emailNotifications = true;

                if(vm.user.password == vm.user.c_password) {
                    delete vm.user.c_password;

                    var respose = User.create(vm.user);

                    respose.$promise.then(success,fail);
                }
            }

            vm.register = register;
        }

    ]);