(function () {

    angular.module('harsco-pk')

        .controller('BoilerDetailsController', [
            '$stateParams', '$toast', '$user', '$mdDialog', 'Boiler', 'BoilerImage', 'BoilerModel', 'BoilerState', 'BoilerStatus',
            'BoilerWriteRecord', 'BoilerFile', '$scope', 'LoopBackAuth', '$interval', '$dialog', '$rootScope', '$location',
            '$sharedMethods', 'ErrorCode', 'ServiceRep', 'Weather', 'RelayText', 'ActiveModeDemand', '$http', '$timeout', '$q', '$sce',
            function ($stateParams, $toast, $user, $mdDialog, Boiler, BoilerImage, BoilerModel, BoilerState, BoilerStatus,
                BoilerWriteRecord, BoilerFile, $scope, LoopBackAuth, $interval, $dialog, $rootScope, $location,
                $sharedMethods, ErrorCode, ServiceRep, Weather, RelayText, ActiveModeDemand, $http, $timeout, $q, $sce) {

                //constants
                var FETCH_LIMIT = 360;
                var isBoilerApiComplete = false;

                //this is in top nav bar, so use scope
                $scope.currTemp = "--";
                $scope.imageURLPath = imageURL;
                $scope.access_token = LoopBackAuth.accessTokenId;


                var vm = this;
                var downloadCount = 0;
                vm.parent = $scope.vmr; // Note - Common controller inject

                vm.model = { title: "" };
                vm.lastUpdateInterval = undefined;
                vm.boilerId = $stateParams.boilerId;

                vm.boilerRecord = {};
                vm.boilerRecord.data = {};
                vm.boilerRecord.units = {};
                // Initailly writeableData making 0 to avaid NaN issue in slider, while data is not loading
                vm.boilerRecord.writeableData = {
                    chsetpoint: 0,
                    dhwsetpoint: 0,
                    dhwtanksetpoint: 0
                };
                vm.stateLoad = "Loading...";
                vm.boilerModes = ['Standalone', 'Cascade Master', 'Cascade Member'];

                vm.relayA = "Relay A";
                vm.relayB = "Relay B";
                vm.relayC = "Relay C";
                vm.relayD = "Relay D";


                function addRecord(aRecord) {

                    var shiftValues;
                    if (vm.boiler.graphLines['supply'][0].values.length > FETCH_LIMIT) {
                        shiftValues = true;
                    }

                    var tempData = { data: {} };



                    vm.digitalio = toBits(aRecord.receivedData.data.digitalio, 16).split('');
                    vm.annunciator = toBits(aRecord.receivedData.data.annunciator, 8).split('');

                    angular.forEach(aRecord.receivedData.data, function (value, key) {
                        try {
                            var aDataPoint = vm.dataPoints[key];

                            if (!aDataPoint) return; //there is no data point associated with this key, don't process

                            var unit = aDataPoint.unit;
                            //if it is a point that is not visible on the ui, ignore it
                            if (aDataPoint.visible === false) return;

                            vm.boilerRecord.units[key] = undefined;
                            tempData.data[key] = undefined;

                            //check errors/exceptions
                            tempData.data[key] = errorCheck(value, aDataPoint.min, aDataPoint.max, aDataPoint.precision);

                            //reached here means no exception
                            //next check temp units and convert

                            //Note - user profile shows Celsius & current key is temp
                            if (vm.user && vm.user.temperature && vm.user.temperature.id != 0 && aDataPoint.unit == " °F") {
                                var celsiusVal = (tempData.data[key] - 32) * 5 / 9;
                                tempData.data[key] = Math.round(celsiusVal * 10) / 10;
                                unit = " °C";
                            }

                            //insert units for the data point.
                            if (aDataPoint.unit) {
                                vm.boilerRecord.units[key] = unit;
                            }

                            //if user is modifying and the value is not readonly then return
                            if (!aDataPoint.readOnly) {
                                if ($scope.editForm.$dirty) {
                                    return;
                                } else {
                                    vm.boilerRecord.writeableData[key] = tempData.data[key];
                                }
                            }

                            vm.boilerRecord.data[key] = tempData.data[key];

                            if (key == 'activedemand') {
                                for (var i = 0; i < vm.activeModeDemands.length; i++) {
                                    if (vm.boilerRecord.data.activedemand == vm.activeModeDemands[i].key) {
                                        vm.boilerRecord.data.activedemand = vm.activeModeDemands[i].text;
                                    }
                                }
                            }

                            if (aDataPoint.trendable) {
                                if (shiftValues) vm.boiler.graphLines[key][0].values.shift();

                                vm.boiler.graphLines[key][0].values.push({
                                    x: moment(aRecord.receivedDate).tz(vm.site.timeZone.zone),
                                    y: +tempData.data[key]
                                });
                            }

                        } catch (err) {
                            try {
                                if (err && ('fan' === key)) {
                                    err = fanException(err);
                                } else if (err && ('chsetpoint' === key ||
                                    'dhwsetpoint' === key || 'dhwtanksetpoint' === key)) {
                                    err = setPointException(err);
                                } else if (err && ('dhw' === key)) {
                                    if (vm.boiler.dhwsensormode === 1) {
                                        err = dhwException(err);
                                    }
                                }
                                tempData.data[key] = 0;
                                vm.boilerRecord.data[key] = err;

                                var aDataPoint = vm.dataPoints[key];
                                if (!aDataPoint) return; //there is no data point associated with this key, don't process

                                var unit = aDataPoint.unit;

                                if (aDataPoint.trendable) {
                                    if (shiftValues) vm.boiler.graphLines[key][0].values.shift();

                                    vm.boiler.graphLines[key][0].values.push({
                                        x: moment(aRecord.receivedDate).tz(vm.site.timeZone.zone),
                                        y: +tempData.data[key]
                                    });
                                }
                            } catch (e) {
                                console.log('Inside catch While processing data');
                                console.log(e);
                            }
                        }

                    });

                    updateGraphs();

                    if (vm.lastUpdateInterval) {
                        $interval.cancel(vm.lastUpdateInterval);
                    }

                    var lastReceivedDate = moment(aRecord.receivedDate).tz(vm.site.timeZone.zone);

                    vm.lastUpdateInterval = $interval(function () {
                        var nowInTZ = moment.tz(vm.site.timeZone.zone);
                        vm.isBoilerConnected = nowInTZ.diff(lastReceivedDate, 'hours') < 1;
                        if (!vm.isBoilerConnected) vm.stateLoad = "Disconnected";
                        vm.lastupdated = moment.duration(lastReceivedDate.diff(nowInTZ)).humanize(true);

                        if(!vm.isBoilerConnected) {
                        $interval.cancel(vm.lastUpdateInterval);
                        $interval.cancel(vm.dataUpdateInterval);
                        }
                    }, 1);
                }

                function errorCheck(value, min, max, precision) {

                    switch (value & 0xFFFF) {
                        case undefined:
                            throw '--';
                            break;

                        case 0x8000:
                            throw 'Short';
                            break;

                        case 0x8100:

                            throw 'Open';
                            break;

                        case 0x8300:
                            throw 'Outside High Range';
                            break;

                        case 0x8400:
                            throw 'Outside Low Range';
                            break;

                        case 0x8500:
                            throw 'Unreliable';
                            break;

                        default:
                            if (precision) {
                                value = parseInt(value) * precision
                            }

                            if ((min && max) && (value < min) || (value) > max) {
                                throw 'Closed'
                            }

                            if (precision) {
                                value = Math.round(value * 1 / precision) / (1 / precision); //round it based on precision
                            }

                            return value;

                            break;
                    }
                }

                function fanException(value) {
                    if (value && 'Outside Low Range'.indexOf(value) != -1) {
                        return 'Off';
                    }

                    return value;
                }

                function setPointException(value) {
                    if (value && 'Outside High Range'.indexOf(value) != -1) {
                        return 'Off';
                    }

                    return value;
                }

                function dhwException(value) {
                    if (value && 'Short'.indexOf(value) != -1) {
                        return 'Closed';
                    }

                    return value;
                }

                function toBits(int, len) {
                    var bits = parseInt(int).toString(2);

                    if (len == 16) {
                        bits = "0000000000000000".substr(bits.length) + bits;
                    } else if (len == 8) {
                        bits = "00000000".substr(bits.length) + bits;
                    }

                    return bits;
                }

                function getSiteInfo() {
                    var params = {
                        "id": vm.boilerId
                    };

                    return Boiler.site(params).$promise;
                }

                function getBoilerInfo() {
                    var params = {
                        "id": vm.boilerId
                    };

                    return Boiler.findById(params).$promise;
                }

                function getDataPoints() {
                    return $http.get('/app/data-points.json');
                }

                // function getWeatherReport() {
                //     var params = {
                //         "id": vm.site.zip
                //     };

                //     Weather.zip(params).$promise
                //         .then(function (data) {
                //             if (vm.user && vm.user.temperature && vm.user.temperature.id != 0) {
                //                 var celsiusVal = (data.temp - 32) * 5 / 9;
                //                 $scope.currTemp = (Math.round(celsiusVal * 10) / 10) + "°C";
                //             }
                //             else
                //                 $scope.currTemp = data.temp + "°F";
                //         });
                // }

                function getServiceRepInfo() {
                    var params = {
                        "id": vm.site.zip
                    };

                    ServiceRep.zip(params).$promise
                        .then(function (data) {
                            var cont = data.Contact.split("Contact:");
                            data.Contact = cont[1].trim();
                            vm.serviceRep = data;
                        });
                }

                function getBoilerReadRecord(numRecords) {
                    var params = {
                        "id": vm.boilerId,
                        filter: {
                            order: 'receivedDate DESC',
                            limit: numRecords
                        }
                    };

                    return Boiler.boilerRecords(params).$promise;
                }

                //button actions
                vm.save = function ($event) {
                    if (vm.boiler.securitymode == 1) {
                        $dialog.show($dialog.templates.BOILER_WRITE, $event);
                    } else {
                        vm.writeToBoiler();
                    }
                };

                vm.cancel = function ($event) {

                    vm.boilerRecord.writeableData.chcontrol = vm.boilerRecord.data.chcontrol;
                    vm.boilerRecord.writeableData.chsetpoint = vm.boilerRecord.data.chsetpoint;
                    vm.boilerRecord.writeableData.dhwcontrol = vm.boilerRecord.data.dhwcontrol;
                    vm.boilerRecord.writeableData.dhwsetpoint = vm.boilerRecord.data.dhwsetpoint;
                    vm.boilerRecord.writeableData.dhwtanksetpoint = vm.boilerRecord.data.dhwtanksetpoint;

                    $scope.editForm.$setPristine();
                };

                vm.writeToBoiler = function (passcode) {
                    var pCode = passcode;

                    //                    for (var key in passcode) {
                    //                        if (passcode.hasOwnProperty(key)) {
                    //                            pCode = pCode + passcode[key];
                    //                        }
                    //                    }

                    if (vm.boiler.securitymode == 1 && (!pCode || pCode.length != 4)) {
                        $toast.show($toast.messages.BOILER_WRITE_FAILED, $toast.types.ERROR);
                        return;
                    }

                    // if the unit is in C then we have to convert into F

                    var chsetpoint = vm.boilerRecord.writeableData.chsetpoint;
                    var dhwsetpoint = vm.boilerRecord.writeableData.dhwsetpoint;
                    var dhwtanksetpoint = vm.boilerRecord.writeableData.dhwtanksetpoint;

                    if (vm.user && vm.user.temperature && vm.user.temperature.id != 0) {

                        chsetpoint = Math.round(((chsetpoint * 9 / 5 + 32) * 10) / 10);
                        dhwsetpoint = Math.round(((dhwsetpoint * 9 / 5 + 32) * 10) / 10);
                        dhwtanksetpoint = Math.round(((dhwtanksetpoint * 9 / 5 + 32) * 10) / 10);
                    }

                    var write = { writeRecord: {} };

                    if (vm.boilerRecord.data.chcontrol != (vm.boilerRecord.writeableData.chcontrol == true ? 1 : 0))
                        write.writeRecord.chcontrol = vm.boilerRecord.writeableData.chcontrol == true ? 1 : 0;

                    if (vm.boilerRecord.data.chsetpoint != 'Off' && vm.boilerRecord.data.chsetpoint != vm.boilerRecord.writeableData.chsetpoint)
                        write.writeRecord.chsetpoint = (vm.boilerRecord.writeableData.chsetpoint * 10);

                    if (vm.boilerRecord.data.dhwcontrol != (vm.boilerRecord.writeableData.dhwcontrol == true ? 1 : 0))
                        write.writeRecord.dhwcontrol = vm.boilerRecord.writeableData.dhwcontrol == true ? 1 : 0;

                    if (vm.boilerRecord.data.dhwsetpoint != "Off" && vm.boilerRecord.data.dhwsetpoint != vm.boilerRecord.writeableData.dhwsetpoint)
                        write.writeRecord.dhwsetpoint = (vm.boilerRecord.writeableData.dhwsetpoint * 10);

                    if (vm.boilerRecord.data.dhwtanksetpoint != vm.boilerRecord.writeableData.dhwtanksetpoint)
                        write.writeRecord.dhwtanksetpoint = vm.boilerRecord.writeableData.dhwtanksetpoint;


                    write.writeRecord.passcode = pCode;
                    write.writeRecord = JSON.stringify(write.writeRecord);

                    write.boilerId = vm.boilerId;
                    write.userId = $user.getUserId();

                    //                    var write = {
                    //                        "writeRecord": JSON.stringify({
                    //                            "chcontrol": vm.boilerRecord.writeableData.chcontrol == true ? 1 : 0,
                    //                            "chsetpoint": chsetpoint * 10, //TODO: multiply by the precision value
                    //                            "dhwcontrol": vm.boilerRecord.writeableData.dhwcontrol == true ? 1 : 0,
                    //                            "dhwsetpoint": dhwsetpoint * 10,
                    //                            "dhwtanksetpoint": dhwtanksetpoint * 10,
                    //                            "passcode": pCode
                    //                        }),
                    //                        "boilerId": vm.boilerId,
                    //                        "userId": $user.getUserId()
                    //                    };

                    BoilerWriteRecord.create(write).$promise
                        .then(function (writesuccessresult) {
                            //TODO: check if write is complete and then change this, so we don't see the jump
                            $timeout(function () {
                                $scope.editForm.$setPristine();
                            }, 15000);
                            $toast.show($toast.messages.BOILER_WRITE_SUCCESS, $toast.types.SUCCESS);
                        })
                        .catch(function () {
                            $toast.show($toast.messages.BOILER_WRITE_FAILED, $toast.types.ERROR);
                        });
                };

                vm.download = function ($event) {
                    $dialog.show($dialog.templates.BOILER_DOWNLOAD, $event)
                };

                vm.errordetails = function ($event) {
                    var obj = { errorCode: '', errorTitle: '', errorDesc: '' };
                    for (var i = 0; i < vm.boilerErrors.length; i++) {
                        if (vm.boilerRecord.data.errorcode == vm.boilerErrors[i].errorKey) {
                            obj.errorCode = vm.boilerRecord.data.errorcode;
                            obj.errorTitle = vm.boilerErrors[i].errorTitle;
                            obj.errorDesc = $sce.trustAsHtml(vm.boilerErrors[i].errorDescription);
                            break;
                        }
                    }
                    $dialog.set(obj);
                    $dialog.show($dialog.templates.BOILER_ERROR_DETAILS, $event)
                };

                vm.downloadFile = function (type, document, $event) {

                    downloadCount = 0;
                    vm.parent.spinner = true;
                    var file = {
                        "fileType": type,
                        "boilerId": vm.boilerId,
                        "userId": $user.getUserId()
                    };

                    BoilerFile.create(file).$promise
                        .then(function fileDownloadSuccess(file) {
                            var params = {
                                "id": file.id
                            };

                            $timeout(function () { downloadFile(params, type, $event) }, 3000);

                        })
                        .catch(function fileDownloadError(error) {
                            $dialog.show($dialog.templates.BOILER_DOWNLOAD_TIMEOUT, $event);
                            vm.parent.spinner = false;
                        });
                };

                function downloadFile(params, type, $event) {
                    BoilerFile.download(params).$promise
                        .then(function (data) {

                            if (data.hasOwnProperty("status")) {
                                // file is not ready to download
                                if (downloadCount < 3) {
                                    downloadCount++;
                                    $timeout(function () { downloadFile(params, type, $event) }, 6000);
                                }
                                else {
                                    //delete the request so it doesn't keep requesting the boiler
                                    BoilerFile.deleteById(params).$promise.then(function (data) { });

                                    $dialog.show($dialog.templates.BOILER_DOWNLOAD_TIMEOUT, $event);
                                    vm.parent.spinner = false;
                                }
                            }
                            else {
                                downloadCount = 0;
                                if (type == '1') {
                                    var obj = {
                                        "id": params.id,
                                        "access_token": LoopBackAuth.accessTokenId,
                                        "imageURLPath": imageURL
                                    };
                                    $dialog.set(obj);
                                    $dialog.show($dialog.templates.BOILER_DOWNLOAD_FILE);

                                } else {

                                    var fileName = "Nuro_";
                                    if (type == '2') {
                                        fileName = fileName + "Params_" + vm.boiler.solaSN + ".pkparams";
                                    } else {
                                        fileName = fileName + "Errors_" + vm.boiler.solaSN + ".errors";
                                    }

                                    var fileURL = imageURL + '/api/BoilerFiles/' + params.id + '/download?access_token=' + LoopBackAuth.accessTokenId;
                                    var link = document.createElement("a");
                                    link.href = fileURL;

                                    link.style = "visibility:hidden";
                                    link.download = fileName;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    // var a = $("<a style='display: none;' download=" + fileName + " href=" + fileURL + "/>");
                                    // $("body").append(a);

                                    // a[0].click();
                                    // $timeout(function () {
                                    //     a.remove();
                                    // }, 15000);
                                }
                                vm.parent.spinner = false;
                            }
                        })
                        .catch(function fileDownloadErr(error) {
                            //delete the request so it doesn't keep requesting the boiler
                            BoilerFile.deleteById(params).$promise.then(function (data) { });

                            $dialog.show($dialog.templates.BOILER_DOWNLOAD_TIMEOUT, $event);
                            vm.parent.spinner = false;
                        });
                }

                vm.support = function ($event) {
                    $dialog.set(vm.serviceRep);
                    $dialog.show($dialog.templates.BOILER_SUPPORT, $event)
                };

                function DialogController($scope, $mdDialog, items) {
                    vm.items = items;
                    $scope.closeDialog = function () {
                        $mdDialog.hide();
                    };

                    $scope.confirm = function () {
                        $mdDialog.hide();
                    }
                }

                //TODO use controller provider to share methods. remove $rootScope
                $rootScope.downloadFile = vm.downloadFile;
                $rootScope.writeToBoiler = vm.writeToBoiler;
                $scope.support = vm.support;

                var acc = document.getElementsByClassName("boiler-values-accordion");
                var i;
                for (i = 0; i < acc.length; i++) {
                    acc[i].onclick = function () {
                        this.classList.toggle("active");
                        this.nextElementSibling.classList.toggle("show");
                        window.dispatchEvent(new Event('resize'));
                    }
                }

                //graphs
                vm.graphDataPoints = {};

                vm.showGraph = function (dataPoint) {
                    //if clicked on the data point that is not visible
                    if (!vm.graphDataPoints[dataPoint]) {
                        vm.graphDataPoints[dataPoint] = {};
                        drawGraph(dataPoint, vm.graphDataPoints[dataPoint]);
                    } else {
                        vm.graphDataPoints[dataPoint] = undefined;
                        removeGraph(dataPoint);
                    }
                };

                function drawGraph(dataPoint, chartObj) {

                    nv.addGraph(function () {
                        chartObj.chart = nv.models.lineChart()
                            .margin({ top: 20, right: 40, bottom: 40, left: 45 })
                            .x(function (d) {
                                return (new Date(d.x)).getTime();
                            })
                            .y(function (d) {
                                if (d && d.y && d.y.data) {
                                    return d.y.data[dataPoint];
                                } else {
                                    return d.y;
                                }
                            })
                            .interactive(false)
                            .showLegend(false);

                        chartObj.chart.xAxis
                            .tickFormat(function (d) {
                                return d3.time.format('%I:%M')(new Date(d));
                                //                                return moment(d).tz(vm.site.timeZone.zone).format('hh:mm'); //d3.time.format('%I:%M')(new Date(d))
                            });

                        chartObj.chart.yAxis
                            .showMaxMin(false)
                            .tickFormat(d3.format(',.1f'));

                        chartObj.chartData = d3.select("#" + dataPoint + " svg");

                        chartObj.chartData.datum(vm.boiler.graphLines[dataPoint]).attr('height', chartObj.chartData.style("width"));
                        chartObj.chartData.transition().duration(500).call(chartObj.chart).each("start", function () {
                            var domain = chartObj.chart.yAxis.scale().domain();
                            if (domain[1] - domain[0] < 10) {
                                var average = (domain[1] + domain[0]) / 2;
                                chartObj.chart.yDomain([average - 5, average + 5]);
                                chartObj.chartData.transition().duration(500).call(chartObj.chart);
                                nv.utils.windowResize(chartObj.chart.update);
                            }
                        });

                        return chartObj.chart;
                    });
                }

                function updateGraphs() {
                    angular.forEach(vm.graphDataPoints, function (chartObj, key) {
                        if (chartObj && chartObj.chartData) {
                            chartObj.chartData.transition().duration(500).call(chartObj.chart);
                            nv.utils.windowResize(chartObj.chart.update);
                        }
                    });
                }

                function removeGraph(dataPoint) {
                    d3.select("#" + dataPoint + " svg").selectAll("*").remove();
                }

                //init & destroy
                vm.init = function () {
                    console.log("init::::", localStorage.getItem('selectedBrand'));
                    var currentBoilerBrand = {
                        brand: (localStorage.getItem('selectedBrand') && localStorage.getItem('selectedBrand') == "Weil-McLain") ? "1" : "0"
                    };
                    // let brandForBoilderDetails = (localStorage.getItem('selectedBrand') && localStorage.getItem('selectedBrand') == "Weil-McLain") ? "1" : "0"
                    // var brandFilter = {
                    //     filter: {
                    //         where: {
                    //             brand: brandForBoilderDetails
                    //         }
                    //     }
                    // };
                    // ErrorCode.find(brandFilter).$promise,
                    // BoilerImage.find(brandFilter).$promise,
                    // BoilerModel.find(brandFilter).$promise,
                    // BoilerState.find(brandFilter).$promise,
                    // BoilerStatus.find(brandFilter).$promise,
                    // RelayText.find(brandFilter).$promise,
                    // ActiveModeDemand.find(brandFilter).$promise
                    $q.all([
                        getSiteInfo(),
                        getBoilerInfo(),
                        getDataPoints(),
                        ErrorCode.findByBrand(currentBoilerBrand).$promise,
                        BoilerImage.findByBrand(currentBoilerBrand).$promise,
                        BoilerModel.findByBrand(currentBoilerBrand).$promise,
                        BoilerState.findByBrand(currentBoilerBrand).$promise,
                        BoilerStatus.findByBrand(currentBoilerBrand).$promise,
                        RelayText.findByBrand(currentBoilerBrand).$promise,
                        ActiveModeDemand.findByBrand(currentBoilerBrand).$promise
                    ])
                        .then(function (response) {
                            console.log("response:::>>>", response);
                            vm.user = $user.getUser();
                            vm.site = response[0]; //first promise is site, which should match here

                            vm.boiler = response[1];

                            vm.model.title = vm.boiler.name;
                            vm.model.brand = (localStorage.getItem('selectedBrand') && localStorage.getItem('selectedBrand') == "Weil-McLain") ? "1" : "0";
                            // vm.model.brand = "1";
                            vm.dataPoints = response[2].data;

                            //for each data point, initialize graph line object
                            vm.boiler.graphLines = {};
                            angular.forEach(vm.dataPoints, function (aDataPoint, key) {

                                if (!aDataPoint.trendable) return;

                                var i = undefined;
                                if (aDataPoint.options)
                                    i = aDataPoint.options.length - 1;

                                do {
                                    var label = aDataPoint.label;
                                    if (aDataPoint.options)
                                        label = aDataPoint.options[i];

                                    vm.boiler.graphLines[key] = [
                                        {
                                            name: key,
                                            bitIndex: i,
                                            key: label,
                                            type: "line",
                                            values: []
                                        }];

                                    i--;
                                } while (i >= 0);
                            });

                            vm.boilerErrors = response[3];

                            vm.boilerimages = response[4];
                            console.log("vm.boilerimages", vm.boilerimages);
                            var bmdata = response[5];
                            if (!vm.boilerimages) {
                                for (var j = 0; j < bmdata.length; j++) {
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
                                        // console.log("brandName", brandName);
                                        // console.log(bmdata[j].brand + "==" + brandName);
                                        // console.log(bmdata[j].imageFile + "==", imagename[0]);
                                        if ((bmdata[j].imageFile == imagename[0]) && (bmdata[j].brand == brandName)) {
                                            // console.log("image match::::::");
                                            flag = 1;
                                        }
                                    }
                                    if (!flag) bmdata[j].imageFile = '';
                                }
                            }

                            vm.boilerModels = bmdata;
                            vm.boilerStates = response[6];
                            vm.boilerStatuses = response[7];
                            vm.relayTexts = response[8];
                            vm.activeModeDemands = response[9];


                            for (var i = 0; i < vm.relayTexts.length; i++) {

                                if (vm.relayTexts[i].relay == "A" && vm.relayTexts[i].key == vm.boiler.relayassignmenta) vm.relayA = "[A] " + (vm.relayTexts[i].text.toLowerCase() == 'none' ? "Not selected" : vm.relayTexts[i].text);
                                if (vm.relayTexts[i].relay == "B" && vm.relayTexts[i].key == vm.boiler.relayassignmentb) vm.relayB = "[B] " + (vm.relayTexts[i].text.toLowerCase() == 'none' ? "Not selected" : vm.relayTexts[i].text);
                                if (vm.relayTexts[i].relay == "C" && vm.relayTexts[i].key == vm.boiler.relayassignmentc) vm.relayC = "[C] " + (vm.relayTexts[i].text.toLowerCase() == 'none' ? "Not selected" : vm.relayTexts[i].text);
                                if (vm.relayTexts[i].relay == "D" && vm.relayTexts[i].key == vm.boiler.relayassignmentd) vm.relayD = "[D] " + (vm.relayTexts[i].text.toLowerCase() == 'none' ? "Not selected" : vm.relayTexts[i].text);

                            }



                            // To add admin level visibility and upgraded level visibility on datapoints
                            if (vm.user.roles.length > 0) {
                                vm.level = 2;
                            }
                            else {
                                vm.level = 1; // Making it by default boiler paid
                            }
                            //                            else if(vm.boiler.isPaid == true) {
                            //                                vm.level = 1;
                            //                            }
                            //                            else {
                            //                                vm.level = 0
                            //                            }


                            getBoilerReadRecord(FETCH_LIMIT)
                                .then(function (data) {

                                    data = data.reverse();
                                    var lastRecord;

                                    // console.log("data", JSON.stringify(data));
                                    var brandOfBoiler = data.filter(function(obj) {return obj.receivedData.data.brand});
                                    if(brandOfBoiler && brandOfBoiler.length > 0) {
                                        if(brandOfBoiler[0].receivedData.data.brand == "1") {
                                            vm.brand = "Weil-McLain";
                                            vm.brandValue = "1";
                                        } else {
                                            vm.brand = "Patterson-Kelley";
                                            vm.brandValue = "0"
                                        }
                                    } else {
                                        vm.brand = "Patterson-Kelley";
                                        vm.brandValue = "0"
                                    }

                                    try {
                                        data.map(function (aRecord) {
                                            addRecord(aRecord);
                                            lastRecord = aRecord;
                                        });

                                    } catch (e) {
                                        console.log('Exception while processing the data:' + e);
                                    }
                                    $scope.isBoilerApiComplete = true

                                }, function (err) {
                                    console.log(err)
                                    $scope.isBoilerApiComplete = true
                                    $toast.show($toast.messages.BOILER_DETAILS_FAILED, $toast.types.ERROR);
                                });

                            //then start refreshing on interval
                            var timer = 0
                            vm.dataUpdateInterval = $interval(function () {
                                console.log(timer, $scope.isBoilerApiComplete)
                                if (timer >= 5 && $scope.isBoilerApiComplete == true) {
                                    $scope.isBoilerApiComplete = false
                               
                                        getBoilerReadRecord(1)
                                            .then(function (data) {
                                                addRecord(data[0]);
                                                $scope.isBoilerApiComplete = true
                                            }, function (err) {
                                                $scope.isBoilerApiComplete = true
                                                $toast.show($toast.messages.BOILER_DETAILS_FAILED, $toast.types.ERROR);
                                            });
                                
                                        timer=0
                                }
                                timer++
                            }, 1000);

                            //get service rep info
                            getServiceRepInfo();

                            //get update weather info
                            // getWeatherReport();


                        }, function (error) {
                            $toast.show($toast.messages.BOILER_LOAD_FAILED, $toast.types.ERROR);
                        });
                };

                function getSetPointByTemp(point) {
                    if (vm.user && vm.user.temperature && vm.user.temperature.id != 0) {
                        var celsiusVal = (point - 32) * 5 / 9;
                        point = Math.round(celsiusVal * 10) / 10;
                        return point;
                    }
                    else return point;
                }

                // function getState (stateTxt) {
                //     if((stateTxt != undefined && stateTxt != null) && vm.boilerStates && vm.boilerStates.length > 0) {
                //         var boilerBrand = (vm.brand == "Weil-McLain") ? "1" : "0";
                //         var filterdstate = vm.boilerStates.filter(function(state) {return state.brand == boilerBrand})
                //         var stateValue = filterdstate ? filterdstate[stateTxt].text : "";
                //         return stateValue;   
                //     } else {
                //         return "";
                //     }
                // }

                // function getStatus (statusTxt) {
                //     if((statusTxt != undefined && statusTxt != null) && vm.boilerStatuses && vm.boilerStatuses.length > 0) {
                //         var boilerBrand = (vm.brand == "Weil-McLain") ? "1" : "0";
                //         var filteredStatuses = vm.boilerStatuses.filter(function(status) {return status.brand == boilerBrand})
                //         var statusValue = filteredStatuses ? filteredStatuses[statusTxt].text : ""
                //         return statusValue;
                //     } else {
                //         return "";
                //     }
                // }

                vm.init();
                vm.getSetPointByTemp = getSetPointByTemp;
                // vm.getState = getState;
                // vm.getStatus = getStatus;


                $scope.destroy = function () {
                    $interval.cancel(vm.dataUpdateInterval);
                    $interval.cancel(vm.lastUpdateInterval);
                    if(!$location.path().includes("/boiler-info")) {
                        localStorage.removeItem("selectedBrand")
                    }
                };
            }]
        );
})();
