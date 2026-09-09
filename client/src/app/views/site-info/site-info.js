angular.module('harsco-pk')
    .controller('siteInfoController', [
        '$scope',
        '$timeout',
        '$stateParams',
        '$state',
        '$toast',
        '$user',
        'User',
        'Boiler',
        'Site',
        'UserToSite',
        '$mdDialog',
        'LoopBackAuth',
        '$q',
        '$rootScope',
        '$dialog',
        function ($scope, $timeout, $stateParams, $state, $toast, $user, User, Boiler, Site, UserToSite, $mdDialog, LoopBackAuth, $q,$rootScope,$dialog) {

            var vm = this;
            vm.site = {};
            vm.usersite = {};

            vm.admin = false; // By Default user is not admin
            vm.timeZone = [
                {id: 0, timezone: '(UTC-08:00) Pacific Time (US & Canada)', "zone": "Canada/Pacific"},
                {id: 1, timezone: '(UTC-07:00) Mountain Time (US & Canada)', "zone": "Canada/Mountain"},
                {id: 2, timezone: '(UTC-06:00) Central Time (US & Canada)', "zone": "Canada/Central"},
                {id: 3, timezone: '(UTC-05:00) Eastern Time (US & Canada)', "zone": "Canada/Eastern"}
            ];

            vm.model = {
                title: 'Site Info'
            };

            vm.siteId = $stateParams.siteId;
            function success(data) {
                vm.site = data[0][0];
                vm.usersite = data[1][0];

                vm.site.timeZone = vm.timeZone[vm.site.timeZone.id];
            }

            function fail(error) {
               // console.log(error);

            }

            function getSiteInfo() {
                /**
                 * Note - In UserToSite relation, we do not have admins associated to the site,
                 * so incase the user is pkAdmin or pkTech - Get UserToSite relation of based on siteid(but not userid) with limit 1
                 * so we will have the site, in usertosite object, and user admin role to enable edit. (here we will not look for site level permissions)
                 * if the user is normal user then get his role and check if he can able to edit or not.
                 */

                vm.admin = false;
                vm.user = LoopBackAuth.currentUserData;
                if (vm.user.roles.length > 0 && (vm.user.roles[0].name == 'pkAdmin' || vm.user.roles[0].name == 'pkTech')) {
                    vm.admin = true;
                    var User_site_filter = {
                        filter: {
                            where: {
                                siteId: $stateParams.siteId,
                                userId: $user.getUserId()
                            },
                            include: 'site',
                            limit: 1
                        }
                    };
                }
                else {
                    var User_site_filter = {
                        filter: {
                            where: {
                                siteId: $stateParams.siteId,
                                userId: $user.getUserId()
                            },
                            include: 'site'
                        }
                    };
                }

                var site_filter = {
                    filter: {
                        where: {
                            id: $stateParams.siteId
                        }
                    }
                };


                $q.all([
                    Site.find(site_filter).$promise,
                    UserToSite.find(User_site_filter).$promise
                ]).then(success, fail);
            }

            function init() {
                var user = LoopBackAuth.currentUserData;
                if (!user) {
                    $timeout(init, 500); // Note - when we refresh the page here, user object will become null, timeout will call the user api in user service to get it.
                }
                else getSiteInfo();


            }

            function ok(data) {



                vm.notification(data);
            }

            function notification(data) {

                if (!vm.usersite || !vm.usersite.siteId || !vm.usersite.userId) {
                    /**
                     * !vm.usersite - this means admin is trying to update a site which he is not associated with
                     */
                    success1();
                    return;
                }


                var params = {"userId": $user.getUserId(), "siteId": data.id};
                vm.where = {
                    "where": {
                        "id": vm.site.id
                    }
                };
                delete vm.usersite.site;


                var result = UserToSite.replaceById(vm.where, vm.usersite).$promise;
                result.then(success1, fail1);

                function success1(data) {
                    if ($stateParams.boilerId) {
                        $toast.show($toast.messages.SAVE_SITE_SUCCESS_REDIRECT, $toast.types.SUCCESS);
                        $state.go('common.boiler-info', {boilerId: $stateParams.boilerId});
                    }
                    else {
                        $toast.show($toast.messages.UPDATE_SITE_SUCCESS, $toast.types.SUCCESS);
                        $state.go('common.sites');
                    }
                }

                function fail1(error) {
                    $toast.show($toast.messages.SAVE_SITE_FAILURE, $toast.types.ERROR);

                }
            }

            vm.deleteboilermainsite = function () {
                var delete_params = {id: $stateParams.siteId};
                var response = Site.deleteById(delete_params).$promise;
                response.then(success1, vm.unlink);

            };

            function success1(data) {
                $mdDialog.hide();
                if ($stateParams.boilerId) {
                    $toast.show($toast.messages.SAVE_SITE_SUCCESS_REDIRECT, $toast.types.SUCCESS);
                    $state.go('common.boiler-info', {boilerId: $stateParams.boilerId});
                }
                else {
                    $toast.show($toast.messages.DELETE_SITE_SUCCESS, $toast.types.SUCCESS);
                    $state.go('common.sites');
                }
            }

            function fail1(error) {
                $toast.show($toast.messages.DELETE_SITE_FAILURE, $toast.types.ERROR);
            }

            vm.unlink = function () {
                var params = {"id": $stateParams.siteId, 'fk': $user.getUserId()};
                if(vm.usersite.role != 0) {
                    var response = Site.users.unlink(params).$promise;
                }
                else {
                    var params = {
                        siteId:$stateParams.siteId
                    };
                    var response = UserToSite.unlinkAll(params).$promise;
                }
                response.then(success1, fail1);
                $mdDialog.hide();
            };

            function BoilerMain_Site_delete($event) {
                $dialog.show($dialog.templates.BOILERMAIN_SITE_DELETE, $event);
            }

            function keyDown($event) {
                $scope.error1 = '';
                $scope.error2 = '';
                $scope.error3 = '';
                if ($event.keyCode && $event.keyCode === 13) {
                    vm.SiteInfo_Save();
                }
            }

            function SiteInfo_Save() {
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

                if(vm.user.roles.length > 0 && (vm.user.roles[0].name == "pkAdmin" || vm.user.roles[0].name == "pkTech" )) {
                    var where = {
                        where :{
                            id : $stateParams.siteId

                        }
                    };
                    var promise =  Site.upsertWithWhere(where,vm.site).$promise;
                }
                else {
                    var params = {
                        id: LoopBackAuth.currentUserId,
                        fk: $stateParams.siteId
                    };
                    var promise = User.sites.updateById(params,vm.site).$promise;
                }
                //

                promise.then(ok, fail);
                $mdDialog.hide();
            };

            function isNumberKey_zip(e) {

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
            vm.SiteInfo_Save = SiteInfo_Save;
            vm.BoilerMain_Site_delete = BoilerMain_Site_delete;
            vm.notification = notification;
            vm.keyDown = keyDown;
            $rootScope.deleteboilermainsite=vm.deleteboilermainsite;

            vm.init();
        }
    ]);
