angular.module('harsco-pk')

    .controller('VerifysuccessControl', [
        '$scope',
        '$timeout',
        '$state',
        '$stateParams',
        '$mdToast',
        'User',
        function ($scope, $timeout, $state, $stateParams,$mdToast, User) {

            var vm = this;
            vm.user = {};
            vm.verifysuccess = true;

            function verified(result) {
                vm.verifysuccess = true;
            }

            function failed(result) {
                vm.verifysuccess = false;
                $mdToast.show(
                    $mdToast.simple()
                        .position('top')
                        .textContent("Email verification failed. Please try with different email!!")
                        .hideDelay(3000)
                );
            }

            function init() {
                var params = {
                    uid: $stateParams.id,
                    token: $stateParams.token

                };

                var promise = User.confirm(params, angular.noop, angular.noop).$promise;

                promise.then(verified,failed);
            }

            vm.init = init;

            vm.init();


        }

    ]);