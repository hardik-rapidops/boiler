
angular.module('harsco-pk')
    .controller('SitesController', [
        '$scope',
        '$timeout',
        '$state',
        '$toast',
        '$user',
        'User',
        'Boiler',
        'Site',
        'LoopBackAuth',
        function ($scope, $timeout, $state, $toast, $user, User, Boiler, Site, LoopBackAuth) {

            var vm = this;

            vm.model = {
                title: 'Sites List'
            };
            vm.parent = $scope.vmr; // Note - Common controller inject

            vm.sites = [];

            function success(data) {
                vm.sites = data;
                for(var i in vm.sites){
                    if(vm.sites[i]['address']){
                       vm.sites[i]['address'] = vm.sites[i]['address']+',';
                    }
                    if(vm.sites[i]['city']){
                       vm.sites[i]['city'] = vm.sites[i]['city']+',';
                    }
                    if(vm.sites[i]['state']){
                       vm.sites[i]['state'] = vm.sites[i]['state']+',';
                    }
                }

                vm.parent.spinner = false;
                if(vm.sites.length == 0){
                    vm.model.title = "Add a new site";
                    vm.add = false;
                    vm.addsites = true;
                } else{
                    vm.add = true;
                    vm.addsites = false;
                }

                var user = LoopBackAuth.currentUserData;
                var params = {"id":$user.getUserId()};

                if(user.roles.length > 0 && (user.roles[0].name == 'pkAdmin' || user.roles[0].name == 'pkTech')) {
                    var result = Site.find().$promise;

                    result.then(function(sites) {
                        vm.allsites = sites;
                    })
                }
                else {
                    vm.allsites = data;
                }
            }

            function fail(error) {
                console.log(error);
            };

            function getSites() {
                var user = LoopBackAuth.currentUserData;

                var params = {"id":$user.getUserId()};

                var result = User.sites(params).$promise;

                result.then(success,fail);
            }

            function init(){
               vm.addsites = false;
               vm.parent.spinner = true;
               vm.add = false;

               var user = LoopBackAuth.currentUserData;
               // console.log(user);
                if(!user) {
                    $timeout(getSites,1000); // Note - when we refresh the page here, user object will become null, timeout will call the user api in user service to get it.
                }
                else getSites();

            }

            vm.init = init;

            vm.init();
        }
    ]);


