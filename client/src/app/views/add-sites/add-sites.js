angular.module('harsco-pk')
    .controller('addSitesController', [
        '$scope', '$timeout', '$stateParams', '$state', '$toast', '$user', 'User', 'Boiler', 'UserToSite', '$mdDialog', 'LoopBackAuth',
        function ($scope, $timeout, $stateParams, $state, $toast, $user, User, Boiler, UserToSite, $mdDialog, LoopBackAuth) {

            var vm = this;

            vm.model = {
                title: 'Add a new site'
            };

            vm.site = {};
            vm.usersite = {
                disableNotification: false
            };

            vm.timeZone = [
                {id: 0, timezone: '(UTC-08:00) Pacific Time (US & Canada)', "zone": "Canada/Pacific"},
                {id: 1, timezone: '(UTC-07:00) Mountain Time (US & Canada)', "zone": "Canada/Mountain"},
                {id: 2, timezone: '(UTC-06:00) Central Time (US & Canada)', "zone": "Canada/Central"},
                {id: 3, timezone: '(UTC-05:00) Eastern Time (US & Canada)', "zone": "Canada/Eastern"}
            ];

            var objLocalZone = new Date();
            var strLocalZone = '' + objLocalZone;
            var mySplitResult = strLocalZone.split(" ");
            var newLocalZone = mySplitResult[5].slice(0, mySplitResult[5].length - 2) + ':' + mySplitResult[5].slice(mySplitResult[5].length - 2, mySplitResult[5].length);

            if (newLocalZone == 'GMT-08:00') {
                vm.site.timeZone = vm.timeZone[0];
            } else if (newLocalZone == 'GMT-07:00') {
                vm.site.timeZone = vm.timeZone[1];
            } else if (newLocalZone == 'GMT-06:00') {
                vm.site.timeZone = vm.timeZone[2];
            } else {
                vm.site.timeZone = vm.timeZone[3];
            }

            function success(data) {
                vm.notification(data);
            }

            function fail(error) {
                $toast.show($toast.messages.SAVE_SITE_FAILURE, $toast.types.ERROR);
            }

            function notification(data) {

                var User_site_filter = {
                    filter: {
                        where: {
                            siteId:  data.id,
                            userId: $user.getUserId()
                        }
                    }
                };

                var result = UserToSite.find(User_site_filter).$promise;
                result.then(success2, fail2);

                function success2(result){

                    vm.usersite.id=result[0].id;
                    vm.usersite.userId=result[0].userId;
                    vm.usersite.siteId=result[0].siteId;
                    vm.usersite.role=result[0].role;

                    vm.where = {
                        "where": {
                            "id": vm.site.id
                        }
                    };
                    delete vm.usersite.site;

                    if(vm.usersite.siteId == "" || vm.usersite.userId == "") {
                        // TODO Check if in any scenario happening this.
                        return;
                    }

                    vm.usersite.disableNotification == !!vm.usersite.disableNotification;

                    var result = UserToSite.replaceById(vm.where, vm.usersite).$promise;
                    result.then(success1, fail1);

                    function success1(data) {
                        if ($stateParams.boilerId) {
                            $toast.show($toast.messages.SAVE_SITE_SUCCESS_REDIRECT, $toast.types.SUCCESS);
                            $state.go('common.boiler-info', {boilerId: $stateParams.boilerId});
                        }
                        else {
                            $toast.show($toast.messages.SAVE_SITE_SUCCESS, $toast.types.SUCCESS);
                            $state.go('common.sites');
                        }
                    }

                    function fail1(error) {
                        $toast.show($toast.messages.SAVE_SITE_FAILURE, $toast.types.ERROR);

                    }

                }
                function fail2(error){
                    $toast.show($toast.messages.SAVE_SITE_FAILURE, $toast.types.ERROR);
                }




            }

            function init() {
            }

            function keyDown($event) {
                $scope.error1 = '';
                $scope.error2 = '';
                $scope.error3 = '';

                if ($event.keyCode && $event.keyCode === 13) {
                    vm.save();
                }
            }

            function save() {
                // TODO - Validations should move to service or directive
                $scope.error1 = '';
                $scope.error2 = '';
                $scope.error3 = '';

                var uszipRegExp = /^\d{5}$/;
                var canadazipRegExp = /^[a-zA-Z][0-9][a-zA-Z]\s?[0-9][a-zA-Z][0-9]$/;

                if (!vm.site.name) {
                    $scope.error1 = '* Name is required';
                    return false;
                }

                if (!vm.site.zip) {
                    $scope.error2 = '* Zipcode is required';
                    return false;
                }
                if (!uszipRegExp.test(vm.site.zip) && !canadazipRegExp.test(vm.site.zip)) {
                    $scope.error2 = '* Zipcode should be 5 digit numaric for US or 6 digit alphanumaric for Canadian';
                    return false;
                }

                if(vm.site.fuel == "$") vm.site.fuel = '';

                var params = {"id": $user.getUserId()};
                vm.site.disableNotification =  !!vm.site.disableNotification;
                vm.site.fuel = vm.site.fuel || '$0';

                var result = User.sites.create(params, vm.site).$promise;
                result.then(success, fail);
            }

            function isNumberKey_zip(e) {
//                var charCode = (e.which) ? e.which : e.keyCode;
//                if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
//                    $scope.error2 = '* Zipcode should be number';
//                    e.preventDefault();
//                    return false;
//                }


            }

            function isNumberKey_fuel(e) {
                var charCode = (e.which) ? e.which : e.keyCode;
                if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
                    $scope.error3 = '* Fuel Cost should be number';
                    e.preventDefault();
                    return false;
                }
            }

            vm.init = init;
            vm.isNumberKey_zip = isNumberKey_zip;
            vm.isNumberKey_fuel = isNumberKey_fuel;
            vm.keyDown = keyDown;
            vm.notification = notification;
            vm.save = save;

            vm.init();
        }
    ]);
