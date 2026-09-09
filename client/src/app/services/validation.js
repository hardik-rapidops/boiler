// CommonJS package manager support


(function (window, angular, undefined) {
    'use strict';

    var module = angular.module("validation", []);

    /**
     *
     * Validation factory
     * Here, we are holding all the common validation fields valid values
     * i.e for email if the email is valid then we are setting it to true, else false
     * we will reset all the values, once its valid.
     * we have a check property (said as valid). we will make it as true once the form is valid and submitted.
     *
     */
    module.factory(
        "$errors", function () {

            var validation = {};
            validation.errors = {};
            validation.reset = reset;

            function reset() {
                validation.errors = {};
            }

            return validation;
        }
    );

    module.directive('ngEmail', function ($errors) {
        return {
            require: 'ngModel',
            link: function (scope, elem, attrs, ngModel) {
                $errors.errors[attrs.ngModel] = false;
                scope.$watch(function () {
                    return ngModel.$modelValue;
                }, function (v) {
                    if (v) {
                        $errors.errors[attrs.ngModel] = true;
                    }
                })
            }
        };
    });

})(window, window.angular);
