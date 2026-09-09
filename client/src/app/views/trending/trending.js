(function () {

    angular.module('harsco-pk')
        .config(function ($compileProvider) {
            $compileProvider.preAssignBindingsEnabled(true);
        })
        .controller('TrendingController', [
            '$scope', '$state', '$stateParams', '$toast', '$user', 'Boiler', 'User', 'Site', '$mdDialog', 'UserToSite',
            '$http', 'LoopBackAuth', '$timeout', '$mdpTimePicker', 'BoilerState', 'BoilerStatus', 'ErrorCode',
            'ActiveModeDemand', '$q', 'filterFilter','$dialog',
            function ($scope, $state, $stateParams, $toast, $user, Boiler, User, Site, $mdDialog, UserToSite,
                      $http, LoopBackAuth, $timeout, $mdpTimePicker, BoilerState, BoilerStatus, ErrorCode,
                      ActiveModeDemand, $q, filterFilter, $dialog) {

                //constants
                var FETCH_LIMIT = 360;

                var vm = this;
                vm.interval = 0;
                vm.range = 0;
                vm.model = {
                    title: 'Trending'
                };
                vm.today = new Date();
                vm.tabledata = {};
                vm.err = false;

                vm.parent = $scope.vmr;

                var axisLabel = 'F';

                vm.boilers = [];

                vm.toDate = new Date();


                vm.setRange = function(range) {
                    vm.range = range;

                    switch (range) {
                        case 0:

                            vm.fromDate = new Date();
                            vm.fromDate.setHours(vm.fromDate.getHours() - 1);
                            vm.fromDate.setSeconds(0);
                            vm.fromDate.setMilliseconds(0);

                            vm.toDate = new Date();

                            break;
                        case 1:
                            vm.fromDate = new Date();
                            vm.fromDate.setDate(vm.fromDate.getDate() - 1);
                            vm.fromDate.setHours(0, 0, 0);

                            vm.toDate = new Date(vm.fromDate);
                            vm.toDate.setHours(23, 59, 59);

                            break;
                        case 2:

                            vm.fromDate = new Date();
                            vm.fromDate.setDate(vm.fromDate.getDate() - 7);
                            vm.fromDate.setHours(0, 0, 0);

                            vm.toDate = new Date(vm.fromDate);
                            vm.toDate.setDate(vm.fromDate.getDate() + 6);
                            vm.toDate.setHours(23, 59, 59);

                            break;
                        case 3:
                            vm.fromDate = new Date();
                            vm.fromDate.setDate(vm.fromDate.getDate() - 30);
                            vm.fromDate.setHours(0, 0, 0);

                            vm.toDate = new Date();
                            vm.toDate.setDate(vm.toDate.getDate() - 1);
                            vm.toDate.setHours(23, 59, 59);


                            vm.interval = 60;
                            break;
                        case 4:
                            vm.fromDate = new Date();
                            vm.fromDate.setFullYear(vm.fromDate.getFullYear() - 1);
                            vm.fromDate.setHours(0, 0, 0);

                            vm.toDate = new Date();
                            vm.toDate.setDate(vm.toDate.getDate() - 1);
                            vm.toDate.setHours(23, 59, 59);


                            vm.interval = 720;
                            break;
                        case 5:
                            vm.fromDate = new Date();
                            vm.startDate = new Date(vm.fromDate);

                            break;
                        default:
                            vm.fromDate.setHours(vm.toDate.getHours() - 1);
                            break;
                    }

                };


                vm.changeRange = function (range) {

                    vm.range = range;

                    switch (range) {
                        case 0:

                            vm.startDate = new Date(vm.fromDate);
                            vm.endDate = new Date(vm.fromDate);

                            vm.endDate.setHours(vm.endDate.getHours() + 1);
                            vm.interval = 0.0001;
                            break;
                        case 1:

                            vm.startDate = new Date(vm.fromDate);
                            vm.startDate.setHours(0, 0, 0);

                            vm.endDate = new Date(vm.startDate);
                            vm.endDate.setHours(23, 59, 59);
                            vm.interval = 2;
                            break;
                        case 2:
                            vm.startDate = new Date( vm.fromDate);

                            vm.endDate = new Date(vm.startDate);
                            vm.endDate.setDate(vm.startDate.getDate() + 6);
                            vm.endDate.setHours(23, 59, 59);

                            vm.interval = 12;
                            break;
                        case 3:

                            vm.startDate = new Date(vm.fromDate);

                            vm.endDate = new Date(vm.startDate);
                            vm.endDate.setDate(vm.startDate.getDate() + 30);
                            vm.interval = 60;
                            break;
                        case 4:
                            vm.startDate = new Date(vm.fromDate);

                            vm.endDate = new Date(vm.startDate);
                            vm.endDate.setDate(vm.startDate.getDate() + 365);

                            vm.interval = 720;
                            break;
                        case 5:
                            vm.startDate = new Date(vm.fromDate);
                            vm.startDate.setHours(0, 0, 0);

                            vm.endDate = new Date(vm.toDate);

                            break;
                        default:
                            vm.fromDate.setHours(vm.toDate.getHours() - 1);
                            break;
                    }

                    var date1 = new Date(vm.startDate);
                    var date2 = new Date(vm.endDate);
                    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    if (vm.range == 5) {
                        if (date2.getTime() < date1.getTime()) {
                            vm.err = true;
                            return;
                        }
                        vm.err = false;
                        vm.interval = Math.round((diffDays * 24 * 60) / 720);
                    }

                   callAPI();
                };

                function getBoilerRecords(boilerId, skip) {
                    var params = {
                        "boilerId": boilerId,
                        filter: {
                            where: {
                                receivedDate: {
                                    gte: vm.startDate,
                                    lt: vm.endDate
                                }
                            },
                            order: 'receivedDate DESC',
                            skip: skip,
                            limit: FETCH_LIMIT,
                            interval: vm.interval
                        }
                    };

                    // return Boiler.boilerRecords(params).$promise;

                    //new changes
                    // replace "id": boilerId, with "boilerId": boilerId,
                    //return Boiler.boilerRecords(params).$promise; with
                    return  Boiler.records(params).$promise;
                }

                function loadFuelUsage(aBoiler, skip) {
                    var params = {
                        "boilerId": aBoiler.id,
                        filter: {
                            where: {
                                receivedDate: {
                                    gte: vm.startDate,
                                    lt: vm.endDate
                                }
                            },
                            order: 'receivedDate DESC',
                            skip: skip,
                            limit: FETCH_LIMIT,
                            interval: vm.interval
                        }
                    };

                    Boiler.site({
                        "id": aBoiler.id
                    }).$promise.then(function (siteinfo) {

                            siteinfo.fuel = siteinfo.fuel || '$0';

                            var sitefuelvalue = siteinfo.fuel.replace('$', '');

                            Boiler.fuelUsage(params).$promise.then(function (fuel) {

                                var fuelusage = 0,
                                    fuelusageintherms = 0,
                                    totalfuelcost = 0;


                                if (fuel.length > 0) {

                                    fuelusageintherms = parseFloat(fuel[0].fuelusage) / 1000000;

                                    totalfuelcost = parseFloat((fuelusageintherms * sitefuelvalue));
                                    fuelusageintherms = parseFloat(fuelusageintherms).toFixed(2);
                                }

                                vm.tabledata[aBoiler.id].fuelusage = fuelusageintherms;
                                vm.tabledata[aBoiler.id].convertfuelusage = fuelusageintherms;
                                vm.tabledata[aBoiler.id].totalfuelcost = parseFloat(totalfuelcost);
                            });
                        })
                }

                function getBoilerReadRecord(numRecords, boilerId) {
                    var params = {
                        "id": boilerId,
                        filter: {
                            order: 'receivedDate DESC',
                            limit: numRecords
                        }
                    };
                    // console.log("params", params);
                    return Boiler.boilerRecords(params).$promise;
                }

                function loadRecords(aBoiler, skip) {
                    console.log("aBoiler:::>>>", aBoiler);
                    // console.log("aBoiler.brand", aBoiler.brand);
                    //getBoilerRecords(aBoiler.id, skip);
                    var brandValue;
                    getBoilerReadRecord(500, aBoiler.id)
                        .then(function (boilerReadData) {
                            console.log("boilerReadData>>>>", boilerReadData);
                            var brandOfBoiler = boilerReadData.filter(function(obj) {return obj.receivedData.data.brand == "1" || obj.receivedData.data.brand == "0"});
                            console.log("brandOfBoiler>>>>>>", brandOfBoiler);
                            if(brandOfBoiler && brandOfBoiler.length > 0) {
                                if(brandOfBoiler[0].receivedData.data.brand == "1") {
                                    // vm.boilers[key]["brand"] = "Weil-McLain";
                                    brandValue = "1";
                                } else {
                                    // vm.boilers[key]["brand"] = "Patterson-Kelley";
                                    brandValue = "0";
                                }
                            } else {
                                // vm.boilers[key]["brand"] = "Patterson-Kelley";
                                brandValue = "0";
                            }
                            console.log("brandValue>>>>", brandValue);
                            //start fetching the data per boiler
                    getBoilerRecords(aBoiler.id, skip).then(function (data) {
                        vm.parent.spinner = false;

                        aBoiler.boilerRecords = data.concat(aBoiler.boilerRecords);
                        // console.log("aBoiler.boilerRecords", aBoiler.boilerRecords);
                        aBoiler.boilerRecords.sort(function(a,b){
                            return new Date(b.receivedDate) - new Date(a.receivedDate);
                        });
                        aBoiler.graphLines.map(function (aLine) {
                            aLine.values = [];
                            var aDataPoint = vm.dataPoints[aLine.name];
                            try {
                                aLine.values =
                                    aBoiler.boilerRecords.map(function (d) {
                                        if (d.receivedData.data == null) {
                                            return {
                                                x: d.receivedDate,
                                                y: null
                                            }
                                        } else {
                                            if (aLine.bitIndex !== undefined) {
                                                return {
                                                    x: d.receivedDate,
                                                    y: +toBits(d.receivedData.data[aLine.name], aDataPoint.options.length)[aLine.bitIndex]
                                                };
                                            }

                                            var value = errorCheck(d.receivedData.data[aLine.name], aDataPoint.min, aDataPoint.max, aDataPoint.precision);

                                            if (vm.user.temperature && vm.user.temperature.id != 0 && aDataPoint.trendGroup == 'temp') {
                                                var celsiusVal = (value - 32) * 5 / 9;
                                                value = Math.round(celsiusVal * 10) / 10;
                                                axisLabel = 'C';
                                            }

                                            if (aLine.group == "state") {
                                                //console.log(aLine.name +':::'+ d.receivedDate +':::'+ value);
                                                return {
                                                    x: d.receivedDate,
                                                    y: +value,
                                                    z: getText(value, aLine.name, brandValue)
                                                };
                                            }
                                            return {
                                                x: d.receivedDate,
                                                y: +value
                                            };
                                        }
                                    }).reverse().concat(aLine.values);
                            }
                            catch (e) {

                            }
                        });

                        vm.updateGraph('temp');
                        vm.updateGraph('current');
                        vm.updateGraph('state');
                        vm.updateGraph('relay');

                        if (aBoiler.boilerRecords.length > 0) {
                            var burnercyclecount = parseInt(aBoiler.boilerRecords[0].receivedData.data.cycles) - parseInt(aBoiler.boilerRecords[aBoiler.boilerRecords.length - 1].receivedData.data.cycles);
                            var burnerruntime = parseInt(aBoiler.boilerRecords[0].receivedData.data.runtime) - parseInt(aBoiler.boilerRecords[aBoiler.boilerRecords.length - 1].receivedData.data.runtime);

                        } else {
                            var burnercyclecount = 0;
                            var burnerruntime = 0;
                        }

                        vm.tabledata[aBoiler.id].burnercyclecount = burnercyclecount;
                        vm.tabledata[aBoiler.id].burnerruntime = burnerruntime;

                        //if we got the exact length then fetch the next batch
                        if (aBoiler.loading && (data.length === FETCH_LIMIT)) {
                            setTimeout(function () {
                                loadRecords(aBoiler, aBoiler.boilerRecords.length);
                            }, 100);
                        }
                    });

                        })
                    // //start fetching the data per boiler
                    // getBoilerRecords(aBoiler.id, skip).then(function (data) {
                    //     vm.parent.spinner = false;

                    //     aBoiler.boilerRecords = data.concat(aBoiler.boilerRecords);
                    //     // console.log("aBoiler.boilerRecords", aBoiler.boilerRecords);
                    //     aBoiler.boilerRecords.sort(function(a,b){
                    //         return new Date(b.receivedDate) - new Date(a.receivedDate);
                    //     });
                    //     aBoiler.graphLines.map(function (aLine) {
                    //         aLine.values = [];
                    //         var aDataPoint = vm.dataPoints[aLine.name];
                    //         try {
                    //             aLine.values =
                    //                 aBoiler.boilerRecords.map(function (d) {
                    //                     if (d.receivedData.data == null) {
                    //                         return {
                    //                             x: d.receivedDate,
                    //                             y: null
                    //                         }
                    //                     } else {
                    //                         if (aLine.bitIndex !== undefined) {
                    //                             return {
                    //                                 x: d.receivedDate,
                    //                                 y: +toBits(d.receivedData.data[aLine.name], aDataPoint.options.length)[aLine.bitIndex]
                    //                             };
                    //                         }

                    //                         var value = errorCheck(d.receivedData.data[aLine.name], aDataPoint.min, aDataPoint.max, aDataPoint.precision);

                    //                         if (vm.user.temperature && vm.user.temperature.id != 0 && aDataPoint.trendGroup == 'temp') {
                    //                             var celsiusVal = (value - 32) * 5 / 9;
                    //                             value = Math.round(celsiusVal * 10) / 10;
                    //                             axisLabel = 'C';
                    //                         }

                    //                         if (aLine.group == "state") {
                    //                             //console.log(aLine.name +':::'+ d.receivedDate +':::'+ value);
                    //                             return {
                    //                                 x: d.receivedDate,
                    //                                 y: +value,
                    //                                 z: getText(value, aLine.name, aBoiler.brand)
                    //                             };
                    //                         }
                    //                         return {
                    //                             x: d.receivedDate,
                    //                             y: +value
                    //                         };
                    //                     }
                    //                 }).reverse().concat(aLine.values);
                    //         }
                    //         catch (e) {

                    //         }
                    //     });

                    //     vm.updateGraph('temp');
                    //     vm.updateGraph('current');
                    //     vm.updateGraph('state');
                    //     vm.updateGraph('relay');

                    //     if (aBoiler.boilerRecords.length > 0) {
                    //         var burnercyclecount = parseInt(aBoiler.boilerRecords[0].receivedData.data.cycles) - parseInt(aBoiler.boilerRecords[aBoiler.boilerRecords.length - 1].receivedData.data.cycles);
                    //         var burnerruntime = parseInt(aBoiler.boilerRecords[0].receivedData.data.runtime) - parseInt(aBoiler.boilerRecords[aBoiler.boilerRecords.length - 1].receivedData.data.runtime);

                    //     } else {
                    //         var burnercyclecount = 0;
                    //         var burnerruntime = 0;
                    //     }

                    //     vm.tabledata[aBoiler.id].burnercyclecount = burnercyclecount;
                    //     vm.tabledata[aBoiler.id].burnerruntime = burnerruntime;

                    //     //if we got the exact length then fetch the next batch
                    //     if (aBoiler.loading && (data.length === FETCH_LIMIT)) {
                    //         setTimeout(function () {
                    //             loadRecords(aBoiler, aBoiler.boilerRecords.length);
                    //         }, 100);
                    //     }
                    // });
                }

                function getDataPoints() {
                    return $http.get('/app/data-points.json');
                }

                vm.init = function () {
                    vm.parent.spinner = false;
                    angular.element('.nvtooltip').remove();

                    //draw the graphs only the first time
                    drawGraph('temp');
                    drawGraph('current');
                    drawGraph('state');
                    drawGraph('relay');

                    $q.all([
                        getDataPoints(),
                        BoilerState.find().$promise,
                        BoilerStatus.find().$promise,
                        ErrorCode.find().$promise,
                        ActiveModeDemand.find().$promise
                    ])
                        .then(function (response) {
                            vm.dataPoints = response[0].data;
                            console.log("vm.dataPoints", vm.dataPoints);
                            vm.loadSites(response[0]);
                            // console.log("vm.boilers:::>>????", vm.boilers);
                            vm.boilerStates = response[1];
                            console.log("vm.boilerStates", vm.boilerStates);
                            vm.boilerStatuses = response[2];
                            console.log("vm.boilerStatuses", vm.boilerStatuses);
                            vm.errorCodes = response[3];
                            console.log("vm.errorCodes", vm.errorCodes);
                            vm.activeModeDemand = response[4];
                            console.log("vm.activeModeDemand", vm.activeModeDemand);
                            // vm.loadSites(response[0]);
                        });
//
//                    getDataPoints()
//                        .then(function (response) {
//                            vm.dataPoints = response.data;
//                            vm.loadSites(response);
//                        });
                };

                vm.loadSites = function (response) {

                    var user = LoopBackAuth.currentUserData;
                    if (!user) {
                        $timeout(function () {
                            vm.loadSites(response)
                        }, 1000); // Note - when we refresh the page here, user object will become null, timeout will call the user api in user service to get it.
                    }
                    else {
                        vm.user = $user.getUser();

                        if (vm.user.roles.length > 0 && (vm.user.roles[0].name == 'pkAdmin' || vm.user.roles[0].name == 'pkTech')) {
                            var result = Site.find({filter: {include: "boilers"}}).$promise;
                        }
                        else {
                            var params = {"id": $user.getUserId(), filter: {include: "boilers"}};
                            var result = User.sites(params).$promise;
                        }

                        result.then(function (sites) {
                            vm.user = $user.getUser();
                            vm.sites = sites;
                            console.log("vm.sites", vm.sites);
                            var iterate = false;
                            for (var i = 0; i < vm.sites.length; i++) {
                                if (vm.sites[i].boilers.length > 0 && !iterate) {
                                    vm.selectedSite = vm.sites[i];
                                    break;
                                }
                            }
                            console.log("vm.selectedSite", vm.selectedSite);
                            //set initial time range, which will call site update
                            vm.setRange(0);
                            vm.changeRange(0);
                            //refresh the data, same as selecting the site
                            //callAPI();
                        });
                    }
                };

                vm.updateSite = function () {
                    console.log("updateSite")
                    if (!vm.boilers || !vm.selectedSite || !vm.selectedSite.boilers) {
                        return;
                    }
                    console.log("vm.selectedSite", vm.selectedSite);
                        var date1 = new Date(vm.fromDate);
                        var date2 = new Date(vm.toDate);
                        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    if (vm.range == 5) {
                        if (date2.getTime() < date1.getTime()) {
                            vm.err = true;
                            return;
                        }
                        vm.err = false;
                        vm.interval = Math.round((diffDays * 24 * 60) / 720);
                    }

                    //turn of loading previously selected.
                    vm.boilers.map(function (aBoiler) {
                        aBoiler.loading = false;
                    });

                    vm.boilers = vm.selectedSite.boilers;
                    console.log("vm.boilers", vm.boilers);

                    angular.forEach(vm.boilers, function (boiler, key) {
                        console.log("boiler.id", boiler.id);
                        getBoilerReadRecord(500, boiler.id)
                            .then(function (boilerReadData) {
                                console.log("boilerReadData>>>>", boilerReadData);
                                var brandOfBoiler = boilerReadData.filter(function(obj) {return obj.receivedData.data.brand == "1" || obj.receivedData.data.brand == "0"});
                                console.log("brandOfBoiler>>>>>>", brandOfBoiler);
                                if(brandOfBoiler && brandOfBoiler.length > 0) {
                                    if(brandOfBoiler[0].receivedData.data.brand == "1") {
                                        // vm.boilers[key]["brand"] = "Weil-McLain";
                                        vm.boilers[key]["brand"] = "1";
                                    } else {
                                        // vm.boilers[key]["brand"] = "Patterson-Kelley";
                                        vm.boilers[key]["brand"] = "0";
                                    }
                                } else {
                                    // vm.boilers[key]["brand"] = "Patterson-Kelley";
                                    vm.boilers[key]["brand"] = "0";
                                }
                            })
                    })
                    console.log("vm.boilers???????", vm.boilers);
                    // var brandOfBoiler = 
                    // vm.boilerStates = vm.boilerStates.filter(function(states) {return})
                    // vm.boilerStatuses = vm.boilerStates.filter(function(states) {return})
                    // vm.errorCodes = vm.boilerStates.filter(function(states) {return})
                    // vm.activeModeDemand = vm.boilerStates.filter(function(states) {return})
                    vm.boilers.map(function (aBoiler) {

                        aBoiler.loading = true;
                        aBoiler.graphLines = [];
                        aBoiler.boilerRecords = [];
                        vm.tabledata = {};

                        //for each data point, initialize graph line object
                        angular.forEach(vm.dataPoints, function (aDataPoint, key) {

                            if (!aDataPoint.trendable) return;

                            var i = undefined;
                            if (aDataPoint.options)
                                i = aDataPoint.options.length - 1;

                            do {
                                var label = aDataPoint.label;
                                if (aDataPoint.options)
                                    label = aDataPoint.options[i];

                                aBoiler.graphLines.push(
                                    {
                                        name: key,
                                        bitIndex: i,
                                        group: aDataPoint.trendGroup,
                                        key: aBoiler.name + ' ' + label,
                                        color: generateRandomColor(),
                                        disabled: true,
                                        type: "line",
                                        yAxis: aDataPoint.yAxis,
                                        values: []
                                    }
                                );

                                i--;
                            } while (i >= 0);
                        });
                    });
                    callAPI();
                };

                var chartObjects = {
                    'temp': {pxValue: 0},
                    'current': {pxValue: 0},
                    'state': {pxValue: 0},
                    'relay': {pxValue: 0}
                };

                function callAPI() {
                    console.log("callAPI::::");
                    var noOfMonths = monthDiff(vm.startDate, vm.endDate);

                    var startdate = vm.startDate,
                        enddate = vm.endDate;

                    vm.boilers.map(function (aBoiler) {
                        vm.parent.spinner = true;
                        vm.tabledata[aBoiler.id] = {
                            boilerName: aBoiler.name,
                            burnercyclecount: 0,
                            burnerruntime: 0,
                            fuelusage: '-- therms',
                            convertfuelusage: parseFloat(0.000),
                            totalfuelcost: '$-.---'
                        };

                        aBoiler.boilerRecords = [];
                        loadRecords(aBoiler, 0);
                        loadFuelUsage(aBoiler, 0);
                    });
                }

                function getStartDate() {
                    return vm.startDate;
                }

                function getEndDate() {
                    return vm.endDate;
                }

                var dateFormat = ['%I:%M %p', '%I:%M %p', '%m/%d', '%m/%d', '%m/%d', '%m/%d'];

                function drawGraph(graphType) {

                    var chartObj = chartObjects[graphType];

                    if (!chartObj) return;

                    nv.addGraph(function () {

                        chartObj.chart = nv.models.multiChart()
                            .margin({top: 10, right: 75, bottom: 20, left: 60})
                            .x(function (d) {
                                if (d) return new Date(d.x);
                            })
                            .y(function (d) {
                                if (d) return d.y;
                            })
                            .noData('')
                            .useInteractiveGuideline(true)
                            .showLegend(false);

                        chartObj.chart.interactiveLayer.tooltip.contentGenerator(function (d) {
                            var header = d.value;

                            if (!header) {
                                angular.element('.nvtooltip').css('display', 'none');
                                return;
                            }

                            header = moment(header).format('ddd Do MMM YYYY, h:mm:ss A [GMT]Z');

                            var headerhtml = "<thead><tr><td colspan='3'><strong class='x-value'>" + header + "</strong></td></tr></thead>";

                            var bodyhtml = "<tbody>";
                            var series = d.series;
                            series.forEach(function (d) {
                                if (d.data.z) var value = d.data.z;
                                else var value = d.value;

                                bodyhtml = bodyhtml + "<tr><td class='legend-color-guide'><div style='background-color: " + d.color + ";'></div></td><td class='key'>" + d.key + "</td><td class='value'>" + value + "</td></tr>";
                            });
                            bodyhtml = bodyhtml + "</tbody>";
                            return "<table>" + headerhtml + '' + bodyhtml + "</table>";
                        });

                        chartObj.chart.interactiveLayer.dispatch.on('elementMousemove.name', function (e) {
                            if (!e.pointXValue) return;
                            angular.forEach(chartObjects, function (aObj, key) {
                                if (!aObj.chart || !aObj.chart.lines1) {
                                    angular.element('.nvtooltip').css('display', 'none');
                                    return;
                                }
                                if (!aObj.pxValue || aObj.pxValue != e.pointXValue) {
                                    aObj.pxValue = e.pointXValue;
                                    aObj.chart.interactiveLayer.dispatch.elementMousemove(e);
                                }
                                aObj.chart.lines1.clearHighlights();
                            });
                            angular.element('.nvtooltip').css('display', 'block');
                        });

                        chartObj.chart.interactiveLayer.dispatch.on('elementMouseout.name', function (e) {
                            angular.forEach(chartObjects, function (aObj, key) {
                                if (!aObj.chart || aObj.chart.lines1) return;
                                aObj.pxValue = 0;
                                aObj.chart.lines1.clearHighlights();
                            });
                            angular.element('.nvtooltip').css('display', 'none');

                        });

                        chartObj.chart.xAxis
                            .showMaxMin(false)
                            .tickFormat(function (d) {
                                return d3.time.format(dateFormat[vm.range])(new Date(d));
                            });

                        if (graphType === 'relay') {
                            chartObj.chart.height(100);
                            chartObj.chart.yDomain1([0, 1]);
                            chartObj.chart.yAxis1
                                .ticks(1)
                                .showMaxMin(false)
                                .axisLabel("Relay");
                        } else if (graphType === 'current') {
                            chartObj.chart.height(200);
                            chartObj.chart.yDomain1([0, 100]);
                            chartObj.chart.yDomain2([0, 8000]);
                            chartObj.chart.yAxis1.axisLabel("mA / V / %");
                            chartObj.chart.yAxis2.axisLabel("RPM");
                        } else if (graphType === 'state') {
                            chartObj.chart.height(200);

                            chartObj.chart.yDomain1([0, 45]);
                            chartObj.chart.yAxis1
                                .showMaxMin(false)
                                .tickFormat(d3.format('d'))
                                .axisLabel("State, Status & Mode");
                            chartObj.chart.yAxis2
                                .showMaxMin(false)
                                .tickFormat(d3.format('d'))
                                .axisLabel("Error");
                        } else {
                            chartObj.chart.height(300);
                            chartObj.chart.yDomain1([-40, 260]);
                            chartObj.chart.yAxis1
                                .tickFormat(d3.format(',.1f'))
                                .axisLabel("°F");
                            chartObj.chart.noData('No Data Available. Select different time range.');
                        }

                        chartObj.chartData = d3.select("#" + graphType + " svg");

                        vm.updateGraph(graphType);

                        return chartObj.chart;
                    });
                }

                vm.updateGraph = function (graphType) {

                    var chartObj = chartObjects[graphType];
                    if (!chartObj) return;

                    var tempDataArray = [];

                    vm.boilers.map(function (aBoiler) {
                        tempDataArray = tempDataArray.concat(
                            aBoiler.graphLines.filter(function (value) {
                                return (value.group == graphType);
                            })
                        );
                    });

                    chartObj.chartData.datum(tempDataArray).attr('height', chartObj.chartData.style("width"));

                    //07/27/2017:KK: This is causing the data to sort based on min/max and the graph is not coming properly
                    // if(graphType === 'state') {
                    //     var temp_arr = tempDataArray.slice();
                    //     var checkY = "";
                    //     chartObj.chart.yDomain1([0, d3.max(temp_arr, function (d) { checkY = d.values; if (checkY.length <= 0) {return 0}; console.log(checkY); var max = checkY.sort(function(a,b) {return b.y- a.y}); return max[0].y; })]);
                    // }

                    chartObj.chartData.transition().duration(500).call(chartObj.chart);
                    if (graphType == 'temp') chartObj.chart.yAxis1.tickFormat(d3.format(',.1f')).axisLabel("°" + axisLabel);

                    nv.utils.windowResize(chartObj.chart.update);
                };

                vm.refreshGraph = function (graphType) {
                    setTimeout(function () {
                        console.log("chartObjects", chartObjects);
                        var chartObj = chartObjects[graphType];
                        console.log("chartObj", chartObj);
                        if (!chartObj) return;
                        chartObj.chart.update();

                        angular.forEach(chartObjects, function (aObj, key) {
                            if (!aObj.chart || aObj.chart.lines1) return;
                            aObj.pxValue = 0;
                            aObj.chart.lines1.clearHighlights();

                            aObj.chart.interactiveLayer.tooltip.hidden(true);
                            aObj.chart.tooltip.hidden(true);
                        });
                    }, 200);
                };

                function generateRandomColor() {
                    var letters = '012345'.split('');
                    var color = '#';
                    color += letters[Math.round(Math.random() * 5)];
                    letters = '0123456789ABCDEF'.split('');
                    for (var i = 0; i < 5; i++) {
                        color += letters[Math.round(Math.random() * 15)];
                    }
                    return color;
                }

                function errorCheck(value, min, max, precision) {

                    try {
                        switch (value & 0xFFFF) {
                            case undefined:
                            case 0x8000:
                            case 0x8100:
                            case 0x8300:
                            case 0x8400:
                            case 0x8500:
                                return '';
                                break;
                            default:
                                if (precision) {
                                    value = parseInt(value) * precision
                                }

                                if ((min && max) && (value < min) || (value) > max) {
                                    return '';
                                }

                                if (precision) {
                                    value = Math.round(value * 1 / precision) / (1 / precision); //round it based on precision
                                }

                                return value;

                                break;
                        }
                    } catch (e) {

                        return "";
                    }
                }

                function getText(value, item, brand) {
                    console.log("getText value", value);
                    console.log("getText item", item);
                    var brandValue = (brand == "0" || brand == "1") ? brand : "0";
                    console.log("brandValue", brandValue);
                    var boilerStateBrandVise = vm.boilerStates.filter(function(obj) {return obj.brand == brandValue});
                    var boilerStatusBrandVise = vm.boilerStatuses.filter(function(obj) {return obj.brand == brandValue});
                    var boilerErrorCodeBrandVise = vm.errorCodes.filter(function(obj) {return obj.brand == brandValue});
                    var boilerActiveModeDemandBrandVise = vm.activeModeDemand.filter(function(obj) {return obj.brand == brandValue});
                    if (item == "state") {
                        // return vm.boilerStates[value].text;
                        return boilerStateBrandVise[value].text;
                    }
                    if (item == "status") {
                        return boilerStatusBrandVise[value].text;
                        // return vm.boilerStatuses[value].text;
                    }
                    if (item == "errorcode") {
                        return filterFilter(boilerErrorCodeBrandVise, {errorKey: value.toString()}, true)[0].errorTitle;
                        // return filterFilter(vm.errorCodes, {errorKey: value.toString()}, true)[0].errorTitle;
                    }
                    if (item == "activedemand") {
                        // return vm.activeModeDemand[value].text;
                        return boilerActiveModeDemandBrandVise[value].text;
                    }
                }

                function toBits(int, len) {
                    try {
                        var bits = parseInt(int).toString(2);

                        var values = (len == 16) ? "0000000000000000".substr(bits.length) + bits : "00000000".substr(bits.length) + bits;
                        return values.split('').reverse().join('');
                    }
                    catch (e) {
                        console.log(e);
                    }
                }

                var i, acc = document.getElementsByClassName("trending-accordion");

                for (i = 0; i < acc.length; i++) {
                    acc[i].onclick = function () {
                        this.classList.toggle("active");
                        this.nextElementSibling.classList.toggle("show");
                    }
                }

                vm.printDiv = function () {
                    window.print();
                };

                vm.downloadDiv = function ($event) {
                    var count = 0;
                    var graphData = [];
                    var graphTypes = ['temp', 'current', 'state', 'relay'];

                    for (var i = 0; i < graphTypes.length; i++) {
                        var chartObj = chartObjects[graphTypes[i]];

                        var data = chartObj.chartData.datum();

                        data.map(function (item) {

                            if (item.disabled == false) {
                                count++;
                                graphData.push(item)
                            }
                        });

                    }

                    if(count > 12) {
                        $dialog.show($dialog.templates.DOWNLOAD_LIMIT, $event);
                    }
                    else
                        downloadCSV(graphData, "Graph data - " + new Date(), true);
                };

                vm.getSites = function (item) {

                    return  vm.sites.filter(function (element, index, array) {

                        if (element.name.toLowerCase().search(item.toLowerCase()) > -1 && element.boilers.length > 0) {
                            return true;
                        }

                    });
                };

                function downloadCSV(JSONData, ReportTitle, ShowLabel) {

                    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

                    var CSV = '';

                    CSV += ReportTitle + '\r\n\n';

                    if (ShowLabel) {
                        var row = "Boiler - Key,Time,Value";
                        CSV += row + '\r\n';
                    }
                    var unit = axisLabel;

                    for (var i = 0; i < arrData.length; i++) {

                        if (arrData[i].group == "temp") {
                            unit = "°" + axisLabel;
                        }
                        else if (arrData[i].group == "current") {
                            unit = "mA";
                        }
                        else if (arrData[i].group == "state") {
                            unit = "";
                        }
                        else {
                            unit = "";
                        }

                        for (var j = 0; j < arrData[i].values.length; j++) {
                            var row = "";
                            row += '"' + arrData[i].key + '",';
                            row += '"' + new Date(arrData[i].values[j].x) + '",';
                            row += '"' + arrData[i].values[j].y + ' ' + unit + '",';
                            row.slice(0, row.length - 1);
                            CSV += row + '\r\n';
                        }
                    }

                    if (CSV == '') {
                        return;
                    }

                    //Generate a file name
                    var fileName = "Nuro-Connect_";
                    fileName += ReportTitle.replace(/ /g, "_");
                    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

                    var link = document.createElement("a");
                    link.href = uri;

                    link.style = "visibility:hidden";
                    link.download = fileName + ".csv";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }

                function monthDiff(d1, d2) {
                    var months = moment(d2).diff(moment(d1), 'months', true);
                    return Math.round(months);
                }

                vm.init();
                vm.callAPI = callAPI;
            }
        ]);
})();

