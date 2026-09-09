angular.module('harsco-pk')
    .directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function () {
                    scope.$apply(function () {
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }])
    .service('fileUpload', ['$http', function ($http) {
        this.uploadFileToUrl = function (file, uploadUrl, brand) {
            var fd = new FormData();
            fd.append('file', file);
            fd.append("brand", brand);
            $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            });
        }
    }])
    .controller('SettingsController', [
        '$scope', '$timeout', '$state', '$toast', '$user', '$http', 'User', 'Boiler', 'Site', 'BoilerModel', 'ErrorCode',
        'BoilerState', 'BoilerStatus', 'UserTitle', 'ServiceRep', 'BoilerImage','RelayText','ActiveModeDemand', 'LoopBackAuth','$mdDialog', 'fileUpload','$dialog','$rootScope', '$stateParams',
        function ($scope, $timeout, $state, $toast, $user, $http, User, Boiler, Site, BoilerModel, ErrorCode,
                  BoilerState, BoilerStatus, UserTitle, ServiceRep, BoilerImage, RelayText,ActiveModeDemand, LoopBackAuth,$mdDialog, fileUpload,$dialog,$rootScope, $stateParams) {

            var vm = this;

            vm.model = {
                title: 'Settings'
            };

            $scope.repcontactinfo = true;
            $scope.norepcontactinfo = true;
            $scope.savebm = true;
            $scope.cancelbm = true;
            $scope.fupbm = false;
            $scope.labelbm = false;

            $scope.saveec = true;
            $scope.cancelec = true;
            $scope.fupec = false;
            $scope.labelec = false;

            $scope.savesc = true;
            $scope.cancelsc = true;
            $scope.fupsc = false;
            $scope.labelsc = false;

            $scope.savert = true;
            $scope.cancelrt = true;
            $scope.fuprt = false;
            $scope.labelrt = false;

            $scope.savead = true;
            $scope.cancelad = true;
            $scope.fupad = false;
            $scope.labelad = false;

            $scope.savestc = true;
            $scope.cancelstc = true;
            $scope.fupstc = false;
            $scope.labelstc = false;

            $scope.saveut = true;
            $scope.cancelut = true;
            $scope.fuput = false;
            $scope.labelut = false;

            $scope.access_token = LoopBackAuth.accessTokenId;
            $scope.imageURLPath = imageURL;


            function successBoilerModel(data) {
                if(!vm.boilerimages) {
                    for (var j = 0; j < data.length; j++) {
                        if (!flag) data[j].imageFile = '';
                    }
                }else {
                    for (var j = 0; j < data.length; j++) {
                        var flag = 0;
                        for (var i = 0; i < vm.boilerimages.length; i++) {
                            // var imagename = vm.boilerimages[i].id.split('.');
                            var imagename = vm.boilerimages[i].name.split('.');
                            if (data[j].imageFile == imagename[0]) {
                                flag = 1;
                            }
                        }
                        if (!flag) data[j].imageFile = '';
                    }
                }

                vm.boilermodels = data;
            }

            function successBoilerImage(data) {
                vm.boilerimages = data;
                var boilermodels;
                // if($stateParams.brand) {
                //     var brandType = { brand: $stateParams.brand }
                //     boilermodels = BoilerModel.findByBrand(brandType).$promise;
                // } else {
                //     boilermodels = BoilerModel.findByBrand(brandType).$promise;
                // }
                var brandType = { brand: $stateParams.brand }
                boilermodels = BoilerModel.findByBrand(brandType).$promise;
                boilermodels.then(successBoilerModel, failservice);
            }

            function successErrorCodes(data) {
                vm.errorcodes = data;
            }

            function successStateCodes(data) {
                vm.statecodes = data;
            }

            function successRelayText(data) {
                vm.relaytexts = data;

            }

            function successActiveModeDemand(data) {
                vm.activemodedemands = data;
            }

            function successStatusCodes(data) {
                vm.statuscodes = data;
            }

            function successUserTitles(data) {
                vm.usertitles = data;
            }

            function failservice(error) {
                console.error(error);
            }

            function fail(error) {
                $toast.show($toast.messages.INVALID_CSV_DATA, $toast.types.ERROR);
                vm.init();
            }

            function success(data) {
                $toast.show($toast.messages.FILE_UPLOADED_SUCCESS, $toast.types.SUCCESS);
                document.getElementById('fileUploadBM').value = '';
                document.getElementById('fileUploadEC').value = '';
                document.getElementById('fileUploadSC').value = '';
                document.getElementById('fileUploadSTC').value = '';
                document.getElementById('fileUploadUT').value = '';
                document.getElementById('fileUploadRT').value = '';
                document.getElementById('fileUploadAD').value = '';
                $scope.savebm = true;
                $scope.cancelbm = true;
                $scope.fupbm = false;
                $scope.labelbm = false;

                $scope.saveec = true;
                $scope.cancelec = true;
                $scope.fupec = false;
                $scope.labelec = false;

                $scope.savesc = true;
                $scope.cancelsc = true;
                $scope.fupsc = false;
                $scope.labelsc = false;

                $scope.savert = true;
                $scope.cancelrt = true;
                $scope.fuprt = false;
                $scope.labelrt = false;

                $scope.savead = true;
                $scope.cancelad = true;
                $scope.fupad = false;
                $scope.labelad = false;

                $scope.savestc = true;
                $scope.cancelstc = true;
                $scope.fupstc = false;
                $scope.labelstc = false;

                $scope.saveut = true;
                $scope.cancelut = true;
                $scope.fuput = false;
                $scope.labelut = false;
                vm.init();
            }

            function cancel() {
                document.getElementById('fileUploadBM').value = '';
                document.getElementById('fileUploadEC').value = '';
                document.getElementById('fileUploadSC').value = '';
                document.getElementById('fileUploadSTC').value = '';
                document.getElementById('fileUploadUT').value = '';
                document.getElementById('fileUploadRT').value = '';
                document.getElementById('fileUploadAD').value = '';
                $scope.savebm = true;
                $scope.cancelbm = true;
                $scope.fupbm = false;
                $scope.labelbm = false;


                $scope.saveec = true;
                $scope.cancelec = true;
                $scope.fupec = false;
                $scope.labelec = false;

                $scope.savesc = true;
                $scope.cancelsc = true;
                $scope.fupsc = false;
                $scope.labelsc = false;

                $scope.savert = true;
                $scope.cancelrt = true;
                $scope.fuprt = false;
                $scope.labelrt = false;

                $scope.savead = true;
                $scope.cancelad = true;
                $scope.fupad = false;
                $scope.labelad = false;

                $scope.savestc = true;
                $scope.cancelstc = true;
                $scope.fupstc = false;
                $scope.labelstc = false;

                $scope.saveut = true;
                $scope.cancelut = true;
                $scope.fuput = false;
                $scope.labelut = false;

                vm.init();
            }

            function successfileremove(data) {
                vm.init();
            }

            function init() {
                var params = {"access_token": $scope.access_token};
                var brandType = { brand: $stateParams.brand ? $stateParams.brand : null };
                vm.brandType = brandType.brand ? brandType.brand : null;
                var boilerimages = BoilerImage.findByBrand(brandType).$promise;
                boilerimages.then(successBoilerImage, failservice);

                var errorcodes = ErrorCode.findByBrand(brandType).$promise;
                errorcodes.then(successErrorCodes, failservice);

                var statecodes = BoilerState.findByBrand(brandType).$promise;
                statecodes.then(successStateCodes, failservice);

                var statuscodes = BoilerStatus.findByBrand(brandType).$promise;
                statuscodes.then(successStatusCodes, failservice);

                var usertitles = UserTitle.find().$promise;
                usertitles.then(successUserTitles, failservice);

                var boilermodels = BoilerModel.findByBrand(brandType).$promise;
                boilermodels.then(successBoilerModel, failservice);

                var relaytext= RelayText.findByBrand(brandType).$promise;
                relaytext.then(successRelayText, failservice);

                var activemodedemand= ActiveModeDemand.findByBrand(brandType).$promise;
                activemodedemand.then(successActiveModeDemand, failservice);
                
                // if($stateParams.brand) {
                //     var brandType = { brand: $stateParams.brand }
                //     console.log("brandType", brandType);
                //     var boilerimages = BoilerImage.find().$promise;
                //     boilerimages.then(successBoilerImage, failservice);
    
                //     var errorcodes = ErrorCode.findByBrand(brandType).$promise;
                //     errorcodes.then(successErrorCodes, failservice);
    
                //     var statecodes = BoilerState.findByBrand(brandType).$promise;
                //     statecodes.then(successStateCodes, failservice);
    
                //     var statuscodes = BoilerStatus.findByBrand(brandType).$promise;
                //     statuscodes.then(successStatusCodes, failservice);
    
                //     var usertitles = UserTitle.find().$promise;
                //     usertitles.then(successUserTitles, failservice);
    
                //     var boilermodels = BoilerModel.findByBrand(brandType).$promise;
                //     boilermodels.then(successBoilerModel, failservice);
    
                //     var relaytext= RelayText.findByBrand(brandType).$promise;
                //     relaytext.then(successRelayText, failservice);
    
                //     var activemodedemand= ActiveModeDemand.findByBrand(brandType).$promise;
                //     activemodedemand.then(successActiveModeDemand, failservice);
                // } else {
                //     var boilerimages = BoilerImage.find().$promise;
                //     boilerimages.then(successBoilerImage, failservice);

                //     var errorcodes = ErrorCode.find().$promise;
                //     errorcodes.then(successErrorCodes, failservice);

                //     var statecodes = BoilerState.find().$promise;
                //     statecodes.then(successStateCodes, failservice);

                //     var statuscodes = BoilerStatus.find().$promise;
                //     statuscodes.then(successStatusCodes, failservice);

                //     var usertitles = UserTitle.find().$promise;
                //     usertitles.then(successUserTitles, failservice);

                //     var boilermodels = BoilerModel.find().$promise;
                //     boilermodels.then(successBoilerModel, failservice);

                //     var relaytext= RelayText.find().$promise;
                //     relaytext.then(successRelayText, failservice);

                //     var activemodedemand= ActiveModeDemand.find().$promise;
                //     activemodedemand.then(successActiveModeDemand, failservice);
                // }
                
            }

            function fileChoosen() {
                console.log("fileChoosen");
                if (document.getElementById('uploadedfile').value != '') {
                    var fileUploads = document.getElementById('uploadedfile');
                    var regex = /^([a-zA-Z0-9\s_\\.\-:()])+(.png|.jpg|.jpeg|.gif)$/;
                    if (regex.test(fileUploads.value.toLowerCase())) {
                        $toast.show($toast.messages.FILE_UPLOAD_CHOOSEN, $toast.types.SUCCESS);
                    }else {
                        $toast.show($toast.messages.INVALID_IMAGE_FORMAT, $toast.types.ERROR);
                    }
                }
            }

            
            function checkimg() {
                console.log("checkimg");
                if (document.getElementById('uploadedfile').value == '') {
                    $toast.show($toast.messages.INVALID_IMAGE_UPLOAD, $toast.types.ERROR);
                } else {
                    var fileUploads = document.getElementById('uploadedfile');
                    var regex = /^([a-zA-Z0-9\s_\\.\-:()])+(.png|.jpg|.jpeg|.gif)$/;
                    if (!regex.test(fileUploads.value.toLowerCase())) {
                        $toast.show($toast.messages.INVALID_IMAGE_FORMAT, $toast.types.ERROR);
                    }else {
                        var file = $scope.uploadedfile;
                        var brand = $stateParams.brand;
                        console.log("brand:::>>>>>>>>", brand);
                        console.log("imageURL", imageURL);
                        var uploadUrl = imageURL + "/api/BoilerImages/upload";
                        fileUpload.uploadFileToUrl(file, uploadUrl, brand);
                        $toast.show($toast.messages.FILE_UPLOADED_SUCCESS, $toast.types.SUCCESS);
                        document.getElementById('uploadedfile').value = '';
                        setTimeout(function () {
                            vm.init();
                        }, 3000);
                    }
                }
            }

            function deleteimage() {
                var count = 0;
                document.getElementById('uploadedfile').value = '';
                angular.forEach(vm.boilerimages, function (boilerimage) {
                    if (boilerimage.selected) {
                        count++;
                    }
                });
                if (count == 0) {
                    $toast.show($toast.messages.INVALID_IMAGE_SELECTION, $toast.types.ERROR);
                } else {
                    confirmdelete();
                }
            }

            function saveerrorcodes() {
                ErrorCode.deleteAll().$promise;
                var result = ErrorCode.createMany(JSON.stringify(vm.errorcodes)).$promise;
                result.then(success, fail);
            }

            function isNumberKey_zip(e) {
                var charCode = (e.which) ? e.which : e.keyCode;
                if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
                    $scope.repcontactinfo = true;
                    $scope.norepcontactinfo = true;
                    $toast.show($toast.messages.INVALID_SEARCH_STRING, $toast.types.ERROR);
                    e.preventDefault();
                    return false;
                }
            }

            function keyDown($event) {

                if ($event.keyCode && $event.keyCode === 13) {
                    vm.getServRep();
                }
            }

            function getServRep() {

                if (!$scope.searchText) {
                    $toast.show($toast.messages.INVALID_SEARCH_STRING, $toast.types.ERROR);
                    $scope.norepcontactinfo = true;
                    $scope.repcontactinfo = true;
                    return false;
                }


                var uszipRegExp = /^\d{5}$/;
                var canadazipRegExp = /^[a-zA-Z][0-9][a-zA-Z]\s?[0-9][a-zA-Z][0-9]$/;

                if (!uszipRegExp.test($scope.searchText) && !canadazipRegExp.test($scope.searchText)) {
                    $toast.show($toast.messages.INVALID_SEARCH_STRING, $toast.types.ERROR);
                    $scope.norepcontactinfo = true;
                    $scope.repcontactinfo = true;
                    return false;
                }

                var params = {"id": $scope.searchText};
                var servicerep = ServiceRep.zip(params).$promise;
                servicerep.then(successServiceRep, failservice);
            }

            function successServiceRep(data){
                if(data.hasOwnProperty("OfficeName")){
                    $scope.repcontactinfo = false;
                    $scope.norepcontactinfo = true;
                    vm.servicereps = data;
                }else{
                    $scope.repcontactinfo = true;
                    $scope.norepcontactinfo = false;
                }
            }

            function Upload(type, status) {

                var fileUpload = document.getElementById(type);

                var regex = /^([a-zA-Z0-9\s_\\.\-:()])+(.csv)$/;
                if (regex.test(fileUpload.value.toLowerCase())) {
                    if (typeof (FileReader) != "undefined") {
                        var reader = new FileReader();
                        reader.onload = function (e) {

                            var lines = e.target.result.split(/\r\n|\n/);


                            var result = [];
                            var brandKey = lines[0].split(";");
                            console.log("brandKey", brandKey);
                            // if(($stateParams.brand == "0" || $stateParams.brand == "1") && (brandKey[0] == "brand") && ($stateParams.brand != brandKey[1])) {
                            //     $toast.show($toast.messages.INVALID_FILE, $toast.types.ERROR);
                            //     return;
                            // }
                            // if(!$stateParams.brand  && brandKey[0] == "brand") {
                            //     $toast.show($toast.messages.INVALID_FILE, $toast.types.ERROR);
                            //     return;
                            // }
                            if(($stateParams.brand == "0" || $stateParams.brand == 0) && ((brandKey[0] == "brand" && (brandKey[1] == "1" || brandKey[1] == 1)))) {
                                $toast.show($toast.messages.INVALID_FILE, $toast.types.ERROR);
                                return;
                            }
                            if(($stateParams.brand == "1" || $stateParams.brand == 1) && ((brandKey[0] == "brand" && (brandKey[1] == "0" || brandKey[1] == 0)) || brandKey[0] !== "brand")) {
                                $toast.show($toast.messages.INVALID_FILE, $toast.types.ERROR);
                                return;
                            }
                            if(lines[0].includes("brand")) {
                                var headers = lines[1].split(";");
                            } else {
                                var headers = lines[0].split(";");
                            }
                            var checkBrand = lines[0].includes("brand") ? 2 : 1;
                            for (var i = checkBrand; i < lines.length; i++) {


                                var currentline = lines[i].split(";");
                                // console.log("currentline", currentline);
                                if(currentline.length==headers.length) {
                                    var obj = {};

                                    for (var j = 0; j < headers.length; j++) {
                                        if (currentline) {
                                            if(lines[0].includes("brand")) {
                                                obj['brand'] = brandKey[1];
                                            }
                                            if(!lines[0].includes("brand")) {
                                                obj['brand'] = "0";
                                            }
                                            obj[headers[j]] = currentline[j];
                                        }
                                    }
                                    result.push(obj);
                                }
                            }

                            if (type == 'fileUploadBM') {

                                $scope.savebm = false;
                                $scope.cancelbm = false;
                                $scope.fupbm = true;
                                $scope.labelbm = true;

                                var tempbm = JSON.stringify(result);

                                for (j = 0; j < result.length; j++) {
                                    var flag = 0;
                                    for (i = 0; i < vm.boilerimages.length; i++) {
                                        // var imagename = vm.boilerimages[i].id.split('.');
                                        var imagename = vm.boilerimages[i].name.split('.');
                                        if (result[j].imageFile == imagename[0]) {
                                            flag = 1;
                                        }
                                    }
                                    if (!flag) result[j].imageFile = '';
                                }

                                vm.boilermodels = result;
                                $scope.$apply();
                                if (status == 'P') {
                                    var deleteBM = {
                                        brand: JSON.parse(tempbm)[0].brand
                                    }
                                    // return;
                                    BoilerModel.deleteMany(deleteBM).$promise;
                                    var result = BoilerModel.createMany(tempbm).$promise;
                                    result.then(success, fail);
                                }
                            }

                            if (type == 'fileUploadEC') {

                                $scope.saveec = false;
                                $scope.cancelec = false;
                                $scope.fupec = true;
                                $scope.labelec = true;

                                var tempec = JSON.stringify(result);
                                vm.errorcodes = result;
                                $scope.$apply();
                                if (status == 'P') {
                                    var deleteEC = {
                                        brand: JSON.parse(tempec)[0].brand
                                    }
                                    ErrorCode.deleteMany(deleteEC).$promise;
                                    var result = ErrorCode.createMany(tempec).$promise;
                                    result.then(success, fail);
                                }
                            }
                            if (type == 'fileUploadSC') {

                                $scope.savesc = false;
                                $scope.cancelsc = false;
                                $scope.fupsc = true;
                                $scope.labelsc = true;

                                var tempsc = JSON.stringify(result);
                                vm.statecodes = result;
                                $scope.$apply();
                                if (status == 'P') {
                                    var deleteSC = {
                                        brand: JSON.parse(tempsc)[0].brand
                                    }
                                    var resudelete = BoilerState.deleteMany(deleteSC).$promise;
                                    var result = BoilerState.createMany(tempsc).$promise;
                                    result.then(success, fail);
                                }
                            }
                            if (type == 'fileUploadSTC') {

                                $scope.savestc = false;
                                $scope.cancelstc = false;
                                $scope.fupstc = true;
                                $scope.labelstc = true;

                                var tempstc = JSON.stringify(result);
                                vm.statuscodes = result;
                                $scope.$apply();
                                if (status == 'P') {
                                    var deleteSTC = {
                                        brand: JSON.parse(tempstc)[0].brand
                                    }
                                    BoilerStatus.deleteMany(deleteSTC).$promise;
                                    var result = BoilerStatus.createMany(tempstc).$promise;
                                    result.then(success, fail);
                                }
                            }
                            if (type == 'fileUploadUT') {

                                $scope.saveut = false;
                                $scope.cancelut = false;
                                $scope.fuput = true;
                                $scope.labelut = true;

                                var temput = JSON.stringify(result);
                                vm.usertitles = result;
                                $scope.$apply();
                                if (status == 'P') {
                                    UserTitle.deleteAll().$promise;
                                    var result = UserTitle.createMany(temput).$promise;
                                    result.then(success, fail);
                                }
                            }

                            if (type == 'fileUploadRT') {

                                $scope.savert = false;
                                $scope.cancelrt = false;
                                $scope.fuprt = true;
                                $scope.labelrt = true;

                                var temprt = JSON.stringify(result);
                                vm.relaytexts = result;
                                $scope.$apply();
                                if (status == 'P') {
                                    var deleteRT = {
                                        brand: JSON.parse(temprt)[0].brand
                                    }
                                    RelayText.deleteMany(deleteRT).$promise;
                                    var result = RelayText.createMany(temprt).$promise;
                                    result.then(success, fail);
                                }
                            }

                            if (type == 'fileUploadAD') {

                                $scope.savead = false;
                                $scope.cancelad = false;
                                $scope.fupad = true;
                                $scope.labelad = true;

                                var tempad = JSON.stringify(result);
                                vm.activemodedemands = result;
                                $scope.$apply();
                                if (status == 'P') {
                                    var deleteAD = {
                                        brand: JSON.parse(tempad)[0].brand
                                    }
                                    ActiveModeDemand.deleteMany(deleteAD).$promise;
                                    var result = ActiveModeDemand.createMany(tempad).$promise;
                                    result.then(success, fail);
                                }
                            }
                        }
                        reader.readAsText(fileUpload.files[0]);
                    }
                } else {
                    $toast.show($toast.messages.INVALID_FILETYPE_UPLOAD, $toast.types.ERROR);
                }
            }

            function confirmdelete($event) {
                $dialog.show($dialog.templates.BOILER_IMAGE_DELETE, $event);
            }


            vm.confirmdeleteimg = function () {
                var count = 0;

                angular.forEach(vm.boilerimages, function (boilerimage) {
                    if (boilerimage.selected) {
                        count++;
                    }
                });

                angular.forEach(vm.boilerimages, function (boilerimage) {
                    if (boilerimage.selected) {
                        // var params = {"id": boilerimage.id};
                        var params = {"id": boilerimage.id};
                        var result = BoilerImage.deleteById(params).$promise;
                        result.then(successfileremove, fail);
                    }
                });
                $mdDialog.hide();
                $toast.show(count + ' ' + $toast.messages.FILE_REMOVED_SUCCESS, $toast.types.SUCCESS);
            };

            vm.init = init;
            vm.Upload = Upload;
            vm.deleteimage = deleteimage;
            vm.saveerrorcodes = saveerrorcodes;
            vm.cancel = cancel;
            vm.checkimg = checkimg;
            vm.fileChoosen = fileChoosen;
            vm.getServRep = getServRep;
            vm.isNumberKey_zip = isNumberKey_zip;
            vm.keyDown = keyDown;
            $rootScope.confirmdeleteimg = vm.confirmdeleteimg;
            vm.init();
        }
    ]);
