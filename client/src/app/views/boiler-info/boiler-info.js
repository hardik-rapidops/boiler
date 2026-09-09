angular.module('harsco-pk')
    .controller('BoilerInfoController', [
        '$scope','$timeout', '$state', '$stateParams', '$toast', '$user', '$sharedMethods','Boiler', 'BoilerModel', 'Site', 'User','UserToSite', '$q',
        function ($scope, $timeout, $state, $stateParams, $toast, $user,$sharedMethods, Boiler, BoilerModel, Site, User,UserToSite, $q) {

            var vm = this;

            vm.model = {
                title: 'Boiler Info'
            };
            var signUpCode = null;


            var update = false;

            vm.selectedSiteId = 0;


            vm.boilerId = $stateParams.boilerId;

            function success(data) {
                update = !!data[1].siteId;
                vm.site = data[0];
                vm.boiler = data[1];
                
                vm.selectedSiteId = vm.boiler.siteId;
                var flag=false;
                for(var inc=0;inc<vm.site.length;inc++){
                    if(vm.boiler.siteId==vm.site[inc].id){
                        flag=true;
                    }
                }
                vm.user = $user.getUser();

                var filter = {filter: {where: {siteId:vm.boiler.siteId,userId:vm.user.id}}};
                UserToSite.find(filter).$promise.then(function(data) {
                    vm.tech = false;
                    vm.siterole = data[0].role;

                    if(vm.user.roles.length > 0 && (vm.user.roles[0].name == "pkAdmin" || vm.user.roles[0].name == "pkTech" )) {
                        vm.tech = true;
                    }
                });
                if(!flag)vm.selectedSiteId ='';

                getBoilerModels();
            }

            function getBoilerReadRecord(numRecords, boilerId) {
                var params = {
                    "id": boilerId,
                    // "receivedData.data.brand": { $exists : true },
                    filter: {
                        order: 'receivedDate DESC',
                        limit: numRecords
                    }
                };
                // console.log("params", params);
                return Boiler.boilerRecords(params).$promise;
            }

            function getBoilerModels() {
                var boilerId = vm.boiler._id ? vm.boiler._id : vm.boiler.id;
                getBoilerReadRecord(500, boilerId)
                .then(function (boilerReadData) {
                    
                    var boilerReadDataBrand = boilerReadData.filter(function(obj) {return obj.receivedData.data.brand == "1" || obj.receivedData.data.brand == "0"});
                    var boilerBrand = boilerReadDataBrand && boilerReadDataBrand.length > 0 ? boilerReadDataBrand[0].receivedData.data.brand : "0";
                    console.log("boilerBrand", boilerBrand);
                    BoilerModel.find().$promise
                    .then(function (boilerModels) {
                        vm.boilerModels = boilerModels.filter(function(obj) {return obj.modelKey == vm.boiler.model && obj.brand == boilerBrand});
                        console.log("vm.boilerModels", vm.boilerModels);
                    });
                })
                
            }

            function init() {

                var user = $user.getUser();

                if(!user) {
                    $timeout(init,500); // Note - when we refresh the page here, user object will become null, timeout will call the user api in user service to get it.
                }
                else {
                    var params = {id: $user.getUserId()};
                    var result = User.sites(params);

                    if(user.roles.length > 0 && (user.roles[0].name == 'pkAdmin' || user.roles[0].name == 'pkTech')) {
                        result = Site.find();
                    }

                    $q.all([
                        result.$promise,
                        Boiler.findById({"id": $stateParams.boilerId}).$promise
                    ]).then(success, fail)
                }
            }

            function fail(error) {
                $toast.show($toast.messages.BOILER_INFO_ADD_FAIL, $toast.types.ERROR);
            }

            function ok(data) {

                if(!update) $toast.show($toast.messages.BOILER_INFO_ADD_SUCCESS, $toast.types.SUCCESS);
                else $toast.show($toast.messages.BOILER_INFO_UPDATE_SUCCESS, $toast.types.SUCCESS);

                $state.go('common.boilers');
            }

            function save() {
                $scope.errsite='';
                vm.boiler.siteId = vm.selectedSiteId;
                if (!vm.selectedSiteId) {
                    $scope.errsite = '* Select Site Name';
                    return false;
                } else {
                    signUpCode = $sharedMethods.random(6);
                    isUniqueCode(signUpCode);
                }
            }
            function reseterrorlog(){
                $scope.errsite='';
            }

            function isUniqueCode(uCode) {
                Boiler.exist({signUpCode: uCode}).$promise.then(function (data) {
                    if (!data.status) {
                        vm.boiler.signUpCode = signUpCode;
                        Boiler.replaceOrCreate(vm.boiler).$promise.then(ok, fail);
                    }
                    else {
                        signUpCode = $sharedMethods.random(6);
                        isUniqueCode(signUpCode);
                    }
                });
            }

            vm.init = init;
            vm.save = save;
            vm.reseterrorlog = reseterrorlog;
            vm.init();
        }
    ]);
