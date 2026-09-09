angular.module('harsco-pk')
    .controller('AdduserController', [
        '$scope',
        '$timeout',
        '$state',
        '$toast',
        '$user',
        'Boiler',
        'User',
        'Site',
        'LoopBackAuth',
        '$stateParams',
        'UserToSite',
        function ($scope, $timeout, $state, $toast, $user, Boiler, User, Site, LoopBackAuth, $stateParams,UserToSite) {

            var vm = this;

            vm.siteId = $stateParams.siteId;
            vm.emailStatusSuccess = null;

            vm.model = {
                title: 'Add User'
            };
            var  invitationcount=0;
            function success(data) {
                invitationcount++;
                var emailslist = vm.email;
                var emails = emailslist.split(',');
                if(invitationcount==emails.length) {
                    $toast.show($toast.messages.INVITATION_SUCCESS);
                }
                $state.go('common.users',{siteId:$stateParams.siteId});
            }
            function fail(error){
                $toast.show($toast.messages.INVITATION_FAIL);
            }

            function init(){

            }

            function keyDown ($event) {
                $scope.err1='';
                $scope.err2='';
                
                if ($event.keyCode && $event.keyCode === 13) {
                    vm.invite();
                }
            }

            function invite(){
                $scope.err1='';
                $scope.err2='';
                //var emailexp = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
                // var emailexp =/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                var emailexp =/^.+@.+\..+$/;

                if (!vm.email ) {
                    $scope.err1='* Enter Email';
                    return false;
                }else if (vm.email) {
                    UserToSite.checkUserExist({
                        siteId: vm.siteId,
                        email: vm.email
                    },
                    function success(response) {
                        vm.emailStatusSuccess = response.available;
                    },
                    function error(err) {
                        console.error('Error checking email:', err);
                        return false;
                    });

                    if (!vm.emailStatusSuccess) {
                        $scope.err1 = 'User already linked to site.';
                        console.warn('User already linked to site.');
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
                if (!vm.role ) {
                    $scope.err2='* Select role';
                    return false;
                }
                for (var i = 0; i < emails.length; i++) {

                    if (emails[i] != '') {
                        emails[i] = emails[i].toLowerCase().trim();
                        var params = {"siteId": $stateParams.siteId, email: emails[i], role: vm.role};
                        var result = User.invite(params).$promise;
                        result.then(success, fail);
                    }

                }
            }

            // vm.emailStatusSuccess = null;

            // vm.onEmailBlur = function () {
            //     if (vm.email) {
            //     User.checkEmail({ email: vm.email },
            //         function success(response) {
            //         console.log('Email check response:', response);
            //         vm.emailStatusSuccess = response.response.message.includes('already exist') ? false : true;
            //             if(vm.emailStatusSuccess == false){
            //                 $scope.err1 = response.response.message;
            //                 return false;
            //             }
            //         },
            //         function error(err) {
            //         console.error('Error checking email:', err);
            //         vm.emailStatusSuccess = false;
            //         return false;
            //         });
            //     }
            // };

            vm.onEmailBlur = function () {
                if (!vm.email || !vm.siteId) return;

                UserToSite.checkUserExist({
                    siteId: vm.siteId,
                    email: vm.email
                },
                function success(response) {
                    vm.emailStatusSuccess = response.available;
                    if (!vm.emailStatusSuccess) {
                        $scope.err1 = 'User already linked to site.';
                        console.warn('User already linked to site.');
                    }
                },
                function error(err) {
                    console.error('Error checking email:', err);
                });
            };

            vm.init = init;
            vm.invite = invite;
            vm.keyDown = keyDown;
            vm.init();

        }
    ]);
