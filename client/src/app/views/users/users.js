angular.module('harsco-pk')
    .controller('UserController', [
        '$scope', '$timeout', '$state', '$stateParams', '$toast', '$user', 'Boiler', 'User', 'Site', '$mdDialog', 'LoopBackAuth', 'UserToSite','$rootScope','$dialog',
        function ($scope, $timeout, $state, $stateParams, $toast, $user, Boiler, User, Site, $mdDialog, LoopBackAuth, UserToSite,$rootScope,$dialog) {

            var vm = this;

            vm.model = {
                title: 'Users'
            };
            vm.role = [];


            vm.siteId = $stateParams.siteId;


            vm.deleteusertosite = function(){

                // if(vm.managerscount == 1 && vm.current.role == 0) { // Note the only manager's role is trying to delete
                //     $toast.show($toast.messages.DELETE_USER_FAILURE,$toast.types.ERROR);
                //     $mdDialog.hide();
                //     return;
                // }

                var params = {"id":$stateParams.siteId,'fk':vm.current.user.id};
                var respose = Site.users.unlink(params,
                    angular.noop,
                    angular.noop);
                respose.$promise.then(ok,fail1);
                $mdDialog.hide();
            }

            function ok(data) {

                vm.usersites = vm.usersites.filter(function(el) {
                    return el.id != vm.current.id;
                });

                $toast.show($toast.messages.DELETE_USER_SUCCESS,$toast.types.SUCCESS);
                vm.managerscount = 0;
                for (var i = 0; i < vm.usersites.length; i++) {
                    if (vm.usersites[i].role == 0) vm.managerscount++;
                }
                $state.go('common.users');

            }

            function fail1(error) {
                $toast.show($toast.messages.DELETE_USER_FAILURE,$toast.types.ERROR);
            }


            function _delete($event,site) {
                vm.current = site;
                $dialog.show($dialog.templates.SITE_USER_DELETE, $event);
            }

            function update(site,index) {

                // if(vm.managerscount == 1 && site.role == 0) { // Note the only manager's role is trying to update
                //     $toast.show($toast.messages.UPDATE_USER_FAILURE,$toast.types.ERROR);
                //     return;
                // }

                if(site.siteId == "" || site.userId == "") {
                    // TODO Check if in any scenario happening this.
                    return;
                }
                var where = {where: {id:site.id}};
                site.role = vm.role[index];
                UserToSite.replaceUser(where,site).$promise;
                vm.managerscount = 0;
                for (var i = 0; i < vm.usersites.length; i++) {
                    if (vm.usersites[i].role == 0) vm.managerscount++;
                }
            }

            function success(data) {

                if(LoopBackAuth.currentUserData) {

                    vm.user = LoopBackAuth.currentUserData;
                    if(vm.user.roles.length > 0 && (vm.user.roles[0].name == 'pkAdmin')) {
                        vm.admin = true;
                    }
                    vm.managerscount = 0;
                    var userid = $user.getUserId();
                    vm.manager = false; // Default not a manager;
                    vm.usersites = data;
                    for(var i = 0; i< vm.usersites.length; i++){
                        if(vm.usersites[i].userId == userid) {
                            vm.manager = (vm.usersites[i].role == 0) ? true : false;
                        }
                        if(vm.usersites[i].role == 0) vm.managerscount++;
                        vm.role.push(vm.usersites[i].role);
                    }
                    // new changes
                    if (vm.user && vm.user.roles && vm.user.roles[0].name == "pkTech"){
                        vm.manager = true;
                    }
                    // end new changes
                    
                    if(vm.admin == true) {
                        vm.manager = true;
                    }

                }
                else {
                    $timeout(function() {success(data)},1000)
                }
            }

            function fail(error) {

            };

            function init() {
                if($stateParams.siteId) {
                    var params = {filter:  {where : {siteId:$stateParams.siteId}, include : "user"}};
                    var users = UserToSite.find(params).$promise;
                    users.then(success,fail);
                }

            }

            vm.init = init;
            vm.update = update;
            vm.delete = _delete;
            $rootScope.deleteusertosite=vm.deleteusertosite;

            vm.init();

        }
    ]);