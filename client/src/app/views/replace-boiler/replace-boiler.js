(function () {

    angular.module('harsco-pk')
        .controller('replaceBoilerController', ['$timeout', '$state', '$stateParams', '$toast', '$storage',
            '$user', 'UserTitle', '$mdDialog', 'Boiler', 'BoilerReadRecord', 'Site', '$q',
            function ($timeout, $state, $stateParams, $toast, $storage,
                      $user, UserTitle, $mdDialog, Boiler, BoilerReadRecord, Site, $q) {

                var vm = this;
                vm.code = [];

                vm.model = {
                    title: 'Replace Nuro Control'
                };

                function keyup(e, nextIndex, curIndex) {
                    var input;
                    var charCode = (e.which) ? e.which : e.keyCode;
                    if (charCode == 13) {
                        return vm.next(e);
                    }
                    input = document.getElementById('f_' + curIndex).value;
                    if (input == '') {
                        angular.element('#f_' + curIndex).focus();
                    }
                    if (input != '' && charCode != 9 && charCode != 16) {
                        angular.element('#f_' + nextIndex).focus();
                        if (curIndex == 6) {
                            angular.element('#f_' + curIndex).blur();
                        }
                    }
                    for (var i = 0; i < 6; i++) {
                        var input = document.getElementById('f_' + (i + 1)).value;
                        var error = angular.element(document.querySelector('#f_' + (i + 1)));
                        error.removeClass('error');
                    }
                }

                function tab(e) {
                    var charCode = (e.which) ? e.which : e.keyCode;
                    if (charCode == 9) {
                        document.activeElement.selectionStart = 0;
                        var activeEl = document.activeElement;
                        activeEl.selectionStart = activeEl.selectionEnd;
                    }
                }

                function next(e) {
                    var array = [1, 2, 3, 4, 5, 6];
                    for (var i = 0; i < array.length; i++) {
                        var input = document.getElementById('f_' + array[i]).value;
                        if (input == '') {
                            var error = angular.element(document.querySelector('#f_' + array[i]));
                            error.addClass('error');
                        }
                    }
                }

                var acc = document.getElementsByClassName("sites-accordion");
                var i;

                for (i = 0; i < acc.length; i++) {
                    acc[i].onclick = function () {
                        this.classList.toggle("active");
                        this.nextElementSibling.classList.toggle("show");
                    }
                }

                function showBoiler() {
                    $state.go('common.boiler-details');
                }
           
                function success(boiler) {

                    /**
                     * We are updating the nuro SN of the old boiler with the new boiler,
                     * so the old boiler have the same values except nuroSN
                     * 1. Replace OLD Boiler nuro SN with new Boiler nuro SN
                     * 2. Replace new Boiler nuro SN with the text "Replaced "+ nuro SN
                     * 3. Replace new BoilersReadRecord's boilerId with old boilerId
                     */
                     
                    if (boiler[0] && boiler[0].status != false) {
                     
                        var nuro = boiler[0].nuroSN; // New Boiler
                        vm.boiler = boiler[1]; // Old Boiler

                        // STEP 1 - Replacing boiler nero with new boiler nero
                        var params = {
                            where: {
                                id: $stateParams.boilerId
                            }
                        };
                        vm.boiler.nuroSN = nuro;

                        Boiler.upsertWithWhere(params, vm.boiler).$promise.then(ok, error);

                        /**
                         * STEP 2 - Replace new boiler nero with "replaced"
                         * STEP 3 - update boilerId of new boilers boiler records
                         */
                        var params = {
                            where: {
                                id: boiler[0].id
                            }
                        };

                        var boilerID = {
                            boilerId: boiler[0].id
                        };
                        // var update = {
                        //     boilerId: $stateParams.boilerId
                        // };

                        var update = {
                            "boilerId": boiler[0].id,
                            "update": {
                                boilerId: $stateParams.boilerId
                            }
                        };

                        boiler[0].nuroSN = "Replaced " + nuro;
                        var promise = $q.all([
                            Boiler.upsertWithWhere(params, boiler[0]).$promise,
                            BoilerReadRecord.replace(update).$promise
                        ]);

                        promise.then(deleted, delete_error);
                        // TODO UPDATE RECORDS OF REPLACEMENT BOILER TO OLD BOILER

                        //Boiler.deleteById(params).$promise.then(deleted, delete_error);
                    } else {
                        $toast.show($toast.messages.BOILER_REPLACE_FAIL, $toast.types.ERROR);
                    }
                }

                function deleted() {
                    $state.go('common.boiler-details', {siteId: $stateParams.siteId, boilerId: $stateParams.boilerId});
                }

                function ok(data) {
                    $toast.show($toast.messages.BOILER_REPLACE_SUCCESS, $toast.types.SUCCESS);
                }

                function error() {
                    $toast.show($toast.messages.BOILER_REPLACE_FAIL, $toast.types.ERROR);
                }

                function delete_error() {
                    /**
                     * Delete failed but update success,
                     * this will not effect in replacing the boiler, but the new boiler will have the same info as old boiler
                     * but with out a site assigned to it.
                     */
                    $state.go('common.boiler-details', {siteId: $stateParams.siteId, boilerId: $stateParams.boilerId});
                }

                function fail(err) {
                    console.log(err);
                    $toast.show($toast.messages.BOILER_REPLACE_FAIL, $toast.types.ERROR);
                }

                function add() {

                    var count = 0;
                    for (var i = 0; i < 6; i++) {
                        var input = document.getElementById('f_' + (i + 1)).value;
                        if (input == '') {
                            count++;
                            var error = angular.element(document.querySelector('#f_' + (i + 1)));
                            error.addClass('error');
                        }
                    }
                    if (count == 0) {

                        var code = vm.code.join('');

                        var result = $q.all(
                            [
                                Boiler.exist({'signUpCode': code}).$promise,
                                Boiler.findById({"id": $stateParams.boilerId}).$promise

                            ]);
                        result.then(success, fail);
                    }
                }

                vm.keyup = keyup;
                vm.next = next;
                vm.showBoiler = showBoiler;
                vm.tab = tab;
                vm.add = add;
            }
        ]);
})();
