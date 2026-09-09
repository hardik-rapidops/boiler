angular.module('harsco-pk')
    .controller('addBoilerController', [
        '$timeout', '$state', '$toast', '$user','$sharedMethods', 'Boiler', 'Site', 'User',
        function ($timeout, $state, $toast, $user,$sharedMethods, Boiler, Site, User) {

            var vm = this;

            var signUpCode = null;

            vm.model = {
                title: 'Add a new boiler'
            };
            vm.code = [];

            function fail(error) {
                $toast.show($toast.messages.INVALID_BOILER_CODE, $toast.types.ERROR)
            }

            function success(boilerId, sites) {
                if (sites.length == 0) {
                    $toast.show($toast.messages.ADD_SITES_BEFORE_BOILER, $toast.types.SUCCESS);
                    $state.go('common.add-sites', {'boilerId': boilerId});
                }else {
                    $state.go('common.boiler-info', {boilerId: boilerId});
                }
            }

            function getSites(data) {
                if (!data.status) {
                    $toast.show($toast.messages.INVALID_BOILER_CODE, $toast.types.ERROR);
                    return;
                }

                var user = {"id": $user.getUserId()};
                var result = User.sites(user).$promise;
                result.then(function (sites_data) {
                    success(data.data.id, sites_data)
                }, fail);
            }

            function add() {
                var code = vm.code.join('');
                code = code.toLowerCase();
                var result = Boiler.exist({'signUpCode':code}).$promise;

                result.then(getSites, fail);
            }

            vm.add = add;
            vm.keyup = keyup;
            vm.addBoiler = addBoiler;
            vm.tab = tab;

            function keyup(e, nextIndex, curIndex){
                var input;
                var charCode = (e.which) ? e.which : e.keyCode;
                if(charCode == 13){
                    return vm.addBoiler(e);
                }
                input = document.getElementById('f_' + curIndex).value;
                if(input == ''){
                    angular.element('#f_' + curIndex).focus();
                }
                if(input != '' && charCode != 9 && charCode != 16){
                    angular.element('#f_' + nextIndex).focus();
                    if(curIndex == 6) {
                        angular.element('#f_' + curIndex).blur();
                    }
                }
                for(var i=0; i < 6; i++) {
                    var input = document.getElementById('f_' + (i+1)).value;
                    var error = angular.element( document.querySelector( '#f_' + (i+1)));
                    error.removeClass('error');
                }
            }

            // TODO Move this to own directive for future use.
            function tab(e) {
                var charCode = (e.which) ? e.which : e.keyCode;
                if (charCode == 9) {
                    document.activeElement.selectionStart = 0;
                    var activeEl = document.activeElement;
                    activeEl.selectionStart = activeEl.selectionEnd;
                }
            }

            function addBoiler(e) {
                var count = 0;
                for (var i = 0; i < 6; i++) {
                    var input = document.getElementById('f_' + (i+1)).value;
                    if (input == '') {
                        count++;
                        var error = angular.element(document.querySelector('#f_' + (i+1)));
                        error.addClass('error');
                    }
                }
                if (count == 0) {
                    add();
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
        }
    ]);
