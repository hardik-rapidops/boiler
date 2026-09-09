/**
 * Created by home on 12/1/16.
 */

angular.module('harsco-pk')

    .controller('ResetPasswordController', [
        '$scope',
        '$timeout',
        '$state',
        '$stateParams',
        'ssSideNav',
        '$toast',
        'User',
        function ($scope, $timeout, $state, $stateParams, ssSideNav,  $toast, User) {

            var vm = this;
            vm.user = {};
            $scope.err3 = "";
            $scope.isExpiry = false;
            var checkTime = moment().valueOf();
            if(checkTime >= $stateParams.time) {
                $scope.err3 = 'The password reset link has expired'
                $scope.isExpiry = true
            }

            function success(data) {
                $toast.show($toast.messages.RESET_PASSWORD_SUCCESS,$toast.types.SUCCESS);
                $state.go('login');
            };

            function fail(data) {
                $toast.show($toast.messages.RESET_PASSWORD_FAILED,$toast.types.ERROR);
            }

            function submit() {
                $scope.err1='';
                $scope.err2='';

                var passwordexp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*).{8,}$/;

                if (!vm.password ) {
                    $scope.err1='* Enter Password';
                    return false;
                }
                if (!passwordexp.test(vm.password)) {
                    $scope.err1 = '* Password must be at least 8 characters, one alpha, one numeric, one upper case and one lower case required.';
                    return false;
                }
                if (!vm.c_password ) {
                    $scope.err2='* Enter Confirm Password';
                    return false;
                }
                if (vm.password !== vm.c_password) {
                    $scope.err2 ='* Passwords don\'t match';
                    return false;
                }

                var params = {password:vm.password,passwordKey:$stateParams.passwordKey};
                var respose = User.reset(params);
                respose.$promise.then(success,fail);
            }

            vm.submit = submit;

        }

    ]);