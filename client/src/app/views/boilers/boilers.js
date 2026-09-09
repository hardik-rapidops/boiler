(function () {

    angular.module('harsco-pk')

        .controller('BoilersController', [
            '$scope', '$timeout', '$state', '$toast', '$user', '$mdDialog', 'User', 'Site', 'Boiler', 'BoilerImage', 'BoilerModel',
            'BoilerStatus', 'BoilerState', '$q', 'LoopBackAuth', '$interval','$sharedMethods','$notifications',
            function ($scope,$timeout, $state, $toast, $user, $mdDialog, User, Site, Boiler, BoilerImage, BoilerModel,
                      BoilerStatus, BoilerState, $q, LoopBackAuth, $interval, $sharedMethods, $notifications) {

                $scope.imageURLPath = imageURL;
                $scope.access_token = LoopBackAuth.accessTokenId;

                var vm = this;

                vm.model = {
                    title: 'Boilers'
                };

                vm.parent = $scope.vmr;

                vm.sites = [];
                vm.allsites = [];
                vm.boilers = [];
                vm.boilerModels = [];
                vm.boilerStates = [];
                vm.boilerStatuses = [];
                vm.noboilers = false;
                vm.boilersCount = -1; // To hide "Add Boiler text" initially I choose count as -1 but not 0.
                vm.pendingRequests = {}; // Track pending requests per boilerId
                vm.refreshInterval = undefined;

                $scope.searchBoilers = '';
                vm.brandValueForImage = '';

                $scope.$on('$destroy', function () {
                    $interval.cancel(vm.refreshInterval);
                });

                vm.changeRefresh = function () {

                    if (vm.refreshInterval) {
                        $interval.cancel(vm.refreshInterval);
                    }

                    if (vm.autoRefresh) {
                        vm.refreshInterval = $interval(function () {
                            getSites().then(function (data) {
                                console.log("data", data);
                                vm.sites = data.sort(function(a, b) { return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1 });
                                
                                // new added
                                angular.forEach(vm.sites, function (site, key) {
                        
                                    site.boilers = site.boilers.sort(function(a, b) { return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1 })
                                    angular.forEach(site.boilers, function (boiler, key) {
                                        
                                        var boilerReadDataArray = boiler.boilerReadRecordData.length > 0 ? boiler.boilerReadRecordData[0] : [];
                                        var brandOfBoiler = boilerReadDataArray.filter(function(obj) {if(obj && obj.receivedData) {return obj.receivedData.data.brand == "1" || obj.receivedData.data.brand == "0"} else {return []} });

                                        if(brandOfBoiler && brandOfBoiler.length > 0) {
                                            if(brandOfBoiler[0].receivedData.data.brand == "1") {
                                                vm.brandValueForImage = "1"
                                                boiler["brand"] = "Weil-McLain";
                                            } else {
                                                vm.brandValueForImage = "0"
                                                boiler["brand"] = "Patterson-Kelley";
                                            }
                                        } else {
                                            vm.brandValueForImage = "0"
                                            boiler["brand"] = "Patterson-Kelley";
                                        }
                                    })

                                    vm.boilersCount += site.boilers.length;

                                    if(site.boilers.length > 0) vm.boiler = site.boilers;

                                });
                                // new added end


                                console.log("vm.sites??????????????????????", vm.sites);
                            }, fail);
                        }, 5000);
                    }

                    vm.parent.user.autoRefreshBoilers = vm.autoRefresh;

                    $user.replace(vm.parent.user, angular.noop, angular.noop);
                };

                // function getBoilerReadRecord(numRecords, boilerId) {
                //     var params = {
                //         "id": boilerId,
                //         "isDeleted": false,
                //         filter: {
                //             order: 'receivedDate DESC',
                //             limit: numRecords
                //         }
                //     };
                //     // console.log("params", params);
                //     return Boiler.boilerRecords(params).$promise;
                // }

                

                function getBoilerReadRecord(numRecords, boilerId) {
                    // Cancel previous request if it exists
                    if (vm.pendingRequests[boilerId]) {
                        vm.pendingRequests[boilerId].resolve();
                    }

                    // Create a new deferred object for cancellation
                    vm.pendingRequests[boilerId] = $q.defer();

                    var params = {
                        id: boilerId,
                        isDeleted: false,
                        filter: {
                            order: 'receivedDate DESC',
                            limit: numRecords
                        }
                    };

                    return Boiler.boilerRecords(params, {
                        timeout: vm.pendingRequests[boilerId].promise // Attach cancellation token
                    }).$promise;
                }

                function success(data) {
                    vm.boilersCount = -1;
                    vm.autoRefresh = vm.parent.user.autoRefreshBoilers;

                    vm.parent.spinner = false;
                    console.log("data[0]", data[0]);
                    console.log("data[1]", data[1]);
                    console.log("data[2]", data[2]);
                    vm.sites = data[0].sort(function(a, b) { return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1 });
                    console.log("vm.sites", vm.sites);
                    angular.forEach(vm.sites, function (site, key) {
                        
                        site.boilers = site.boilers.sort(function(a, b) { return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1 })
                        angular.forEach(site.boilers, function (boiler, key) {
                            
                            var boilerReadDataArray = boiler.boilerReadRecordData.length > 0 ? boiler.boilerReadRecordData[0] : [];
                            var brandOfBoiler = boilerReadDataArray.filter(function(obj) {if(obj && obj.receivedData) {return obj.receivedData.data.brand == "1" || obj.receivedData.data.brand == "0"} else {return []} });

                            if(brandOfBoiler && brandOfBoiler.length > 0) {
                                if(brandOfBoiler[0].receivedData.data.brand == "1") {
                                    vm.brandValueForImage = "1"
                                    boiler["brand"] = "Weil-McLain";
                                } else {
                                    vm.brandValueForImage = "0"
                                    boiler["brand"] = "Patterson-Kelley";
                                }
                            } else {
                                vm.brandValueForImage = "0"
                                boiler["brand"] = "Patterson-Kelley";
                            }
                            
                            // getBoilerReadRecord(500, boiler.id)
                            // .then(function (boilerReadData) {
                            //     var brandOfBoiler = boilerReadData.filter(function(obj) {return obj.receivedData.data.brand == "1" || obj.receivedData.data.brand == "0"});
                            //     if(brandOfBoiler && brandOfBoiler.length > 0) {
                            //         if(brandOfBoiler[0].receivedData.data.brand == "1") {
                            //             boiler["brand"] = "Weil-McLain";
                            //             // vm.brand = "Weil-McLain";
                            //         } else {
                            //             boiler["brand"] = "Patterson-Kelley";
                            //             // vm.brand = "Patterson-Kelley";
                            //         }
                            //     } else {
                            //         boiler["brand"] = "Patterson-Kelley";
                            //         // vm.brand = "Patterson-Kelley";
                            //     }
                            // })
                        })

                        vm.boilersCount += site.boilers.length;

                        if(site.boilers.length > 0) vm.boiler = site.boilers;

                    });
                    // console.log("vm.sites", vm.sites);

                    vm.boilersCount++; // as boilerCount initially -1, I am increasing it with one.

                    if(vm.boilersCount == 1 && $sharedMethods.getLoginInit() == true) {
                        $sharedMethods.setLoginInit(false);
                        $state.go('common.boiler-details',{siteId:vm.boiler[0].siteId,boilerId: (vm.boiler && vm.boiler[0].id )? vm.boiler[0].id : vm.boiler[0]._id});
                        return;
                    }

                    vm.boilerimages = data[1];
                    console.log("vm.boilerimages", vm.boilerimages);
                    var bmdata = data[2];
                    console.log("data[2]", bmdata);
                    if (!vm.boilerimages) {
                        console.log("if::::::");
                        for (var j = 0; j < bmdata.length; j++) {
                            // var flag = 0;
                            // for (var i = 0; i < vm.boilerimages.length; i++) {
                            //     // var imagename = vm.boilerimages[i].id.split('.');
                            //     var imagename = vm.boilerimages[i].name.split('.');
                            //     console.log("imagename", imagename[0]);
                            //     console.log("bmdata[j].imageFile", bmdata[j].imageFile);
                            //     var brandName = vm.boilerimages[i].brand;
                            //     console.log("brandName", brandName);
                            //     if ((bmdata[j].imageFile == imagename[0]) && (bmdata[j].brand == brandName)) {
                            //         console.log("imagename::::::::::::::::::");
                            //         flag = 1;
                            //     }
                            // }
                            if (!flag) bmdata[j].imageFile = '';
                        }
                    } else {
                        console.log("else");
                        for (var j = 0; j < bmdata.length; j++) {
                            var flag = 0;
                            for (var i = 0; i < vm.boilerimages.length; i++) {
                                // var imagename = vm.boilerimages[i].id.split('.');
                                var imagename = vm.boilerimages[i].name.split('.');
                                var brandName = vm.boilerimages[i].brand;
                                if ((bmdata[j].imageFile == imagename[0]) && (bmdata[j].brand == brandName)) {
                                    flag = 1;
                                }
                            }
                            if (!flag) bmdata[j].imageFile = '';
                        }
                        console.log("bmdata::::>>>>>>>>>>>", bmdata);
                    }

                    vm.boilerModels = bmdata;
                    console.log("vm.boilerModels", vm.boilerModels);
                    vm.boilerStates = data[3];
                    vm.boilerStatuses = data[4];

                    vm.user = LoopBackAuth.currentUserData;
                    if (vm.user.roles.length > 0 && (vm.user.roles[0].name == 'pkAdmin' || vm.user.roles[0].name == 'pkTech')) {
                        // var result =  Site.find({filter: {include: "boilers"}}).$promise;
                        var result =  Site.find({filter: {include: "boilers"}}).$promise;
                        var index = 0;
                        result.then(function(sites) {
                            angular.forEach(sites, function (site, key) {
                                index = index + 1;
                                if (index == sites.length) {
                                    // console.log("sites::::::::::", sites);
                                    vm.allsites = sites;
                                    return;
                                }
                                // angular.forEach(site.boilers, function (boiler, key) {
                                //     var boilerId = boiler.id ? boiler.id : boiler._id
                                //     getBoilerReadRecord(500, boilerId).then(function (boilerReadData) {
                                //         boiler['boilerReadRecordData'] = (boilerReadData && boilerReadData.length > 0) ? boilerReadData : [];
                                //         var boilerReadDataArray = boiler.boilerReadRecordData;
                                //         var brandOfBoiler = boilerReadDataArray.filter(function(obj) {if(obj && obj.receivedData) {return obj.receivedData.data.brand == "1" || obj.receivedData.data.brand == "0"} else {return []} });
                                //         if(brandOfBoiler && brandOfBoiler.length > 0) {
                                //             if(brandOfBoiler[0].receivedData.data.brand == "1") {
                                //                 boiler["brand"] = "Weil-McLain";
                                //             } else {
                                //                 boiler["brand"] = "Patterson-Kelley";
                                //             }
                                //         } else {
                                //             boiler["brand"] = "Patterson-Kelley";
                                //         }
                                //     })
                                // })

                                angular.forEach(site.boilers, function (boiler) {
                                    var boilerId = boiler.id ? boiler.id : boiler._id;
                            
                                    getBoilerReadRecord(500, boilerId).then(function (boilerReadData) {
                                        // **Introduce a delay before updating the UI**
                                        // $timeout(function () {
                                            boiler.boilerReadRecordData = (boilerReadData && boilerReadData.length > 0) ? boilerReadData : [];
                            
                                            var brandOfBoiler = boiler.boilerReadRecordData.filter(function (obj) {
                                                return obj && obj.receivedData && (obj.receivedData.data.brand == "1" || obj.receivedData.data.brand == "0");
                                            });
                            
                                            if (brandOfBoiler.length > 0) {
                                                boiler["brand"] = (brandOfBoiler[0].receivedData.data.brand == "1") ? "Weil-McLain" : "Patterson-Kelley";
                                            } else {
                                                boiler["brand"] = "Patterson-Kelley";
                                            }
                                        // }, 3000); // Delay UI update by 3 seconds (adjust as needed)
                                    });
                                });
                            })
                            // console.log("sites::::::::::", sites);
                            // vm.allsites = sites;
                        })
                        

                        // getSites().then(function (data) {
                        //     vm.allsites = data;
                        //     console.log("vm.allsites", vm.allsites);
                        //     angular.forEach(vm.allsites, function (site, key) {
                        //         angular.forEach(site.boilers, function (boiler, key) {
                        //             var boilerReadDataArray = boiler.boilerReadRecordData.length > 0 ? boiler.boilerReadRecordData[0] : [];
                        //             var brandOfBoiler = boilerReadDataArray.filter(function(obj) {return obj.receivedData.data.brand == "1" || obj.receivedData.data.brand == "0"});
        
                        //             if(brandOfBoiler && brandOfBoiler.length > 0) {
                        //                 if(brandOfBoiler[0].receivedData.data.brand == "1") {
                        //                     boiler["brand"] = "Weil-McLain";
                        //                 } else {
                        //                     boiler["brand"] = "Patterson-Kelley";
                        //                 }
                        //             } else {
                        //                 boiler["brand"] = "Patterson-Kelley";
                        //             }
                        //         })
        
                        //     });
                        // }, fail);
                    }
                    else {
                        vm.allsites = vm.sites;
                        console.log("vm.allsites", vm.allsites);
                    }

                    $timeout(function () {
                        if (vm.sites.length == 0) {
                            vm.noboilers = true;
                        }
                    });

                    vm.changeRefresh();
                }

                function fail(error) {
                    vm.parent.spinner = false;
                }

                function getSites() {

                        // var params = {"id": $user.getUserId(), filter: {include: "boilers"}};
                        // return User.sites(params).$promise;

                        var params = {"id": $user.getUserId()};
                        return Site.getSitesData(params).$promise;
                }

                function successBoilerBrand(data) {
                    var siteData = data[0];
                    console.log("successBoilerBrand data::::::", siteData[0].boilers);
                }

                function failBoilerboiler() {}

                function init() {
                    $scope.addboilers = false;
                    vm.parent.spinner = true;
                    if (LoopBackAuth.currentUserData) {

                        // var sitesDataForBrand = $q.all([
                        //     getSites()
                        // ]);
                        // console.log("sitesDataForBrand::::", sitesDataForBrand);
                        // // console.log("boiler with brand", sitesDataForBrand[0]);
                        // sitesDataForBrand.then(successBoilerBrand, failBoilerboiler)
                        var result = $q.all([
                            getSites(),
                            BoilerImage.find().$promise,
                            BoilerModel.find().$promise,
                            BoilerState.find().$promise,
                            BoilerStatus.find().$promise
                        ]);
                        console.log("result", result);
                        result.then(success, fail);
                    }
                    else {
                        $timeout(init, 1000);
                    }
                }

                function isBoilerConnected(boiler, site) {

                    var nowInTZ = moment.tz(site.timeZone.zone);
                    boiler.connected = nowInTZ.diff(boiler.lastUpdated, 'hours') < 1;
                    return boiler.connected;
                }

                function preInit() {
                    // By Login, user will not have roles, we are fetching it now.
                    $user.authorize(init, angular.noop);
                }

                function getBoilersCount(count) {
                    vm.boilersCount += count;
                    return count;
                }

                function getState (brand, boiler) {  
                    if((boiler.state != undefined && boiler.state != null) && vm.boilerStates && vm.boilerStates.length > 0) {
                        var boilerBrand = (brand == "Weil-McLain") ? "1" : "0";
                        var filterdstate = vm.boilerStates.filter(function(state) {return state.brand == boilerBrand})
                        var stateValue = filterdstate ? filterdstate[boiler.state].text : "";
                        return stateValue;   
                    } else {
                        return "";
                    }
                }

                function getStatus (brand, boiler) {
                    if((boiler.status != undefined && boiler.status != null) && vm.boilerStatuses && vm.boilerStatuses.length > 0) {
                        var boilerBrand = (brand == "Weil-McLain") ? "1" : "0";
                        var filteredStatuses = vm.boilerStatuses.filter(function(status) {return status.brand == boilerBrand})
                        var statusValue = filteredStatuses ? filteredStatuses[boiler.status].text : ""
                        return statusValue;
                    } else {
                        return "";
                    }
                }

                function isBoierFiltered(boiler) {
                    var text = $scope.searchBoilers.toLowerCase();
                    if (boiler.name.toLowerCase().search(text.toLowerCase()) > -1 ||
                        boiler.nuroSN.toLowerCase().search(text.toLowerCase()) > -1 ||
                        boiler.solaSN.toLowerCase().search(text.toLowerCase()) > -1
                        ) {
                            // console.log("boiler", boiler);
                        return true;
                    }
                    else return false;
                }

                function goToDetailsPage(siteId, boilerId, brand) {
                    console.log("siteId", siteId);
                    console.log("boilerId", boilerId);
                    console.log("brand", brand);
                    $state.go('common.boiler-details', {siteId:siteId,boilerId: boilerId});
                    // common.boiler-details({siteId:site.id,boilerId: boiler.id})
                    localStorage.setItem("selectedBrand", brand)
                }

                $scope.myImageFilter = function(brand, item) {
                    var boilerBrand = (brand == "Weil-McLain") ? "1" : "0";
                    var modelFilter = (vm.boilerModels && vm.boilerModels.length > 0 && vm.boilerModels.filter(function(obj) {return obj.brand == boilerBrand && obj.modelKey == item.model}).length > 0) ? vm.boilerModels.filter(function(obj) {return obj.brand == boilerBrand && obj.modelKey == item.model})[0].imageFile : '';
                    var imageOfBoiler = modelFilter ? modelFilter : '';
                    return imageOfBoiler;
                }

                vm.getBoilersCount = getBoilersCount;
                vm.getState = getState;
                vm.getStatus = getStatus;
                vm.isBoierFiltered = isBoierFiltered;
                vm.goToDetailsPage = goToDetailsPage;

                vm.init = init;
                vm.isBoilerConnected = isBoilerConnected;
                preInit();

                // Clean up pending requests on navigation change
                $scope.$on('$destroy', function () {
                    angular.forEach(vm.pendingRequests, function (request) {
                        if (request) request.resolve(); // Cancel pending requests
                    });
                });
            }
        ]);
})();


angular.module('harsco-pk').filter('boilersfilter', function () {
    return function (items, text) {
        if (!text) {
            return items;
        }


        return items.filter(function (element, index, array) {

            if (element.name.toLowerCase().search(text.toLowerCase()) > -1) {
                return true;
            }

            for (var i = 0; i < element.boilers.length; i++) {
                if (element.boilers[i].name.toLowerCase().search(text.toLowerCase()) > -1 ||
                    element.boilers[i].nuroSN.toLowerCase().search(text.toLowerCase()) > -1 ||
                    element.boilers[i].solaSN.toLowerCase().search(text.toLowerCase()) > -1
                    ) {
                    return true;
                }
            }


        });
    };
});
