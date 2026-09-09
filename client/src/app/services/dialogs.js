'use strict';

(function (window, angular, undefined) {

    var module = angular.module("harsco-pk");

    module.factory(
        "$dialog", ['$mdDialog', '$rootScope', function ($mdDialog, $rootScope) {

            var _current = {};


            function getCurrentObject() {
                return _current;
            }

            function seCurrentObject(obj) {
                _current = obj;
            }

            function controller($scope) {

                $scope.obj = getCurrentObject();

                $scope.closeDialog = function () {
                    $mdDialog.hide();
                };

                $scope.confirmdeleteimg = function () {
                    $rootScope.confirmdeleteimg();
                    $mdDialog.hide();
                }

                $scope.confirmuserdelete = function () {
                    $rootScope.confirmuserdelete();
                    $mdDialog.hide();
                }

                $scope.confirm = function (passcode) {
                    $rootScope.writeToBoiler(passcode);
                    $mdDialog.hide();
                };

                $scope.delete = function () {
                    $rootScope.deleteboiler();
                    $mdDialog.hide();
                };

                $scope.deletemainsite = function () {
                    $rootScope.deleteboilermainsite();
                    $mdDialog.hide();
                };

                $scope.deleteNotification = function () {
                    $rootScope.deleteNotification();
                    $mdDialog.hide();
                };

                $scope.deletesiteuser = function () {
                    $rootScope.deleteusertosite();
                    $mdDialog.hide();
                };

                $scope.confirmChange = function () {
                    $rootScope.confirmChange();
                    $mdDialog.hide();
                };

                $scope.tab = function (e) {
                    var charCode = (e.which) ? e.which : e.keyCode;
                    if (charCode == 9) {
                        document.activeElement.selectionStart = 0;
                        var activeEl = document.activeElement;
                        activeEl.selectionStart = activeEl.selectionEnd;
                    }
                };

                $scope.keyPress = function (e, nextIndex) {
                    var charCode = (e.which) ? e.which : e.keyCode;

                    if(charCode == 32 && $scope.passcode) {
                        e.preventDefault();
                        $scope.passcode = $scope.passcode.replace(/^\s+|\s+$/g, '');

                    }
                    else {
                        $scope.passcode = ''
                    }

                    //var maxlength = 1;

//                    if (maxlength && charCode != 9 && charCode != 8) {
//                        angular.element(
//                            document.querySelector('#f_' + nextIndex))[0].focus();
//                    }
//
//                    for (var i = 0; i < 6; i++) {
//                        var input = document.getElementById('f_' + (i + 1)).value;
//                        var error = angular.element(document.querySelector('#f_' + (i + 1)));
//                        error.removeClass('error');
//                    }
                };

                $scope.download = function (type, document,$event) {

                    $rootScope.downloadFile(type, document,$event);
                    $mdDialog.hide();
                }
            }

            function show(template, $event, callback) {
                // TODO - receive options from each control, may be in future we need different toast behaviours

                var parentEl = angular.element(document.body);
                var dialogParams = {
                    parent: parentEl,
                    targetEvent: $event,
                    template: template,
                    controller: controller,
                    onRemoving: callback || angular.noop()
                };

                var x = $mdDialog.show(dialogParams);
            }

            function hide() {
                $mdDialog.hide();
            }

            var templates = {
                "KEEP_ALIVE": '<md-dialog aria-label="List dialog" id="aliveId">' +
                '<md-dialog-content>' +
                '<div><h3 class="text-center">Are you there?</h3></div>' +
                '<md-divider></md-divider>' +
                '<div class="p10">' +
                '<p>Do you still want the app to keep updating the latest data from the boiler?</p>' +
                '</div>' +
                '</md-dialog-content>' +
                '<md-dialog-actions>' +
                '<div layout="row" flex="100" layout-align="center center">' +
                '<md-button class="md-raised md-accent" ng-click="closeDialog()">YES</md-button>' +
                '</div>' +
                '</md-dialog-actions>' +
                '</md-dialog>',

                BOILER_WRITE: '<md-dialog aria-label="List dialog">' +
                '<md-dialog-content>' +
                '<div class="p10">' +
                '<h4 class="text-center">Please enter the Boiler\'s passcode</h4>' +
                '<div layout="row" class="mb-10" layout-align="space-around center">' +
                '<input type="tel" ng-model="passcode" maxlength="4" class="password-text-box border1" numbers-only placeholder="****" ng-class="error">' +
                '</div>' +
                '</div>' +
                '</md-dialog-content>' +
                '<md-dialog-actions>' +
                '<div layout="row" flex="100" layout-align="center center">' +
                '<md-button class="md-raised md-accent" ng-click="closeDialog()">cancel</md-button>' +
                '<md-button class="md-raised md-primary" ng-click="confirm(passcode)">confirm</md-button>' +
                '</div>' +
                '</md-dialog-actions>' +
                '</md-dialog>',

                BOILER_DOWNLOAD: '<md-dialog aria-label="List dialog">' +
                '<md-dialog-content>' +
                '<div><h3 class="text-center">Download</h3></div>' +
                '<md-divider></md-divider>' +
                '<div class="p10">' +
                '<md-button class="md-raised active" ng-click="download(1,document,$event)"> Screenshot </md-button>' +
                '<md-button hide show-gt-sm class="md-raised" ng-click="download(2, document,$event)"> Parameters</md-button>' +
                '<md-button hide show-gt-sm class="md-raised" ng-click="download(3, document,$event)"> Error Logs</md-button>' +
                '</div>' +
                '</md-dialog-content>' +
                '<md-dialog-actions>' +
                '<div layout="row" flex="100" layout-align="center center">' +
                '<md-button class="md-raised md-accent" ng-click="closeDialog()">Close</md-button>' +
                '</div>' +
                '</md-dialog-actions>' +
                '</md-dialog>',

                BOILER_DOWNLOAD_FILE: '<md-dialog aria-label="List dialog">' +
                '<md-dialog-content>' +
                '<div class="p10">' +
                '<img  src="{{obj.imageURLPath}}/api/BoilerFiles/{{obj.id}}/download?access_token={{obj.access_token}}">' +
                '</div>' +
                '</md-dialog-content>' +
                '<md-dialog-actions>' +
                '<div layout="row" flex="100" layout-align="center center">' +
                '<md-button class="md-raised md-accent" ng-click="closeDialog()">Close</md-button>' +
                '</div>' +
                '</md-dialog-actions>' +
                '</md-dialog>',

                BOILER_SUPPORT: '<md-dialog aria-label="List dialog">' +
                '<md-dialog-content>' +
                '<div><h3 class="text-center">Contact</h3></div>' +
                '<md-divider style="margin-bottom:10px "></md-divider>' +
                '<div class="p10">' +
                '<md-input-container class="md-block margin-0" flex-gt-sm>' +
                '<label>Name</label>' +
                '<input type="text" ng-model="obj.Contact" ng-disabled="true">' +
                '</md-input-container>' +
                '<md-input-container class="md-block margin-0" flex-gt-sm>' +
                '<label>Company</label>' +
                '<input type="text" ng-model="obj.OfficeName" ng-disabled="true">' +
                '</md-input-container>' +
                '<md-button href="mailto:{{obj.Email}}" class="md-raised text-left  active"><ng-md-icon icon="mail_outline" style="margin-right: 6px;" size="20"></ng-md-icon>{{obj.Email}}</md-button>' +
                '<md-button href="tel:{{obj.Phone}}" class="md-raised text-left"><ng-md-icon icon="phone" style="margin-right: 6px;" size="20"></ng-md-icon>{{obj.Phone}}</md-button>' +
                '</div>' +
                '</md-dialog-content>' +
                '<md-dialog-actions>' +
                '<div layout="row" flex="100" layout-align="center center">' +
                '<md-button class="md-raised md-accent" ng-click="closeDialog()">Close</md-button>' +
                '</div>' +
                '</md-dialog-actions>' +
                '</md-dialog>',

                BOILER_ERROR_DETAILS:'<md-dialog aria-label="List dialog">' +
                '<md-dialog-content>' +
                '<div><h3 class="text-center">{{obj.errorCode}}: {{obj.errorTitle}}</h3></div>' +
                '<md-divider style="margin-bottom:10px "></md-divider>' +
                '<div class="p10" ng-bind-html="obj.errorDesc">' +
                '</div>' +
                '</md-dialog-content>' +
                '<md-dialog-actions>' +
                '<div layout="row" flex="100" layout-align="center center">' +
                '<md-button class="md-raised md-accent" ng-click="closeDialog()">Close</md-button>' +
                '</div>' +
                '</md-dialog-actions>' +
                '</md-dialog>',

                BOILER_IMAGE_DELETE:'<md-dialog aria-label="List dialog">' +
                '  <md-dialog-content>' +
                '<div class="p10">' +
                '<h4 class="text-center">Are you sure you want to Delete?</h4>' +
                '    </div>' +
                '  </md-dialog-content>' +
                '  <md-dialog-actions>' +
                '    <div layout="row" flex="100" layout-align="center center" class="mb-10">' +
                '        <md-button class="md-raised md-accent" ng-click="closeDialog()">No</md-button>' +
                '        <md-button class="md-raised md-primary" ng-click="confirmdeleteimg()">Yes</md-button>' +
                '   </div>' +
                '  </md-dialog-actions>' +
                '</md-dialog>',

                USER_ROLE_DELETE: '<md-dialog aria-label="List dialog">' +
                '  <md-dialog-content>' +
                '<div class="p10">' +
                '<h4 class="text-center">Are you sure you want to Delete user role?</h4>' +
                '    </div>' +
                '  </md-dialog-content>' +
                '  <md-dialog-actions>' +
                '    <div layout="row" flex="100" layout-align="center center" class="mb-10">' +
                '        <md-button class="md-raised md-accent" ng-click="closeDialog()">No</md-button>' +
                '        <md-button class="md-raised md-primary" ng-click="confirmuserdelete()">Yes</md-button>' +
                '   </div>' +
                '  </md-dialog-actions>' +
                '</md-dialog>',

                BOILER_DELETE: '<md-dialog aria-label="List dialog">' +
                '  <md-dialog-content>' +
                '<div class="p10">' +
                '<h4 class="text-center">Are you sure you want to delete this boiler?</h4>' +
                '    </div>' +
                '  </md-dialog-content>' +
                '  <md-dialog-actions>' +
                '    <div layout="row" flex="100" layout-align="center center" class="mb-10">' +
                '        <md-button class="md-raised md-accent" ng-click="closeDialog()">No</md-button>' +
                '        <md-button class="md-raised md-primary" ng-click="delete()">Yes</md-button>' +
                '   </div>' +
                '  </md-dialog-actions>' +
                '</md-dialog>',

                NOTIFICATION_DELETE:'<md-dialog aria-label="List dialog">' +
                    '  <md-dialog-content>' +
                '<div class="p10">' +
                '<h4 class="text-center">Would you like to delete this device from your account</h4>' +
                '    </div>' +
                '  </md-dialog-content>' +
                '  <md-dialog-actions>' +
                '    <div layout="row" flex="100" layout-align="center center" class="mb-10">' +
                '        <md-button class="md-raised md-accent" ng-click="closeDialog()">No</md-button>' +
                '        <md-button class="md-raised md-primary" ng-click="deleteNotification()">Yes</md-button>' +
                '   </div>' +
                '  </md-dialog-actions>' +
                '</md-dialog>',

                PASSWORD_CHANGE: '<md-dialog aria-label="List dialog">' +
                '  <md-dialog-content>' +
                '<div class="p10">' +
                '<h4 class="text-center">Would like to change the password?</h4>' +
                '    </div>' +
                '  </md-dialog-content>' +
                '  <md-dialog-actions>' +
                '    <div layout="row" flex="100" layout-align="center center" class="mb-10">' +
                '        <md-button class="md-raised md-accent" ng-click="closeDialog()">No</md-button>' +
                '        <md-button class="md-raised md-primary" ng-click="confirmChange()">Yes</md-button>' +
                '   </div>' +
                '  </md-dialog-actions>' +
                '</md-dialog>',

                BOILERMAIN_SITE_DELETE: '<md-dialog aria-label="List dialog">' +
                '  <md-dialog-content>' +
                '<div class="p10">' +
                '<h4 class="text-center">Are you sure, you want to delete this site and all boilers in it?</h4>' +
                '    </div>' +
                '  </md-dialog-content>' +
                '  <md-dialog-actions>' +
                '    <div layout="row" flex="100" layout-align="center center">' +
                '        <md-button class="md-raised md-accent" ng-click="closeDialog()">No</md-button>' +
                '        <md-button class="md-raised md-primary" ng-click="deletemainsite()">Yes</md-button>' +
                '   </div>' +
                '  </md-dialog-actions>' +
                '</md-dialog>',

                SITE_USER_DELETE: '<md-dialog aria-label="List dialog">' +
                '  <md-dialog-content>' +
                '<div class="p10">' +
                '<h4 class="text-center">Are you sure you want to remove this user?</h4>' +
                '    </div>' +
                '  </md-dialog-content>' +
                '  <md-dialog-actions>' +
                '    <div layout="row" flex="100" layout-align="center center" class="mb-10">' +
                '        <md-button class="md-raised md-accent" ng-click="closeDialog()">No</md-button>' +
                '        <md-button class="md-raised md-primary" ng-click="deletesiteuser()">Yes</md-button>' +
                '   </div>' +
                '  </md-dialog-actions>' +
                '</md-dialog>',

                EULA: '<md-dialog aria-label="List dialog">' +
                    '<md-dialog-content>' +
                    '<div><h3 class="text-center">Test</h3></div>' +
                    '<md-divider style="margin-bottom:10px "></md-divider>' +
                    '<div class="p10">' +
                    'SOME XYZ SOME XYZ' +
                    '</div>' +
                    '</md-dialog-content>' +
                    '<md-dialog-actions>' +
                    '<div layout="row" flex="100" layout-align="center center">' +
                    '<md-button class="md-raised md-accent" ng-click="closeDialog()">Close</md-button>' +
                    '</div>' +
                    '</md-dialog-actions>' +
                    '</md-dialog>',

                DOWNLOAD_LIMIT: '<md-dialog aria-label="List dialog">' +
                    '<md-dialog-content>' +
                    '<div><h3 class="text-center">Download Limit Exceeded</h3></div>' +
                    '<md-divider style="margin-bottom:10px "></md-divider>' +
                    '<div class="p10">' +
                    'Please select maximum of 12 datapoints to download.' +
                    '</div>' +
                    '</md-dialog-content>' +
                    '<md-dialog-actions>' +
                    '<div layout="row" flex="100" layout-align="center center">' +
                    '<md-button class="md-raised md-accent" ng-click="closeDialog()">Close</md-button>' +
                    '</div>' +
                    '</md-dialog-actions>' +
                    '</md-dialog>',

                BOILER_DOWNLOAD_TIMEOUT: '<md-dialog aria-label="List dialog">' +
                    '<md-dialog-content>' +
                    '<div><h3 class="text-center">Request Timeout</h3></div>' +
                    '<md-divider style="margin-bottom:10px "></md-divider>' +
                    '<div class="p10">' +
                    'Looks like the server is taking to long to respond, please try again.' +
                    '</div>' +
                    '</md-dialog-content>' +
                    '<md-dialog-actions>' +
                    '<div layout="row" flex="100" layout-align="center center">' +
                    '<md-button class="md-raised md-accent" ng-click="closeDialog()">Close</md-button>' +
                    '</div>' +
                    '</md-dialog-actions>' +
                    '</md-dialog>'
            };

            var dialogs = {};
            dialogs.show = show;
            dialogs.hide = hide;
            dialogs.set = seCurrentObject;

            dialogs.templates = templates;

            return dialogs;
        }]
    );

})(window, window.angular);
