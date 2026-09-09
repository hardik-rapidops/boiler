
angular.module('harsco-pk')
    .controller('boilerSettingsController', [
        '$scope',
        '$timeout',
        '$state',
        '$stateParams',
        '$toast',
        '$user',
        'Boiler',
        'Site',
        '$mdDialog',
        '$rootScope',
        '$dialog',
        function ($scope, $timeout, $state, $stateParams, $toast, $user, Boiler, Site, $mdDialog, $rootScope,$dialog) {

            var vm = this;
            vm.siteId = $stateParams.siteId;
            vm.boilerId = $stateParams.boilerId;

            vm.model = {
                title: 'Advanced Boiler Settings'
            };

            function init(){
               var promise =  Boiler.findById({"id": $stateParams.boilerId}).$promise;
               promise.then(success,fail);
            }

            function success(data) {
                vm.boiler = data;
            }

            function fail() {
            }

            vm.deleteboiler = function() {
                var params = {
                    id: $stateParams.siteId,
                    fk:$stateParams.boilerId
                };

                vm.boiler.siteId =  "";

                Site.boilers.destroyById(params).$promise
                    .then(ok,error);
            };

            function ok(data) {
                $mdDialog.hide();
                $toast.show($toast.messages.BOILER_UNLINK_SUCCESS, $toast.types.SUCCESS);
                $state.go('common.boilers');
            }

            function error () {
                $toast.show($toast.messages.BOILER_UNLINK_FAIL, $toast.types.ERROR);
            }

            $scope.BoilerMain_Boiler_settings = function($event) {
                $dialog.show($dialog.templates.BOILER_DELETE, $event);
            };

            vm.init = init;
            $rootScope.deleteboiler = vm.deleteboiler;

            vm.init();
        }
    ]);
