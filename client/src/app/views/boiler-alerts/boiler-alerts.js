angular.module('harsco-pk')
    .controller('boilerAlertsController', [
        '$timeout', '$state', '$stateParams', '$toast', '$user', 'Boiler', 'Site', 'User', 'LoopBackAuth', '$scope',
        function ($timeout, $state, $stateParams, $toast, $user, Boiler, Site, User,LoopBackAuth, $scope) {

            var vm = this;

            vm.model = {
                title: 'Boiler Alerts'
            };
            vm.savbtn=false;

            vm.repeatIntervals = [
                {id: 0, intervaltitle: '1 Hour'},
                {id: 1, intervaltitle: '1 Day'}
            ];

            vm.temptypes = [
                {id: 0, temptype: 'Supply Temperature'},
                {id: 1, temptype: 'DHW Temperature'},
                {id: 2, temptype: 'Return Temperature'},
                {id: 3, temptype: 'Stack Temperature'},
                {id: 4, temptype: 'Header Temperature'},
                {id: 5, temptype: 'Heat Exchanger Temperature'},
                {id: 6, temptype: 'Outdoor Air Temperature'}
            ];

            vm.undertemps = [];
            vm.overtemps = [];
            vm.tempAlertsovertypes = [];
            vm.alertOverTemp = [];
            vm.tempAlertsundertypes = [];
            vm.alertUnderTemp = [];

            vm.addNewOverTemps = function () {
                if (vm.overtemps.length == 0) {
                    var newItemNo = 1;
                }
                else {
                    var newItemNo = parseInt(vm.overtemps[vm.overtemps.length - 1].id) + 1;
                }
                vm.overtemps.push({'id': newItemNo});
            };

            vm.removeOverTemps = function (id) {
                for (var inc = 0; inc < vm.overtemps.length; inc++) {
                    if (id == vm.overtemps[inc].id) {
                        vm.overtemps.splice(inc, 1);
                    }
                }
//                if (vm.overtemps.length == 0) {
//                    vm.alertonOverTempstatus = false;
//                }
            };

            vm.removeAllOverTemps = function () {
                var count=vm.overtemps.length;
                for (var inc = 0; inc < count; inc++) {

                        vm.overtemps.splice(0, 1);
                }
//                if (vm.overtemps.length == 0) {
//                    vm.alertonOverTempstatus = false;
//                }
            };

            vm.removeAllUnderTemps = function () {
                var count=vm.undertemps.length;
                for (var inc = 0; inc < count; inc++) {
                    vm.undertemps.splice(0, 1);
                }
                if (vm.undertemps.length == 0) {
                    vm.alertonUnderTempstatus = false;
                }
            };


            vm.addNewUnderTemps = function () {
                if (vm.undertemps.length == 0) {
                    var newItemNo = 1;
                }
                else {
                    var newItemNo = parseInt(vm.undertemps[vm.undertemps.length - 1].id) + 1;
                }
                vm.undertemps.push({'id': newItemNo});

            };

            vm.removeUnderTemps = function (id) {
                for (var inc = 0; inc < vm.undertemps.length; inc++) {
                    if (id == vm.undertemps[inc].id) {
                        vm.undertemps.splice(inc, 1);
                    }
                }
                if (vm.undertemps.length == 0) {
                    vm.alertonUnderTempstatus = false;
                }
            };

            function success(data) {
                vm.user = $user.getUser();

                if(!vm.user.temperature) {
                    vm.user.temperature = {
                        id : 0
                    }
                }

                if(vm.user.temperature.id == 0) {
                    vm.tempunito='( °F)';
                    vm.tempunitu='( °F)';
                }
                if(vm.user.temperature.id == 1) {
                    vm.tempunitu='( °C)';
                    vm.tempunito='( °C)';
                }

                vm.boiler = data;

                var overcount = 0;
                var undercount = 0;
                vm.boiler.tempAlerts = vm.boiler.tempAlerts || [];

                for (var inc = 0; inc < vm.boiler.tempAlerts.length; inc++) {

                    if (vm.boiler.tempAlerts[inc].under == false) {
                        vm.overtemps.push({'id': overcount});
                        vm.tempAlertsovertypes.push(vm.boiler.tempAlerts[inc].tempType);

                        if (vm.user && vm.user.temperature && vm.user.temperature.id == 1) {
                            var celsiusVal = (vm.boiler.tempAlerts[inc].value - 32) * 5 / 9;
                            vm.boiler.tempAlerts[inc].value = Math.round(celsiusVal * 10) / 10;
                        }

                        vm.alertOverTemp.push(vm.boiler.tempAlerts[inc].value.toFixed(2));
                        overcount++;
                        vm.alertonOverTempstatus = true;
                    }

                    if (vm.boiler.tempAlerts[inc].under == true) {
                        vm.undertemps.push({'id': undercount});
                        vm.tempAlertsundertypes.push(vm.boiler.tempAlerts[inc].tempType);

                        if (vm.user && vm.user.temperature && vm.user.temperature.id == 1) {
                            var celsiusVal = (vm.boiler.tempAlerts[inc].value - 32) * 5 / 9;
                            vm.boiler.tempAlerts[inc].value = Math.round(celsiusVal * 10) / 10;
                        }

                        vm.alertUnderTemp.push(vm.boiler.tempAlerts[inc].value.toFixed(2));
                        undercount++;
                        vm.alertonUnderTempstatus = true;
                    }
                }

                if (overcount == 0) {
                    vm.overtemps = [{id: '0'}];
                }

                if (undercount == 0) {
                    vm.undertemps = [{id: '0'}];
                }

                vm.disableAll();
                vm.disable('O');
                vm.disable('U');

            }

            function fail(error) {
                vm.savbtn = false;
                console.log(error);
            }

            function ok(data) {
                $toast.show($toast.messages.BOILER_ALERTS_UPDATE_SUCCESS, $toast.types.SUCCESS);
                vm.undertemps = [];
                vm.overtemps = [];
                vm.tempAlertsovertypes = [];
                vm.alertOverTemp = [];
                vm.tempAlertsundertypes = [];
                vm.alertUnderTemp = [];
                vm.init();
                $timeout(function () {
                    vm.savbtn = false;
                }, 1000);

            }

            function save() {

                vm.boiler.tempAlerts = [];
                var errorcheck = 0;
                $scope.errorunder='';
                $scope.errorover='';

                if(vm.overtemps.length>0) {

                    for (var i = 0; i < vm.overtemps.length; i++) {
                        if (typeof(vm.alertOverTemp[vm.overtemps[i].id])!='undefined' && typeof(vm.tempAlertsundertypes[vm.overtemps[i].id])!='number') {

                            if (isNaN(vm.tempAlertsovertypes[vm.overtemps[i].id]) || vm.tempAlertsovertypes[vm.overtemps[i].id]==-1) {
                                $scope.errorover = '* Choose temperature type';
                                var errorcheck = 1;
                            }
                            if(vm.alertOverTemp[vm.overtemps[i].id]==''){
                                $scope.errorover = '* Temperature should be number';
                                var errorcheck = 1;
                            }
                        } else if (typeof(vm.alertOverTemp[vm.overtemps[i].id])=='undefined' && typeof(vm.tempAlertsundertypes[vm.overtemps[i].id])=='number') {
                            if(typeof(vm.alertOverTemp[vm.overtemps[i].id])=='undefined'){
                                $scope.errorover = '* Temperature should be number';
                                var errorcheck = 1;
                            }else {
                                vm.removeOverTemps(vm.overtemps[i].id);
                            }
                        }  else if (!vm.alertOverTemp[vm.overtemps[i].id] && vm.tempAlertsovertypes[vm.overtemps[i].id] > -1) {
                            $scope.errorover = '* Temperature should be number';
                            var errorcheck = 1;
                        }else if(vm.alertOverTemp[vm.overtemps[i].id]==''){
                            $scope.errorover = '* Temperature should be number';
                            var errorcheck = 1;
                        }

                    }
                }

                if(vm.undertemps.length>0) {
                    for (var i = 0; i < vm.undertemps.length; i++) {


                        if (typeof(vm.alertUnderTemp[vm.undertemps[i].id])!='undefined' && typeof(vm.tempAlertsundertypes[vm.undertemps[i].id]!='number')) {
                            if (isNaN(vm.tempAlertsundertypes[vm.undertemps[i].id]) || vm.tempAlertsundertypes[vm.undertemps[i].id]==-1) {
                                $scope.errorunder = '* Choose temperature type';
                                var errorcheck = 1;
                            }
                            if(vm.alertUnderTemp[vm.undertemps[i].id]==''){
                                $scope.errorunder = '* Temperature should be number';
                                var errorcheck = 1;
                            }
                        } else if (typeof(vm.alertUnderTemp[vm.undertemps[i].id])=='undefined' && typeof(vm.tempAlertsundertypes[vm.undertemps[i].id])=='number') {

                            if(typeof(vm.alertUnderTemp[vm.undertemps[i].id])=='undefined'){
                                $scope.errorunder = '* Temperature should be number';
                                var errorcheck = 1;
                            }else {
                                vm.removeUnderTemps(vm.undertemps[i].id);
                            }
                        } else if (!vm.alertUnderTemp[vm.undertemps[i].id] && vm.tempAlertsundertypes[vm.undertemps[i].id] > -1) {
                            $scope.errorunder = '* Temperature should be number';
                            var errorcheck = 1;
                        }else if(vm.alertUnderTemp[vm.undertemps[i].id]==''){
                            $scope.errorunder = '* Temperature should be number';
                            var errorcheck = 1;
                        }

                    }
                }

                if (vm.overtemps.length > 0) {
                    for (var i = 0; i < vm.overtemps.length; i++) {
                        for (var j = 0; j < vm.undertemps.length; j++) {
                            if (vm.tempAlertsovertypes[vm.overtemps[i].id] == vm.tempAlertsundertypes[vm.undertemps[j].id]) {
                                if (parseFloat(vm.alertOverTemp[vm.overtemps[i].id]) < parseFloat(vm.alertUnderTemp[vm.undertemps[j].id])) {
                                    $scope.errorunder = '* Over temperature should be greater than under temperature';
                                    var errorcheck = 1;
                                }
                            }
                        }
                    }
                }

                if (errorcheck == 0) {

                    if (vm.overtemps.length > 0) {
                        for (var i = 0; i < vm.overtemps.length; i++) {
                            if (typeof(vm.alertOverTemp[vm.overtemps[i].id])!='undefined' && typeof(vm.tempAlertsovertypes[vm.overtemps[i].id]!='number')) {
                                if (vm.user && vm.user.temperature && vm.user.temperature.id == 1) {
                                    vm.alertOverTemp[vm.overtemps[i].id] = ((vm.alertOverTemp[vm.overtemps[i].id] * 9 / 5) + 32).toFixed(2);
                                }
                                vm.boiler.tempAlerts.push({
                                    'under': false,
                                    'tempType': vm.tempAlertsovertypes[vm.overtemps[i].id],
                                    'value': vm.alertOverTemp[vm.overtemps[i].id]
                                });
                            }
                        }
                    }
                    if(vm.undertemps.length>0) {
                        for (var i = 0; i < vm.undertemps.length; i++) {
                            if (typeof(vm.alertUnderTemp[vm.undertemps[i].id])!='undefined' && typeof(vm.tempAlertsundertypes[vm.undertemps[i].id]!='number')) {
                                if (vm.user && vm.user.temperature && vm.user.temperature.id == 1) {
                                    vm.alertUnderTemp[vm.undertemps[i].id] = ((vm.alertUnderTemp[vm.undertemps[i].id] * 9 / 5) + 32);
                                }
                                vm.boiler.tempAlerts.push({
                                    'under': true,
                                    'tempType': vm.tempAlertsundertypes[vm.undertemps[i].id],
                                    'value': vm.alertUnderTemp[vm.undertemps[i].id]
                                });
                            }
                        }
                    }
                    console.log('vm.boiler',vm.boiler);
                    if(!vm.boiler.siteId){
                        vm.boiler.siteId = $stateParams.siteId
                    }
                    vm.savbtn=true;
                    Boiler.replaceOrCreate(vm.boiler).$promise.then(ok, fail);
                }

//                if (vm.boiler.alertsDisabled==true) {
//
//                    if (vm.alertonOverTempstatus) {
//
//
//                    }
//                    if (vm.alertonUnderTempstatus) {
//
//                    }
//
//                    if (vm.alertonUnderTempstatus && vm.alertonOverTempstatus ) {
//
//                    }
//
//
//                }else{
//                    //vm.boiler.tempAlerts = [];
//
//                    console.log(vm.boiler);
//                    if (errorcheck == 0) {
//                        vm.savbtn = true;
//                        Boiler.replaceOrCreate(vm.boiler).$promise.then(ok, fail);
//                    }
//                }
            }

            function init() {

                if (LoopBackAuth.currentUserData) {
                    var Boileralertdetails = Boiler.findById({"id": $stateParams.boilerId}).$promise;
                    Boileralertdetails.then(success, fail);
                }
                else {
                    $timeout(init, 1000);
                }
            }

            function checkoverbox(val) {
                vm.alertonOverTempstatus = true;

                for (var i = 0; i < vm.overtemps.length; i++) {
                    if (vm.tempAlertsovertypes[vm.overtemps[i].id] == vm.tempAlertsovertypes[val] && vm.overtemps[i].id != val) {
                        $toast.show($toast.messages.BOILER_ALERTS_TEMP_ERROR, $toast.types.ERROR);
                        vm.tempAlertsovertypes[val] = -1;
                        return false;
                    }
                }
            }

            function checkunderbox(val) {
                vm.alertonUnderTempstatus = true;
                for (var i = 0; i < vm.undertemps.length; i++) {
                    if (vm.tempAlertsundertypes[vm.undertemps[i].id] == vm.tempAlertsundertypes[val] && vm.undertemps[i].id != val) {
                        $toast.show($toast.messages.BOILER_ALERTS_TEMP_ERROR, $toast.types.ERROR);
                        vm.tempAlertsundertypes[val] = -1;
                        return false;
                    }

                }
            }


            function isNumberKey_temp(e, val) {
                if (val == 'O')$scope.errorover = '';
                if (val == 'U')$scope.errorunder = '';
                var charCode = (e.which) ? e.which : e.keyCode;
                if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
                    if (val == 'O')$scope.errorover = '* Temperature should be number';
                    if (val == 'U')$scope.errorunder = '* Temperature should be number';

                    e.preventDefault();
                    return false;
                }
            }


            function disableAll() {

                if (vm.boiler.alertsDisabled) {
                    vm.alertover = false;
                    vm.relay = false;
                    vm.hold = false;
                    vm.lockout = false;
                    vm.repeat = false;


                    vm.tor = false;



                    vm.toro = false;
                    vm.alertonOverTempstatus=true;
                    vm.alertonUnderTempstatus=true;

                    if(vm.boiler.alertonOverTempstatus) {
                        vm.plusobutton = false;
                        vm.too = false;
                        vm.toto = false;

                    }
                    if(vm.boiler.alertonUnderTempstatus) {
                        vm.plusbutton = false;
                        vm.to = false;
                        vm.tot = false;
                    }

                } else {
                    vm.alertover = true;
                    vm.relay = true;
                    vm.hold = true;
                    vm.lockout = true;
                    vm.repeat = true;
                    vm.plusbutton = true;
                    vm.to = true;
                    vm.tot = true;
                    //vm.tor = true;
                    vm.plusobutton = true;
                    vm.too = true;
                    vm.toto = true;
                    //vm.toro = true;
                    vm.alertonOverTempstatus=false;
                    vm.alertonUnderTempstatus=false;

                }
            }

            function disable(type) {
                if (type == 'O') {
                    $scope.errorover = '';
                    if (vm.boiler.alertonOverTempstatus && vm.boiler.alertsDisabled) {
                        vm.plusobutton = false;
                        vm.too = false;
                        vm.toto = false;
                        vm.toro = false;

                    } else {
                        vm.plusobutton = true;
                        vm.too = true;
                        vm.toto = true;
                        //vm.toro = true;

                    }
                }
                if (type == 'U') {
                    $scope.errorunder = '';
                    if (vm.boiler.alertonUnderTempstatus && vm.boiler.alertsDisabled) {
                        vm.plusbutton = false;
                        vm.to = false;
                        vm.tot = false;
                        vm.tor = false;
                    } else {
                        vm.plusbutton = true;
                        vm.to = true;
                        vm.tot = true;
                       // vm.tor = true;
                    }
                }
            }

            vm.init = init;

            vm.init();
            vm.save = save;
            vm.checkoverbox = checkoverbox;
            vm.checkunderbox = checkunderbox;
            vm.disableAll = disableAll;
            vm.disable = disable;
            vm.isNumberKey_temp = isNumberKey_temp;

        }
    ]);



