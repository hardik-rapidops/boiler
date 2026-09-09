'use strict';

angular.module('harsco-pk')
    .controller('CommonCtrl', [
        '$scope',
        '$mdSidenav',
        '$timeout',
        '$rootScope',
        '$state',
        '$user',
        'ssSideNav',
        'ssSideNavSharedService',
        '$mdDialog',
        '$window',
        'deviceDetector',
        function ($scope, $mdSidenav, $timeout, $rootScope, $state, $user, ssSideNav, ssSideNavSharedService, $mdDialog,$window, deviceDetector) {

            var vm = this;
            // vm.help = false
            $scope.imageURLPath = imageURL;

            var _perform_change_for_demo = function () {
                ssSideNav.setVisible('link_3', true);

                ssSideNav.setVisibleFor([
                    {
                        id: 'toogle_1_link_2',
                        value: true
                    },
                    {
                        id: 'toogle_1_link_1',
                        value: false
                    }
                ]);

                $timeout(function () {
                    ssSideNav.forceSelectionWithId('toogle_3_link_1');
                }, 1000 * 10);
            };

            vm.state = $state.current.name;

            $rootScope.$on('$stateChangeStart',
                function(event, toState, toParams, fromState, fromParams){
                    vm.state = toState.name;
                });

            $scope.menu = ssSideNav;

            // Listen event SS_SIDENAV_CLICK_ITEM to close menu
            $rootScope.$on('SS_SIDENAV_CLICK_ITEM', function () {
               // console.log('do whatever you want after click on item');
            });


            $scope.boilers = function () {
                $state.go('common.boilers');
            };

            $scope.boilerdetails = function () {
                $state.go('common.boiler-details');
            };

            $scope.boilerinfo = function () {
                $state.go('common.boiler-info');
            };

            $scope.noboiler = function () {
                $state.go('common.no-boiler');
            };

            $scope.addboiler = function () {
                $state.go('common.add-boiler');
            };

            $scope.boileralerts = function () {
                $state.go('common.boiler-alerts');
            };

            $scope.boilersettings = function () {
                $state.go('common.boiler-settings');
            };

            $scope.replaceboiler = function () {
                $state.go('common.replace-boiler');
            };

            $scope.trending = function () {
                $state.go('common.trending');
            };

            $scope.sites = function () {
                $state.go('common.sites');
            };

            $scope.addsites = function () {
                $state.go('common.add-sites');
            };

            $scope.notifications = function () {
                $state.go('common.notifications');
            };

            $scope.profile = function () {
                $state.go('common.profile');
            };

            $scope.siteinfo = function () {
                $state.go('common.add-sites');
            };

            $scope.users = function () {
                $state.go('common.users');
            };

            $scope.adduser = function () {
                $state.go('common.add-user');
            };

            $scope.help = function () {
                $state.go('common.help');
            };
            $scope.privacy = function () {
                $state.go('common.privacy');
            };

            // $scope.help = function() {
            //     console.log("$scope.imageURLPath", $scope.imageURLPath)
            //     vm.help = true;
            //     window.open("https://www.pattersonkelley.com/privacy-policy/", '_blank').focus();
            //     if(cordova.platformId == 'ios') {
            //         cordova.InAppBrowser.open("https://www.pattersonkelley.com/privacy-policy/", '_blank','location=no');
            //     } else {
            //         window.open("https://www.pattersonkelley.com/privacy-policy/", '_blank').focus();
            //     }
            //     if (cordova && cordova.InAppBrowser) {
            //         cordova.InAppBrowser.open("https://www.pattersonkelley.com/privacy-policy/", '_blank','location=no');
            //     } else {
            //         //  window.open("https://www.pattersonkelley.com/solutions/controls/nuro/", '_system','location=yes');
            //         // window.open("https://www.pattersonkelley.com/privacy-policy/", '_system','location=yes');
            //         window.open("https://www.pattersonkelley.com/privacy-policy/", '_blank').focus();
            //     }
            //     // var vm = this;
            //     // vm.help = true;
            //     // vm.data = deviceDetector;
            //     // vm.allData = vm.data;
            //     // vm.isMobile = vm.data.isMobile();
            //     // vm.isDesktop = vm.data.isDesktop();
            //     // vm.isTablet = vm.data.isTablet();
            //     // if( vm.data &&
            //     //     vm.data.isMobile() &&
            //     //     vm.data.raw &&
            //     //     vm.data.raw.device &&
            //     //     vm.data.raw.device.android !== true) {
            //     //     if(cordova && cordova.InAppBrowser) {
            //     //         cordova.InAppBrowser.open("https://s3.amazonaws.com/harsco-data.vensi.com/dev.nuroconnect.com/help.pdf/NuroConnectHelp.pdf", '_blank','location=no');
            //     //     } else {
            //     //         window.open("https://s3.amazonaws.com/harsco-data.vensi.com/dev.nuroconnect.com/help.pdf/NuroConnectHelp.pdf", '_blank').focus();
            //     //     }
            //     // } else {
            //     //     window.open("https://s3.amazonaws.com/harsco-data.vensi.com/dev.nuroconnect.com/help.pdf/NuroConnectHelp.pdf", '_blank').focus();
            //     // }
            // };

            $scope.help = function() {
                var vm = this;
                vm.data = deviceDetector;
                vm.allData = vm.data;
                vm.isMobile = vm.data.isMobile();
                vm.isDesktop = vm.data.isDesktop();
                vm.isTablet = vm.data.isTablet();
                console.log("window.location.href", window.location.href);
                var pdfUrl = 'https://s3.amazonaws.com/harsco-data.vensi.com/dev.nuroconnect.com/help.pdf/NuroConnectHelp.pdf';
                if(!vm.data.isMobile() && (window.location.href.includes('http://localhost:3000/') || window.location.href.includes('https://dev.nuroconnect.com/'))) {
                    pdfUrl = 'https://s3.amazonaws.com/harsco-data.vensi.com/dev.nuroconnect.com/help.pdf/NuroConnectHelp.pdf';
                }      
                if(!vm.data.isMobile() && window.location.href.includes('https://app.nuroconnect.com/')) {
                    pdfUrl = 'https://s3.amazonaws.com/harsco-data.vensi.com/app.nuroconnect.com/help.pdf/NuroConnectHelp.pdf';
                }
                if( vm.data &&
                    vm.data.isMobile() &&
                    vm.data.raw &&
                    vm.data.raw.device &&
                    vm.data.raw.device.android !== true) {
                    if(cordova && cordova.InAppBrowser) {
                        cordova.InAppBrowser.open(pdfUrl, '_blank','location=no');
                    } else {
                        window.open(pdfUrl, '_blank').focus();
                    }
                } else {
                    window.open(pdfUrl, '_blank').focus();
                }
            };


            $scope.privacyPolicy = function() {
                var vm = this;
                vm.data = deviceDetector;
                vm.allData = vm.data;
                vm.isMobile = vm.data.isMobile();
                vm.isDesktop = vm.data.isDesktop();
                vm.isTablet = vm.data.isTablet();
                if( vm.data &&
                    vm.data.isMobile() &&
                    vm.data.raw &&
                    vm.data.raw.device &&
                    vm.data.raw.device.android !== true) {
                    if(cordova && cordova.InAppBrowser) {
                        cordova.InAppBrowser.open("https://www.spx.com/privacy/", '_blank','location=no');
                    } else {
                        window.open("https://www.spx.com/privacy/", '_blank').focus();
                    }
                } else {
                    window.open("https://www.spx.com/privacy/", '_blank').focus();
                }
            };

            /**
             *
             * @param user - user object
             * attach all user values to view
             */

            function attach(user) {
                vm.spinner = false;
                vm.user = user;
            }

            /**
             * unauthorized user
             * sending him to login page
             */

            function goback() {
                //$user.logout();
                $state.go('login');
            }

            function init() {
                vm.spinner = true;
                $user.authorize(attach, goback);
            }

            function redirect() {
                $state.go('login');
            }

            function stay() {
            }

            function logout() {
                var parentEl = angular.element(document.body);
                $mdDialog.show({
                    parent: parentEl,
                    // targetEvent: $event,
                    template: '<md-dialog aria-label="List dialog">' +
                    '  <md-dialog-content>' +
                    '<div class="p10">' +
                    '<h4 class="text-center">Are you sure you want to Logout?</h4>' +
                    '    </div>' +
                    '  </md-dialog-content>' +
                    '  <md-dialog-actions>' +
                    '    <div layout="row" flex="100" layout-align="center center" class="mb-10">' +
                    '        <md-button class="md-raised md-accent" ng-click="closeDialog()">No</md-button>' +
                    '        <md-button class="md-raised md-primary" ng-click="confirmLogout()">Yes</md-button>' +
                    '   </div>' +
                    '  </md-dialog-actions>' +
                    '</md-dialog>',
                    locals: {
                        items: $scope.items
                    },
                    controller: DialogController
                });
            }

            function DialogController($scope, $mdDialog, items) {
                $scope.items = items;
                $scope.closeDialog = function () {
                    $mdDialog.hide();
                };
                $scope.confirmLogout = function () {
                    $user.logout(redirect, stay);
                    localStorage.removeItem("user-data");
                    $mdDialog.hide();
                }
            }

            vm.init = init;
            vm.logout = logout;

            vm.init();
        }
    ]);
