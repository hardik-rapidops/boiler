
angular.module('harsco-pk')

    .controller('RegisterController', [
        '$scope',
        '$timeout',
        '$state',
        'ssSideNav',
        '$toast',
        '$stateParams',
        'User',
        'UserTitle',
        '$errors',
        '$user',
        '$mdDialog',
        function ($scope, $timeout, $state, ssSideNav,  $toast,$stateParams, User, UserTitle, $errors, $user,$mdDialog) {

            var vm = this;
            vm.user = {};
            vm.randomId = $stateParams.randomId;
            var userEmail = ""
            function verifyEmail($event){
                var emailexp =/^.+@.+\..+$/;
                if (vm.user.email && emailexp.test(vm.user.email)) {
                    vm.spinner = true;
                    userEmail = vm.user.email.toLowerCase().trim();
                    var params = {email:userEmail};
                    var respose = User.checkEmail(params,angular.noop,angular.noop);
                    respose.$promise.then(emailSuccess, emailFail);
                }
            }


            function emailSuccess(data,error) {
                vm.spinner = false;
                vm.disablesubmit=false;
                $scope.err4='';
                if(error) alert(error.message);
                else {
                   if (data.response.success == true){
                      $state.go('invite-user', {email:userEmail});
                   }
                   if(data.response.message.match(/Account already exist/)){
                        $scope.err4=data.response.message
                        vm.disablesubmit=true;
                   }
                }
            };

            // email not found
            function emailFail(data) {
                vm.spinner = false;
            }

            function keyDown ($event) {
                $scope.err1='';
                $scope.err2='';
                $scope.err3='';
                console.log($scope.err4);
                if(!vm.disablesubmit){
                    $scope.err4='';
                }
                $scope.err5='';
                $scope.err6='';
                $scope.err7='';
                $scope.err8='';
                if ($event.keyCode && $event.keyCode === 13) {
                  vm.register();
                }
            }

            function success(data,error) {
                vm.spinner = false;
                if(error) alert(error.message);
                else {
                    grecaptcha.reset();
                    delete vm.user.titledata;
                    $toast.show($toast.messages.REGISTER_SUCCESS,$toast.types.SUCCESS);
                    //alert(vm.user.email +" successful!");
                    $state.go('verify');
                }
            };

            function fail(data) {
                vm.spinner = false;
                grecaptcha.reset();
                if(data.status == 422) var message = "This email address is already registered, try logging in instead. If you've forgotten your password, click forgot password on the log in screen.";
                else if(data.status == 400) var message = "Unable validate you, please try again!!";
                $toast.show( message,$toast.types.ERROR);
            }



            function register() {
                vm.spinner = true;
                $scope.err1='';
                $scope.err2='';
                $scope.err3='';
                $scope.err4='';
                $scope.err5='';
                $scope.err6='';
                $scope.err7='';
                $scope.err8='';

                var response = grecaptcha.getResponse();
                var nameEXP =  /^[a-zA-Z ]*$/;
               // var emailexp = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
                // var emailexp =/^\w+([+-?\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
                var emailexp =/^.+@.+\..+$/;
                var passwordexp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*).{8,}$/;
                var recaptcha = angular.element('#g-recaptcha-response').val();

                vm.user.realm = "";
                vm.user.challenges = {};
                vm.user.emailVerified = false;
                vm.user.status = 0;
                vm.user.created = new Date();
                vm.user.lastUpdated = new Date();


                if (!vm.user.firstName) {
                    $scope.err1='* Enter First Name';
                    vm.spinner = false;
                    return false;
                }
                if (!nameEXP.test(vm.user.firstName)) {
                    $scope.err1='* Invalid Details';
                    vm.spinner = false;
                    return false;
                }
                if (!vm.user.lastName) {
                    $scope.err2='* Enter Last Name';
                    vm.spinner = false;
                    return false;
                }
                if (!nameEXP.test(vm.user.lastName)) {
                    $scope.err2='* Invalid Details';
                    vm.spinner = false;
                    return false;
                }
                if (!vm.user.company) {
                    $scope.err3='* Enter company Name';
                    vm.spinner = false;
                    return false;
                }

                /*
                Changed below line to if (!vm.user.email)  as assuming vm.randomId is not using anywhere now!
                if (!vm.user.email && vm.randomId.length == 0) {
                */

                if (!vm.user.email) {
                    $scope.err4='* Enter Email';
                    vm.spinner = false;
                    return false;
                }
                if (!emailexp.test(vm.user.email)) {
                    $scope.err4='* Invalid Email';
                    vm.spinner = false;
                    return false;
                }
                if (!vm.user.password ) {
                    $scope.err5='* Enter Password';
                    vm.spinner = false;
                    return false;
                }
                if (!passwordexp.test(vm.user.password)) {
                    $scope.err5 = '* Password must be at least 8 characters, one alpha, one numeric, one upper case and one lower case required.';
                    vm.spinner = false;
                    return false;
                }
                if (!vm.user.c_password ) {
                    $scope.err6='* Enter Confirm Password';
                    vm.spinner = false;
                    return false;
                }
                if (vm.user.password !== vm.user.c_password) {
                    $scope.err6 ='* Passwords don\'t match';
                    vm.spinner = false;
                    return false;
                }
                if (!vm.accept) {
                    $scope.err7='* You need to accept terms to sign up.';
                    vm.spinner = false;
                    return false;
                }
                
                if (response.length === 0) {
                    $scope.err8='* You need to accept reCaptcha.';
                    vm.spinner = false;
                    return false;
                }
                

                if(vm.user.password == vm.user.c_password) {
                    delete vm.user.c_password;

                    vm.user.title = vm.user.titledata.key;
                    vm.user.email = vm.user.email.toLowerCase().trim();
                    vm.user.captcha = recaptcha;
                    vm.user.emailNotifications = true;
                    vm.user.temperature = {
                        id : 0
                    };

                    var respose = User.create(vm.user);

                    respose.$promise.then(success,fail);
                }

            }

            function attach(data,error){
                vm.titledata = data;
                vm.user.titledata = vm.titledata[0];
            }

            function init() {
                var respose = UserTitle.find(angular.noop,angular.noop);
                respose.$promise.then(attach,angular.noop);
            }

            function DialogController($scope) {
                $scope.hide = function() {
                    console.log("HIDE");
                    $mdDialog.hide();
                };

                $scope.cancel = function() {
                    $mdDialog.cancel();
                };

                $scope.answer = function(answer) {
                    $mdDialog.hide(answer);
                };
            }


            function showEULA(ev) {
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'app/views/register/terms-and-conditions.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:true
                })
            };



            vm.register = register;
            vm.init = init;
            vm.keyDown = keyDown;
            vm.verifyEmail = verifyEmail;
            vm.showEULA = showEULA;
            vm.init();
        }

    ]);
