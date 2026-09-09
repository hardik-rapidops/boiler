angular.module('harsco-pk')
    .controller('SettingsBrandController', [
    '$scope', '$state',
    function ($scope, $state) {
            
            var vm = this;

            vm.model = {
                title: 'Settings'
            };

            function goToSettings(brand) {
                // if(brand) {
                //     $state.go('common.settings', {brand: brand});
                // } else {
                //     $state.go('common.settings');
                // }
                var brandValue = brand ? brand : 0
                $state.go('common.settings', {brand: brandValue});
            }

            vm.goToSettings = goToSettings;
        }
    ])