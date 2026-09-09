'user strict'

angular.module('harsco-pk')
    .controller('notificationsController', [
        '$scope', '$toast', '$user', 'User', '$mdDialog', 'LoopBackAuth','$q','$dialog','$rootScope',
        function ($scope, $toast, $user, User, $mdDialog, LoopBackAuth,$q,$dialog,$rootScope) {

            var vm = this;
            vm.model = {
                title: 'Notifications'
            };
            vm.notifications = [];
            vm.checkedValues = [];
            $scope.enableAll = false;

            function success(data,error) {
                vm.user = LoopBackAuth.currentUserData;
                //var allDevicesNotify = false;
                vm.notificationsdata = data;
                for (var s = 0; s < vm.notificationsdata.length; s++) {
                    vm.notificationsdata[s].pretty_date = vm.prettyDate(vm.notificationsdata[s].updatedDate);
                }
                // for (var i = 0; i <vm.notificationsdata.length; i++) {
                //     if(vm.notificationsdata[i].status == 1){
                //         allDevicesNotify = true;
                //     } else{
                //         allDevicesNotify = false;
                //         break;
                //     }
                // }
                // if(allDevicesNotify){
                //     $scope.enableAll = true;
                // }else{
                //     $scope.enableAll = false;
                // }

            }

            function fail(error) {
                console.log("FAILURE");

            }
            function attach(user) {
                vm.user  = user;
            }

            function init() {
                //var count = 0;
                var params = {"id":$user.getUserId()};
                var devices = User.devices(params).$promise;
                devices.then(success,fail);
                var user = $user.authorize(attach);

            }

            function prettyDate(time) {
                var dbTime = new Date(time);
                var dateadded = dbTime.getTime();
                var today = new Date().getTime();
                var diffMs = (today - dateadded);
                var diffDays = Math.floor(diffMs / 86400000); // days
                var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
                var diffMins = Math.floor(((diffMs % 86400000) % 3600000) / 60000); // minutes
                var diffSecs = Math.floor((((diffMs % 86400000) % 3600000) % 60000) / 1000); // seconds
                if (diffDays > 5) {
                    var yyyy = dbTime.getFullYear().toString();
                    var mm = (dbTime.getMonth() + 1).toString(); // getMonth() is zero-based
                    var dd = dbTime.getDate().toString();
                    return (yyyy + '-' + (mm[1] ? mm : '0' + mm[0]) + '-' + (dd[1] ? dd : '0' + dd[0]));
                } else if (diffDays >= 2 && diffDays <= 5) {

                    return (diffDays + ' days ago ');
                } else if (diffDays >= 1 && diffDays < 2) {

                    return (' yesterday ');
                } else if (diffHrs >= 2 && diffHrs < 24) {

                    return (diffHrs + ' hours ago ');
                } else if (diffHrs >= 1 && diffHrs < 2) {

                    return (' an hour ago ');
                } else if (diffMins >= 2 && diffMins <= 59) {

                    return (diffMins + ' minutes ago ');
                } else if (diffMins >= 1 && diffMins < 2) {

                    return (' a minute ago ');
                } else if (diffSecs > 10 && diffSecs <= 59) {

                    return (diffSecs + ' seconds ago ');
                } else if (diffSecs <= 10) {
                    return (' just now ');
                }
            }

            function notificationStatus(notificationStatus){
                var statusfound = false;
                if(notificationStatus.status == 0){
                    notificationStatus.status = 1;
                } else if(notificationStatus.status == 1){
                    notificationStatus.status = 0;
                }

                var params = {"id":$user.getUserId(),'fk':notificationStatus.id};
                var statusChange =  User.devices.updateById(params,notificationStatus).$promise;
                statusChange.then(noti_Status_Success,noti_Status_Fail);

                for (var i = 0; i <vm.notificationsdata.length; i++) {
                    if(vm.notificationsdata[i].status == 1){
                        statusfound = true;
                    } else{
                        statusfound = false;
                        break;
                    }
                }
                if(statusfound){
                    $scope.enableAll = true;
                }else{
                    $scope.enableAll = false;
                }

            }
            function noti_Status_Success(data,error){
                $toast.show($toast.messages.DEVICE_NOTIFICATIONS_SUCCESS,$toast.types.SUCCESS);
            }
            function noti_Status_Fail(data,error){
                $toast.show($toast.messages.DEVICE_NOTIFICATIONS_FAIL,$toast.types.SUCCESS);
            }

            function notifyAllDevices(){
                // if($scope.enableAll == false){
                //     $scope.enableAll = true;
                //     for(var i=0; i<vm.notificationsdata.length;i++){
                //         vm.notificationsdata[i].status = 1;
                //         var params = {"id":$user.getUserId(),'fk':vm.notificationsdata[i].id};
                //         var statusChangeAllDevices =  User.devices.updateById(params,vm.notificationsdata[i]).$promise;
                //         statusChangeAllDevices.then(noti_StatusAllDevices_Success,noti_StatusAllDevices_Fail);
                //     }
                // } else if($scope.enableAll == true){
                //     $scope.enableAll = false;
                //     for(var i=0; i<vm.notificationsdata.length;i++){
                //         vm.notificationsdata[i].status = 0;
                //         var params = {"id":$user.getUserId(),'fk':vm.notificationsdata[i].id};
                //         var statusChangeAllDevices =  User.devices.updateById(params,vm.notificationsdata[i]).$promise;
                //         statusChangeAllDevices.then(noti_StatusAllDevices_Success,noti_StatusAllDevices_Fail);
                //     }
                // }

            }

            // function noti_StatusAllDevices_Success(data,error){

            // }
            // function noti_StatusAllDevices_Fail(data,error){


            // }


            function notificationcheckboxclick(notification,i){
                var index = vm.checkedValues.indexOf(notification.id);
                if(index > -1) vm.checkedValues.splice(index,1);
                else vm.checkedValues[vm.checkedValues.length] = notification.id;

            }

            function notificationDelete(){
                var apis = [];
                for(var i = 0; i < vm.checkedValues.length; i++){
                    if(vm.checkedValues[i]) {
                        var params = {"id":$user.getUserId(),'fk':vm.checkedValues[i]};
                         apis.push(User.devices.destroyById(params).$promise);

                    }
                }

                $q.all(apis).then(deleteSuccess,deleteFail);
            }

            function deleteSuccess(data,error) {
                $mdDialog.hide();
                $toast.show(vm.checkedValues.length +' '+$toast.messages.DELETE_NOTIFICATIONS_SUCCESS,$toast.types.SUCCESS);
                for(var j = 0; j < vm.checkedValues.length; j++) {
                    for(var i = 0; i < vm.notificationsdata.length; i++){

                        if(vm.notificationsdata[i].id === vm.checkedValues[j]){
                            vm.notificationsdata.splice(i,1);
                        }
                    }
                }

                vm.notifications = [];
                vm.checkedValues = [];
            }

            function deleteFail(error) {
                $mdDialog.hide();
                $toast.show($toast.messages.DELETE_NOTIFICATIONS_FAIL,$toast.types.ERROR);

            }


            vm.deleteNotification = function(){
                vm.notificationDelete();
            }

            $scope.BoilerMain_Notifications = function($event) {
                if(vm.checkedValues.length == 0){
                    $toast.show($toast.messages.NO_NOTIFICATIONS_SELECT,$toast.types.ERROR);
                    return;
                }

                $dialog.show($dialog.templates.NOTIFICATION_DELETE, $event);
            };

            function emailSuccess(data) {
                $toast.show($toast.messages.EMAIL_NOTIFICATIONS_SUCCESS,$toast.types.SUCCESS);
            }

            function emailFail() {
                $toast.show($toast.messages.EMAIL_NOTIFICATIONS_FAIL,$toast.types.ERROR);
            }

            function notifyEmail() {

                vm.user.emailNotifications = !vm.user.emailNotifications;

                $scope.vmr.user.emailNotifications=vm.user.emailNotifications;

                $user.replace(vm.user,emailSuccess,emailFail);
            }

            vm.init = init;
            vm.prettyDate = prettyDate;
            vm.notificationcheckboxclick = notificationcheckboxclick;
            vm.notificationDelete = notificationDelete;
            vm.notificationStatus = notificationStatus;
            vm.notifyAllDevices = notifyAllDevices;
            vm.notifyEmail = notifyEmail;
            $rootScope.deleteNotification=vm.deleteNotification;

            vm.init();

        }
    ]);
