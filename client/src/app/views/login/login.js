angular.module('harsco-pk')

    .controller('LoginController', [
        '$scope',
        '$timeout',
        '$state',
        '$toast',
        '$storage',
        'User',
        '$user',
        '$notifications',
        'localStorageService',
        '$sharedMethods',
        function ($scope, $timeout, $state, $toast, $storage, User, $user, $notifications, localStorageService, $sharedMethods) {

            var vm = this;
            vm.user = {};
            vm.captchadisplay=true;
            if(!localStorageService.get('fail_attempts')){
                localStorageService.set('fail_attempts', 0);
            }
            if(localStorageService.get('fail_attempts')>=3) {
                vm.captchadisplay = false;
            }

            // Code to keep the device alive, not to lock or black the screen
            // setTimeout(function () {
            //     window.plugins.insomnia.keepAwake();
            // }, 5000);

            function keyDown ($event) {
                $scope.err1 = '';
                $scope.err2 = '';
                if ($event.keyCode && $event.keyCode === 13) {
                  vm.login();
                }
            }

            function showToast(displayText) {
                $mdToast.show(
                    $mdToast.simple()
                        .position('top')
                        .textContent(displayText)
                        .hideDelay(3000)
                );
            }

            function redirect() {
                // $notifications.registerPushNotifications();
                $notifications.checkAndRegisterPushPermission();
                localStorageService.set('fail_attempts', 0);
                vm.captchadisplay = true;
                $state.go('common.boilers');
            }

            function stay() {

            }


            function init() {
                $user.authorize(redirect,stay);
            }

            function success(data,error) {
                vm.spinner = false;
                // alert("Login success callback triggered");
                console.log("Login callback fired:", data, error);
                if(error){
                    localStorageService.set('fail_attempts', localStorageService.get('fail_attempts')+1);
                    if(localStorageService.get('fail_attempts')>=3) {
                        vm.captchadisplay = false;
                    }
                    $toast.show($toast.messages.LOGIN_FAILED,$toast.types.ERROR);
                } else {
                    $sharedMethods.setLoginInit(true);
                    localStorageService.set('fail_attempts', 0);
                    vm.captchadisplay = true;
                    console.log('[$user.isApp]',$user.isApp);
                    $state.go('common.boilers');
                    if($user.isApp){
                        // $notifications.registerPushNotifications();
                        $notifications.checkAndRegisterPushPermission();
                    }
                }
            }

            function fail(data) {
                vm.spinner = false;
                var message = $toast.messages[data.data.error.code] || $toast.messages.LOGIN_FAILED;
                localStorageService.set('fail_attempts', localStorageService.get('fail_attempts')+1);
                if(localStorageService.get('fail_attempts')>=3) {
                    vm.captchadisplay = false;
                }
                vm.user.password = '';
                $toast.show(message,$toast.types.ERROR);
            }

            function login() {
                vm.spinner = true;
                $scope.err1 = '';
                $scope.err2 = '';
                var response = grecaptcha.getResponse();
                //$scope.isChecked = $('#rem').prop('checked') ? true : false;
               // var emailexp = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
                // var emailexp =/^\w+([+-?\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
                var emailexp =/^.+@.+\..+$/;
                var recaptcha = angular.element('#g-recaptcha-response').val();
                
                if (!vm.user.email) {
                    $scope.err1 = '* Email is required';
                    vm.spinner = false;
                    return false;
                }
                if (!emailexp.test(vm.user.email)) {
                    $scope.err1 = '* Invalid Email';
                    vm.spinner = false;
                    return false;
                }
                if (!vm.user.password) {
                    $scope.err2 = '* Password is required';
                    vm.spinner = false;
                    return false;
                }

                
                if (response.length === 0 && !vm.captchadisplay) {
                    $scope.err8='* You need to accept reCaptcha.';
                    vm.spinner = false;
                    return false;
                }
                

                var params = { rememberMe: (vm.rememberMe  || false) };

                vm.user.email = vm.user.email.toLowerCase().trim();
                var response = User.login(params,vm.user,
                    angular.noop,
                    angular.noop);

                response.$promise.then(success,fail);
            }

            vm.init = init;
            vm.login = login;
            vm.keyDown = keyDown;

            vm.init();

            vm.captchaClicked = function() {
                console.log("Changed");
            }
        }
    ]);
