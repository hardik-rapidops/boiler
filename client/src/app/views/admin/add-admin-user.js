
angular.module('harsco-pk')
    .controller('addAdminUsersController', [
        '$scope',
        '$timeout',
        '$state',
        '$toast',
        '$user',
        'User',
        'Boiler',
        'Site',
        '$mdDialog',
        '$stateParams',
        'UserTitle',
        'UserToSite',
        'RoleMapping',
        'Role',
        'LoopBackAuth',
        function ($scope, $timeout, $state, $toast, $user, User, Boiler, Site, $mdDialog, $stateParams, UserTitle, UserToSite,RoleMapping,Role, LoopBackAuth) {

            var vm = this;

            vm.model = {
                title: 'Add user'
            };
            var invitationcount=0;

            function success(data) {
                var params = {"principalType": 'USER',principalId:data.response.id,roleId:vm.role};
                var result = RoleMapping.create(params).$promise;
                result.then(successroleassign, fail);

            }

            function successroleassign(data) {
                invitationcount++;
                var emailslist = vm.email;
                var emails = emailslist.split(',');
                if(invitationcount==emails.length) {
                    $toast.show($toast.messages.INVITATION_SUCCESS, $toast.types.SUCCESS);
                }
                $state.go('common.admin-users');
            }

            function fail(error){
                $toast.show($toast.messages.INVITATION_FAIL, $toast.types.ERROR);
            }

            function init(){
                var result = Role.find().$promise;
                result.then(successroles, fail);
            }
            function successroles(data){

                vm.role = data;
                vm.roleslist = data;
            }

            function keyDown ($event) {
                $scope.err1='';
                $scope.err2='';

                if ($event.keyCode && $event.keyCode === 13) {
                    vm.invite();
                }
            }

            vm.emailStatusSuccess = null;

            vm.onEmailBlur = function () {
                if (vm.email) {
                User.isUserExist({ email: vm.email },
                    function success(response) {
                    console.log('Email check response:', response);
                    vm.emailStatusSuccess = (response.response.message.includes('already exist') || response.response.message.includes('pending')) ? false : true;
                        if(vm.emailStatusSuccess == false){
                            $scope.err1 = response.response.message;
                            return false;
                        }
                    },
                    function error(err) {
                    console.error('Error checking email:', err);
                    vm.emailStatusSuccess = false;
                    return false;
                    });
                }
            };

            function invite(){
                $scope.err1='';
                $scope.err2='';
               // var emailexp = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
               // var emailexp =/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                var emailexp =/^.+@.+\..+$/;

                if (!vm.email ) {
                    $scope.err1='* Enter Email';
                    return false;
                }else if (vm.email) {
                    User.isUserExist({ email: vm.email },
                        function success(response) {
                        console.log('Email check response:', response);
                        vm.emailStatusSuccess = (response.response.message.includes('already exist') || response.response.message.includes('pending')) ? false : true;
                        $scope.err1 = response.response.message;
                        },
                        function error(err) {
                        console.error('Error checking email:', err);
                        vm.emailStatusSuccess = false;
                        return false;
                        });

                        if(vm.emailStatusSuccess == false){
                            return false;
                        }
                }

                var emailslist = vm.email;

                var emails = emailslist.split(',');
                for (var i = 0; i < emails.length; i++) {
                    if (emails[i] != '') {
                        if (!emailexp.test(emails[i])) {
                            $scope.err1='* Invalid Email';
                            return false;
                        }
                    }
                }
                vm.parent = $scope.vmr;

                if (!angular.isString(vm.role)) {
                    $scope.err2='* Select role';
                    return false;
                }else{
                    for(var inc=0;inc<vm.roleslist.length;inc++){
                        if(vm.roleslist[inc].id==vm.role){
                            if(vm.roleslist[inc].name=='pkAdmin' && vm.parent.user.roles[0].name=='pkTech'){
                                $toast.show($toast.messages.INVITATION_FAIL, $toast.types.ERROR);
                                return false;
                            }
                        }
                    }
                }
                for (var i = 0; i < emails.length; i++) {

                    if (emails[i] != '') {
                        emails[i] = emails[i].toLowerCase().trim();
                        var params = {"siteId": '', email: emails[i], role: vm.role};

                        var result = User.invite(params).$promise;
                        result.then(successroleassign, fail);
                    }

                }
            }

            vm.init = init;
            vm.invite = invite;
            vm.keyDown = keyDown;
            vm.init();

        }
    ]);
