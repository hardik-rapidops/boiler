'use strict';

var isdisplayed = false;
var imageURL='';
angular
    .module('harsco-pk', [
        'ngAnimate', 'ngAria', 'ngCookies', 'ngMessages', 'ngResource', 'ngRoute', 'ngSanitize', 'ngMaterial', 'ui.router',
        'sasrio.angular-material-sidenav', 'ngMdIcons', 'lbServices', 'validation', 'LocalStorageModule', 'vcRecaptcha',
        'nvd3', '720kb.datepicker', 'mdPickers', "ng.deviceDetector"
    ])
    .run(function($rootScope, $state, $window, $stateParams, $mdSidenav, $timeout, $toast) {

           $rootScope.online = true;
           $window.addEventListener("offline", onOffline, false);
           function onOffline() {
               // Handle the offline event
               $rootScope.$apply(function() {
                   $rootScope.online = false;
                   $toast.show($toast.messages.INTERNET_FAILURE,$toast.types.ERROR);
               });
           }

           $window.addEventListener("online", function() {
               $rootScope.$apply(function() {
                   $rootScope.online = true;
               });
           }, false);

        $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
            $timeout(function() {
                if (toState.name.search('common.') != -1 && $mdSidenav('left').isOpen()) {
                    $mdSidenav('left').close();
                }
            }, 1000);
        });
    })
    .config([
        '$mdThemingProvider', '$mdAriaProvider', '$urlRouterProvider', '$stateProvider', 'ssSideNavSectionsProvider',
        'LoopBackResourceProvider', 'localStorageServiceProvider', '$windowProvider', '$qProvider', '$toastProvider',
        '$userProvider',
        function(
            $mdThemingProvider, $mdAriaProvider, $urlRouterProvider, $stateProvider, ssSideNavSectionsProvider,
            LoopBackResourceProvider, localStorageServiceProvider, $windowProvider, $qProvider, $toastProvider,
            $userProvider) {

            $qProvider.errorOnUnhandledRejections(false);
            $mdAriaProvider.disableWarnings();
            localStorageServiceProvider.setPrefix('harsco-pk');

            //LoopBackResourceProvider.setAuthHeader('X-Access-Token');

            // 👇 set your app environment here (change to 'prod' when building for production)
            // var APP_ENV = 'prod'// or 'dev'; // or 'local'

            // // 👇 detect environment
            // var apiBase = '';

            // if (window.location.protocol === 'file:') {
            //     // Inside Android/iOS app
            //     apiBase = APP_ENV === 'prod' ? 'https://app.nuroconnect.com' : (APP_ENV === 'dev' ? 'https://dev.nuroconnect.com' : 'http://localhost:3000');
            // } else if (
            //     window.location.hostname === 'localhost' ||
            //     window.location.hostname === '127.0.0.1'
            // ) {
            //     // Local development
            //     apiBase = 'http://localhost:3000'; // keep same for local proxy
            // } else {
            //     // Hosted web (browser)
            //     apiBase = window.location.hostname.includes('dev')
            //         ? 'https://dev.nuroconnect.com'
            //         : 'https://app.nuroconnect.com';
            // }

            // imageURL = apiBase
            // console.log('API Base:', apiBase);
            // LoopBackResourceProvider.setUrlBase(apiBase+'/api');
            LoopBackResourceProvider.setUrlBase('/api');

            $mdThemingProvider.definePalette('blue-pk', {
                '50': 'b0bbc1',
                '100': '91afc1',
                '200': '7ba7c1',
                '300': '5b9bc1',
                '400': '3a8ec1',
                '500': '2988c1',
                '600': '0079c1',
                '700': '0079c1',
                '800': '0079c1',
                '900': '0079c1',
                'A100': '0079c1',
                'A200': '0079c1',
                'A400': '0079c1',
                'A700': '0079c1',
                'contrastDefaultColor': 'light', // whether, by default, text (contrast)
                // on this palette should be dark or light

                'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
                    '200', '300', '400', 'A100'
                ],
                'contrastLightColors': undefined // could also specify this if default was 'dark'
            });

            $mdThemingProvider.definePalette('black-pk', {
                '50': 'dddddd',
                '100': 'a3a3a3',
                '200': '797979',
                '300': '525252',
                '400': '363636',
                '500': '848484',
                '600': '000000',
                '700': '000000',
                '800': '000000',
                '900': '000000',
                'A100': '000000',
                'A200': '000000',
                'A400': '000000',
                'A700': '000000',
                'contrastDefaultColor': 'light', // whether, by default, text (contrast)
                // on this palette should be dark or light

                'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
                    '200', '300', '400', 'A100'
                ],
                'contrastLightColors': undefined // could also specify this if default was 'dark'
            });

            $mdThemingProvider.theme('default')
                .primaryPalette('blue-pk', {
                    'default': '600', // by default use shade 400 from the pink palette for primary intentions
                    'hue-1': '900', // use shade 100 for the <code>md-hue-1</code> class
                    'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
                    'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
                })
                .accentPalette('black-pk', {
                    'default': '600', // by default use shade 400 from the pink palette for primary intentions
                    'hue-1': '900', // use shade 100 for the <code>md-hue-1</code> class
                    'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
                    'hue-3': '500' // use shade A100 for the <code>md-hue-3</code> class
                });
            $mdThemingProvider.theme('success-toast');
            $mdThemingProvider.theme('error-toast');
            $mdThemingProvider.alwaysWatchTheme(true);


            $urlRouterProvider.otherwise(function() {
                if(localStorage.getItem('$LoopBack$rememberMe') == 'true') return '/boilers';
                else return '/login';
            });

            $stateProvider.state({
                name: 'common',
                abstract: true,
                templateUrl: 'app/views/_common.html',
                controller: 'CommonCtrl as vmr'
            });

            $stateProvider.state({
                name: 'login',
                url: '/login',
                templateUrl: 'app/views/login/login.html',
                controller: 'LoginController as vm'
            });

            $stateProvider.state({
                name: 'forgot-password',
                url: '/forgot-password',
                templateUrl: 'app/views/forgot-password/forgot-password.html',
                controller: 'ForgotPasswordController as vm'
            });

            $stateProvider.state({
                name: 'invite-user',
                url: '/invite-user?email',
                templateUrl: 'app/views/invite-user/invite-user.html',
                controller: 'InviteUserController as vm'
            });

            $stateProvider.state({
                name: 'reset-password',
                url: '/reset-password/:passwordKey/:time',
                templateUrl: 'app/views/reset-password/reset-password.html',
                controller: 'ResetPasswordController as vm'
            });

            $stateProvider.state({
                name: 'invite',
                url: '/invite/:id/:token',
                templateUrl: 'app/views/invite/invite.html',
                controller: 'InviteController as vm'
            });

            $stateProvider.state({
                name: 'register',
                url: '/register?id',
                templateUrl: 'app/views/register/register.html',
                controller: 'RegisterController as vm'
            });

            $stateProvider.state({
                name: 'verify',
                url: '/verify',
                templateUrl: 'app/views/verify/verify.html',
                controller: 'VerificationControl as vm'
            });

            $stateProvider.state({
                name: 'verify-success',
                url: '/verify-success/:id/:token',
                templateUrl: 'app/views/verify-success/verify-success.html',
                controller: 'VerifysuccessControl as vm'
            });

            $stateProvider.state({
                name: 'common.boilers',
                url: '/boilers',
                templateUrl: 'app/views/boilers/boilers.html',
                controller:'BoilersController as vm'
            });

            $stateProvider.state({
                name: 'common.boiler-details',
                url: '/boiler-details/:siteId/:boilerId',
                templateUrl: 'app/views/boiler-details/boiler-details.html',
                controller: 'BoilerDetailsController as vm',
                resolve: {
                    security: ['$q', '$state', '$stateParams', function ($q,$state, $stateParams) {  
                        //RETURN the promise
                            var boilerData = $userProvider.$get().boilerdata($stateParams.boilerId);
                            return (
                                boilerData.then(function(response){
                                    if (!response){
                                        $toastProvider.$get().show('Unauthorized Access. Please check the account.', $toastProvider.$get().types.ERROR);
                                        $state.go('common.boilers');
                                        return $q.reject("Not Authorized");
                                    }
                                }).catch(function (err) {
                                    //err.status
                                    $toastProvider.$get().show('Unauthorized Access. Please check the account.', $toastProvider.$get().types.ERROR);
                                    $state.go('common.boilers');
                                    return $q.reject("Not Authorized");
                                })
                            );
                        
                    }]
                },
                data:{
                    back: true,
                    link: '#!/boilers'
                }
            });

            $stateProvider.state({
                name: 'common.sites',
                url: '/sites',
                templateUrl: 'app/views/sites/sites.html',
                controller: 'SitesController as vm'
            });

            $stateProvider.state({
                name: 'common.add-sites',
                url: '/add-sites/:boilerId',  // Note optional param - used in case if there is no sites while adding boiler.
                templateUrl: 'app/views/add-sites/add-sites.html',
                controller:'addSitesController as vm',
                data:{
                    back: true,
                    link: '#!/sites'
                }
            });

            $stateProvider.state({
                name: 'common.site-info',
                url: '/site-info/:siteId',
                templateUrl: 'app/views/site-info/site-info.html',
                data: {
                    back:true,
                    link:'#!/sites'
                },
                controller: 'siteInfoController as vm',
                resolve: {
                    security: ['$q', '$state', '$stateParams', function ($q,$state, $stateParams) {  
                        //RETURN the promise
                        var siteData = $userProvider.$get().sitedata($stateParams.siteId);
                        return (
                            siteData.then(function(response){
                                if (!response){
                                    $toastProvider.$get().show('Unauthorized Access. Please check the account.', $toastProvider.$get().types.ERROR);
                                    $state.go('common.sites');
                                    return $q.reject("Not Authorized");
                                }
                            }).catch(function (err) {
                                //err.status
                                $toastProvider.$get().show('Unauthorized Access. Please check the account.', $toastProvider.$get().types.ERROR);
                                $state.go('common.sites');
                                return $q.reject("Not Authorized");
                            })
                        );
                      
                    }]
                },

            });

            $stateProvider.state({
                name: 'common.users',
                url: '/users/:siteId',
                templateUrl: 'app/views/users/users.html',
                data: {
                    back:true,
                    link:'#!/site-info/'
                },
                controller: 'UserController as vm',
                resolve: {
                    security: ['$q', '$state', '$stateParams', function ($q,$state, $stateParams) {  
                        //RETURN the promise
                        var siteData = $userProvider.$get().sitedata($stateParams.siteId);
                        return (
                            siteData.then(function(response){
                                if (!response){
                                    $toastProvider.$get().show('Unauthorized Access. Please check the account.', $toastProvider.$get().types.ERROR);
                                    $state.go('common.sites');
                                    return $q.reject("Not Authorized");
                                }
                            }).catch(function (err) {
                                //err.status
                                $toastProvider.$get().show('Unauthorized Access. Please check the account.', $toastProvider.$get().types.ERROR);
                                $state.go('common.sites');
                                return $q.reject("Not Authorized");
                            })
                        );
                      
                    }]
                },
            });

            $stateProvider.state({
                name: 'common.no-boiler',
                url: '/no-boiler',
                templateUrl: 'app/views/no-boiler/no-boiler.html',
                controller: function($scope) {
                    $scope.model = {
                        title: 'Boiler List'
                    };
                }
            });

            $stateProvider.state({
                name: 'common.add-user',
                url: '/add-user/:siteId',
                templateUrl: 'app/views/add-user/add-user.html',
                data: {
                    back:true,
                    link:'#!/users'
                },
                controller: 'AdduserController as vm'
            });

            $stateProvider.state({
                name: 'common.boiler-alerts',
                url: '/boiler-alerts/:boilerId/:siteId',
                templateUrl: 'app/views/boiler-alerts/boiler-alerts.html',
                controller: 'boilerAlertsController as vm',
                data: {
                    back:true,
                    link:'#!/boiler-info/'
                }
            });

            $stateProvider.state({
                name: 'common.boiler-info',
                url: '/boiler-info/:boilerId',
                templateUrl: 'app/views/boiler-info/boiler-info.html',
                data: {
                    back:true,
                    link:'#!/boiler-details/'
                },
                controller: 'BoilerInfoController as vm',
                resolve: {
                    security: ['$q', '$state', '$stateParams', function ($q,$state, $stateParams) {  
                        //RETURN the promise
                        var boilerData = $userProvider.$get().boilerdata($stateParams.boilerId);
                        return (
                            boilerData.then(function(response){
                                if (!response){
                                    $toastProvider.$get().show('Unauthorized Access. Please check the account.', $toastProvider.$get().types.ERROR);
                                    $state.go('common.boilers');
                                    return $q.reject("Not Authorized");
                                }
                            }).catch(function (err) {
                                //err.status
                                $toastProvider.$get().show('Unauthorized Access. Please check the account.', $toastProvider.$get().types.ERROR);
                                $state.go('common.boilers');
                                return $q.reject("Not Authorized");
                            })
                        );
                      
                    }]
                },
            });

            $stateProvider.state({
                name: 'common.boiler-settings',
                url: '/boiler-settings/:siteId/:boilerId',
                templateUrl: 'app/views/boiler-settings/boiler-settings.html',
                data: {
                    back:true,
                    link:'#!/boiler-info/'
                },
                controller: 'boilerSettingsController as vm',
                resolve: {
                    security: ['$q', '$state', '$stateParams', function ($q,$state, $stateParams) {  
                        //RETURN the promise
                        var boilerData = $userProvider.$get().boilerdata($stateParams.boilerId);
                        return (
                            boilerData.then(function(response){
                                if (!response){
                                    $toastProvider.$get().show('Unauthorized Access. Please check the account.', $toastProvider.$get().types.ERROR);
                                    $state.go('common.boilers');
                                    return $q.reject("Not Authorized");
                                }
                            }).catch(function (err) {
                                //err.status
                                $toastProvider.$get().show('Unauthorized Access. Please check the account.', $toastProvider.$get().types.ERROR);
                                $state.go('common.boilers');
                                return $q.reject("Not Authorized");
                            })
                        );
                      
                    }]
                },
            });

            $stateProvider.state({
                name: 'common.add-boiler',
                url: '/add-boiler',
                templateUrl: 'app/views/add-boiler/add-boiler.html',
                data: {
                    back:true,
                    link:'#!/boilers'
                },
                controller: 'addBoilerController as vm'
            });

            $stateProvider.state({
                name: 'common.notifications',
                url: '/notifications',
                templateUrl: 'app/views/notifications/notifications.html',
                controller: 'notificationsController as vm',
                data: {
                    back:true,
                    link:'#!/boilers'
                }
            });

            $stateProvider.state({
                name: 'common.profile',
                url: '/profile',
                templateUrl: 'app/views/profile/profile.html',
                controller: 'ProfileController as vm',
                data: {
                    back:true,
                    link:'#!/boilers'
                }
            });

            $stateProvider.state({
                name: 'common.replace-boiler',
                url: '/replace-boiler/:siteId/:boilerId',
                templateUrl: 'app/views/replace-boiler/replace-boiler.html',
                controller: 'replaceBoilerController as vm',
                data: {
                    back:true,
                    link:'#!/boiler-settings'
                }
            });

            $stateProvider.state({
                name: 'common.trending',
                url: '/trending',
                templateUrl: 'app/views/trending/trending.html',
                controller: "TrendingController as vm"

            });

            $stateProvider.state({
                name: 'common.settings',
                url: '/settings/:brand',
                templateUrl: 'app/views/admin/settings.html',
                controller: 'SettingsController as vm',
                resolve: {
                    security: ['$q', function($q){
                        var roles = $userProvider.$get().user.roles;
                        // console.log('roles', roles);
                        if(!roles || roles.length===0 || roles[0].name != 'pkAdmin'){
                            $toastProvider.$get().show('Unauthorized Access. Please check the account.', $toastProvider.$get().types.ERROR);
                            return $q.reject("Not Authorized");
                        }
                    }]
                }
            });

            $stateProvider.state({
                name: 'common.brand-settings',
                url: '/settings-brand',
                templateUrl: 'app/views/admin/settings-brand.html',
                controller: 'SettingsBrandController as vm',
                resolve: {
                    security: ['$q', function($q){
                        var roles = $userProvider.$get().user.roles;
                        if(!roles || roles.length===0 || roles[0].name != 'pkAdmin'){
                            $toastProvider.$get().show('Unauthorized Access. Please check the account.', $toastProvider.$get().types.ERROR);
                            return $q.reject("Not Authorized");
                        }
                    }]
                }
            });

            $stateProvider.state({
                name: 'common.boilerinfo',
                url: '/boilerinfo',
                templateUrl: 'app/views/admin/boiler-info.html',
                controller: function($scope) {
                    $scope.model = {
                        title: 'Boiler Info'
                    };
                }
            });

            $stateProvider.state({
                name: 'common.admin-users',
                url: '/admin-users',
                templateUrl: 'app/views/admin/users.html',
                controller: 'UsersController as vm',
                resolve: {
                    security: ['$q', function($q){
                        var roles = $userProvider.$get().user.roles;
                        console.log("roles:::::", roles);
                        // if(roles && roles.length>0 && (roles[0].name == 'pkAdmin' || roles[0].name == 'pkTech')){
                        //     return;
                        // }

                        if(roles && roles.length>0 && roles[0].name == 'pkAdmin'){
                            return;
                        }
                        $toastProvider.$get().show('Unauthorized Access. Please check the account.', $toastProvider.$get().types.ERROR);
                        return $q.reject("Not Authorized");
                    }]
                }
            });

            $stateProvider.state({
                name: 'common.add-admin-users',
                url: '/add-admin-users',
                templateUrl: 'app/views/admin/add-admin-user.html',
                controller: 'addAdminUsersController as vm',
                data: {
                    back:true,
                    link:'#!/common.admin-users'
                }
            });

            ssSideNavSectionsProvider.initWithTheme($mdThemingProvider);
            ssSideNavSectionsProvider.initWithSections([{
                id: 'Boilers',
                name: 'Section Heading 1',
                type: 'heading',

                children: [{
                    name: 'Boilers',
                    type: 'toggle',
                    icon: 'star',
                    pages: [{
                        id: 'toogle_1_link_1',
                        name: 'Add a new boiler',
                        state: 'common.add-boiler',

                    }]
                }]
            }, {
                id: 'Trending',
                name: 'Trending ',
                state: 'common.trending',
                type: 'link',
            }, {
                id: 'Sites',
                name: 'Section Heading 1',
                type: 'heading',
                children: [{
                    name: 'Sites',
                    type: 'toggle',
                    icon: 'location_on',
                    pages: [{
                        id: 'toogle_1_link_1',
                        name: 'Add a new site',
                        state: 'common.add-sites',

                    }]
                }]
            }, {
                id: 'Notifications',
                name: 'Notifications',
                state: 'common.notifications',
                type: 'link',
                icon: 'notifications',
            }, {
                id: 'My_Profile',
                name: 'My Profile',
                state: 'common.profile',
                type: 'link',
                icon: 'person',
            }, {
                id: 'Help',
                name: 'Help',
                state: 'common.help',
                type: 'link',
                icon: 'help',
            }, {
                id: 'Privacy',
                name: 'Privacy',
                state: 'common.privacy',
                type: 'link',
                icon: 'help',
            }, {
                id: 'Logout',
                name: 'Logout',
                state: 'common.link2',
                type: 'link',
                icon: 'logout',
            }]);
        }
    ]);
