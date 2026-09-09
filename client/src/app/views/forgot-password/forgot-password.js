/**
 * Created by home on 12/1/16.
 */

angular.module('harsco-pk')
    .controller('ForgotPasswordController', [
        '$scope',
        '$timeout',
        '$state',
        'ssSideNav',
        '$toast',
        'User',
        function ($scope, $timeout, $state, ssSideNav,  $toast, User) {

            var vm = this;
            vm.user = {};
            vm.enablesubmit=false;

            function keyDown ($event) {
                $scope.err1='';
                $scope.err2='';
                if ($event.keyCode && $event.keyCode === 13) {
                  vm.register();
                }
            }

            function success(data) {
                vm.spinner = false;
                vm.email = "";
                grecaptcha.reset();
                $toast.show($toast.messages.FORGOT_PASSWORD_SUCCESS,$toast.types.SUCCESS);
                vm.enablesubmit=false;
                $state.go('login');
            };

            function fail(data) {
                vm.spinner = false;
                vm.email = "";
                grecaptcha.reset();
                $toast.show($toast.messages.FORGOT_PASSWORD_FAILED,$toast.types.ERROR);
                vm.enablesubmit=false;
            }


            function submit() {
                vm.spinner = true;
                $scope.enablesubmit=true;
                $scope.err1='';
                $scope.err2='';
                var response = grecaptcha.getResponse(); 
                //var emailexp = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
                // var emailexp =/^\w+([+-?\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
                var emailexp =/^.+@.+\..+$/;
                var recaptcha = angular.element('#g-recaptcha-response').val();

                if (!vm.email ) {
                    $scope.err1='* Enter Email';
                    vm.spinner = false;
                    return false;
                }
                if (!emailexp.test(vm.email)) {
                    $scope.err1='* Invalid Email';
                    vm.spinner = false;
                    return false;
                }
                
                if (response.length === 0) {
                    $scope.err2='* You need to accept reCaptcha.';
                    vm.spinner = false;
                    return false;
                }
                

                vm.email = vm.email.toLowerCase().trim();

                var params = {email:vm.email,captcha:recaptcha};
                vm.enablesubmit=true;
                var respose = User.forgotPassword(params,angular.noop,angular.noop);
                respose.$promise.then(success,fail);
            }

            vm.submit = submit;
            vm.keyDown = keyDown;
        }

    ]);
