angular.module('harsco-pk')

    .controller('ProfileController', [
        '$scope', '$timeout', '$state', '$toast', '$storage', '$user', 'UserTitle', '$mdDialog', 'User', '$dialog',
        '$rootScope',

        function ($scope, $timeout, $state, $toast, $storage, $user, UserTitle, $mdDialog, User, $dialog,
                  $rootScope) {

            var vm = this;
            vm.model = {
                title :  'My Profile'
            };

            vm.user = {};
            vm.temp = [{ id: 0, name: 'Fahrenheit' }, { id: 1, name: 'Celsius' }];

            function keyDown ($event) {
                $scope.err1 = '';
                $scope.err2 = '';
                $scope.err3 = '';
                if ($event.keyCode && $event.keyCode === 13) {
                  vm.save();
                }
            }

            function attach(user) {
                vm.user  = user;

                if(vm.user.email == "demo@harscopk.com") vm.demo = true;

                var respose = UserTitle.find(angular.noop, angular.noop);
                respose.$promise.then(titlesuccess,angular.noop);
            }

            function goback() {
                //$user.logout();
                $state.go('login');
            }

            function titlesuccess(data,error){
                vm.titledata = data;
                vm.user.titledata = vm.titledata[vm.user.titledata.key];
                if(vm.user.temperature && vm.user.temperature.id){
                    vm.user.temperature = vm.temp[vm.user.temperature.id];
                } else{
                    vm.user.temperature = vm.temp[0];
                }
            }

            function init() {
                var user = $user.authorize(attach, goback);
            }

            function success(data,error) {

                $scope.vmr.user = vm.user;

                if(error) {
                    $toast.show($toast.messages.SAVE_USER_FAILED,$toast.types.ERROR);
                }
                else {
                    $toast.show($toast.messages.SAVE_USER_SUCCESS,$toast.types.SUCCESS);
                }
            }

            function fail(error) {
                console.log("FAILURE");
                $toast.show($toast.messages.SAVE_USER_FAILED,$toast.types.ERROR)
            }

            function save() {
                $scope.err1='';
                $scope.err2='';
                $scope.err3='';
                $scope.err4='';
                var nameEXP =  /^[a-zA-Z ]*$/;
                var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

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

                delete vm.user.$promise;
                if(vm.user.c_password) delete vm.user.c_password;

               // vm.user.lastUpdate = new Date();
                delete vm.user.roles;
                delete vm.user.devices;
                delete vm.user.passwordKey;
                delete vm.user.lastUpdate;
                $user.replace(vm.user,success,fail);
            }

            function redirect() {
                $state.go('login');
            }

            function stay() {
            }

            function DialogController($scope, $mdDialog, items) {
                $scope.items = items;
                $scope.closeDialog = function() {
                    $mdDialog.hide();
                };
                $scope.confirmLogout = function(){
                    $user.logout(redirect,stay);
                    $mdDialog.hide();
                }
            }

            function changePassword($event) {
                $dialog.show($dialog.templates.PASSWORD_CHANGE, $event);
            }

            vm.confirmChange = function ($event) {
                var params = {email:vm.user.email};
                User.changePassword(params).$promise.
                    then(
                    function(data) {//console.log(data);
                    },
                    function(error) {//console.log(error);
                    }
                );
                $toast.show($toast.messages.CHANGE_PASSWORD_SUCCESS,$toast.types.SUCCESS);
                $mdDialog.hide();
            };

            function isNumberKey(e){
                var charCode = (e.which) ? e.which : e.keyCode;
                if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)){
                    e.preventDefault();
                    return false;
                }
            }

            vm.save = save;
            vm.init = init;
            vm.isNumberKey = isNumberKey;
            vm.changePassword = changePassword;
            vm.keyDown = keyDown;

            $rootScope.confirmChange=vm.confirmChange;

            vm.init();
        }
    ]);
