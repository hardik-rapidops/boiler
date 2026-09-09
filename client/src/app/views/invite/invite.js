
angular.module('harsco-pk')

    .controller('InviteController', [
        '$scope',
        '$timeout',
        '$state',
        '$stateParams',
        'ssSideNav',
        '$toast',
        'User',
        'UserTitle',
        '$errors',
        '$user',
        '$q',
        function ($scope, $timeout, $state, $stateParams, ssSideNav,  $toast, User, UserTitle, $errors, $user,$q) {

            var vm = this;
            vm.user = {};


            function keyDown ($event) {
                $scope.err1='';
                $scope.err2='';
                $scope.err3='';
                $scope.err4='';
                $scope.err5='';
                $scope.err6='';
                $scope.err7='';
                $scope.err8='';
                if ($event.keyCode && $event.keyCode === 13) {
                  vm.register();
                }
            }

            function success(data,error) {
                if(error) alert(error.message);
                else {
                    grecaptcha.reset();
                    delete vm.user.titledata;

                    var params = {
                        uid: $stateParams.id,
                        token: $stateParams.token
                    };
                    User.confirm(params).$promise.then(function(data) {

                        $toast.show($toast.messages.REGISTER_SUCCESS,$toast.types.SUCCESS);
                        $state.go('login');

                    });
                    //alert(vm.user.email +" successful!");
                }
            };

            function fail(data) {
                grecaptcha.reset();
                if(data.status == 422) var message = "Unable to register. Please try with different email!!";
                else if(data.status == 400) var message = "Unable validate you, please try again!!";
                $toast.show( message,$toast.types.ERROR);
            }

            function register() {
                $scope.err1='';
                $scope.err2='';
                $scope.err3='';
                $scope.err4='';
                $scope.err5='';
                $scope.err6='';
                $scope.err7='';
                $scope.err8='';

                var nameEXP =  /^[a-zA-Z ]*$/;
                // var emailexp = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
                var emailexp =/^.+@.+\..+$/;
                var passwordexp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*).{8,}$/;
                var recaptcha = angular.element('#g-recaptcha-response').val();

                vm.user.realm = "";
                vm.user.challenges = {};
                vm.user.emailVerified = !!!$stateParams.randomId;
                vm.user.status = 0;
                vm.user.created = new Date();
                vm.user.lastUpdated = new Date();


                if (!vm.user.firstName) {
                    $scope.err1='* Enter First Name';
                    return false;
                }
                if (!nameEXP.test(vm.user.firstName)) {
                    $scope.err1='* Invalid Details';
                    return false;
                }
                if (!vm.user.lastName) {
                    $scope.err2='* Enter Last Name';
                    return false;
                }
                if (!nameEXP.test(vm.user.lastName)) {
                    $scope.err2='* Invalid Details';
                    return false;
                }
                if (!vm.user.company) {
                    $scope.err3='* Enter company Name';
                    return false;
                }

                if (!vm.user.password ) {
                    $scope.err5='* Enter Password';
                    return false;
                }
                if (!passwordexp.test(vm.user.password)) {
                    $scope.err5 = '* Password must be at least 8 characters, one alpha, one numeric, one upper case and one lower case required.';
                    return false;
                }
                if (!vm.user.c_password ) {
                    $scope.err6='* Enter Confirm Password';
                    return false;
                }
                if (vm.user.password !== vm.user.c_password) {
                    $scope.err6 ='* Passwords don\'t match';
                    return false;
                }
                if (!vm.accept) {
                    $scope.err7='* You need to accept terms to sign up.';
                    return false;
                }
                if (!recaptcha) {
                    $scope.err8='* You need to accept reCaptcha.';
                    return false;
                }
                if(vm.user.password == vm.user.c_password) {
                    delete vm.user.c_password;

                    vm.user.title = vm.user.titledata.key;
                    vm.user.captcha = recaptcha;
                    vm.user.emailNotifications = true;
                    vm.user.temperature = {
                        id : 0
                    };

                    vm.user.id = $stateParams.id;
                    var where = {where: {id:$stateParams.id}};

                    var respose = User.upsertWithWhere(where,vm.user).$promise;

                    respose.then(success,fail);
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


            vm.register = register;
            vm.init = init;
            vm.keyDown = keyDown;
            vm.init();
        }

    ]);
