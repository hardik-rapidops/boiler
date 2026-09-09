
angular.module('harsco-pk')
    .controller('UsersController', [
        '$scope',
        '$timeout',
        '$state',
        '$toast',
        '$user',
        'User',
        'Boiler',
        'Site',
        '$mdDialog',
        'LoopBackAuth',
        '$rootScope',
        '$dialog',
        'DestoryUser',
        function ($scope, $timeout, $state, $toast, $user, User, Boiler, Site, $mdDialog,LoopBackAuth,$rootScope,$dialog, DestoryUser) {

            var vm = this;

            vm.model = {
                title: 'Users List'
            };

            function success(data) {

                vm.users=data;

                $scope.selected = [];
                $scope.toggle = function (user, list) {
                    var idx = list.indexOf(user);
                    if (idx > -1) {
                        list.splice(idx, 1);
                    }
                    else {
                        list.push(user);
                    }
                };

                $scope.exists = function (user, list) {
                    return list.indexOf(user) > -1;
                };

                $scope.isIndeterminate = function() {
                    return ($scope.selected.length !== 0 &&
                    $scope.selected.length !== vm.users.length);
                };

                $scope.isChecked = function() {
                    return $scope.selected.length === vm.users.length;
                };

                $scope.toggleAll = function() {
                    if ($scope.selected.length === vm.users.length) {
                        $scope.selected = [];
                    } else if ($scope.selected.length === 0 || $scope.selected.length > 0) {
                        $scope.selected = vm.users.slice(0);
                    }
                };
            }

            function fail(error) {
                console.log(error);
            };

            function confirmdeleteuser($event) {
                $dialog.show($dialog.templates.USER_ROLE_DELETE, $event);
            }
            var delflag=0;
            vm.confirmuserdelete = function () {
                $scope.items=$scope.selected;

                var count = $scope.items.length;

                for(var i=0;i<$scope.items.length;i++) {
                    var params = {
                        'id': $scope.items[i].id
                    };
                    if ($scope.items[i].id == LoopBackAuth.currentUserId) {
                        delflag=1;
                        count--;
                        $toast.show($toast.messages.INVALID_USER_DELETE, $toast.types.ERROR);
                    } else{
                        vm.parent = $scope.vmr;
                        if($scope.items[i].roles[0].name=='pkAdmin' && vm.parent.user.roles[0].name=='pkTech'){
                                 $toast.show($toast.messages.INVALID_USER_DELETE, $toast.types.ERROR);
                                 return false;
                         }

                        var usersdel =User.roles.destroyAll(params).$promise;
                        // var usersdel = DestoryUser.userdelete(params).$promise;
                        usersdel.then(successdeleteuser, faildeleteuser);
                    }
                }
                $mdDialog.hide();
                if(delflag==0 || $scope.items.length>1)
                    $toast.show(count + ' ' + $toast.messages.DELETE_USER_SUCCESS, $toast.types.SUCCESS);
            }

            function deleteUser(){
                if($scope.selected.length==0) {
                    $toast.show($toast.messages.INVALID_USER_SELECTION, $toast.types.ERROR);
                }else{
                    vm.confirmdeleteuser();
                }
            }
            function successdeleteuser(data) {
                vm.init();
            }
            function faildeleteuser(error) {
                $toast.show($toast.messages.DELETE_USER_FAILURE, $toast.types.ERROR);
            };

            function init(){
                var params = {
                    filter: {
                        include: ['roles']

                    }
                };
                var users = User.find(params).$promise;
                users.then(success,fail);
            }

            vm.init = init;
            vm.deleteUser = deleteUser;
            vm.confirmdeleteuser = confirmdeleteuser;
            $rootScope.confirmuserdelete = vm.confirmuserdelete;

            vm.init();
        }
    ]);
