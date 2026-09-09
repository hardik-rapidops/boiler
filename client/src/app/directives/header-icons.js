(function () {
    angular.module('harsco-pk').directive('ngHeaderIcons', ['$state', '$compile', ngHeaderIcons]);
    angular.module('harsco-pk').directive('ngBackButton', ['$state', '$compile', '$mdSidenav', ngBackButton]);
    angular.module('harsco-pk').directive('mdActiveMenu', ['$state', '$compile', '$mdSidenav', mdActiveMenu]);
    angular.module('harsco-pk').directive('keepAlive', ['$state', '$interval', '$dialog', '$document', keepAlive]);
    angular.module('harsco-pk').directive('ngStartWith', ngStartWith);
    angular.module('harsco-pk').directive('mdInputContainer', ['$timeout', mdInputContainer]);
    angular.module('harsco-pk').directive('onFinishRender',['$timeout',onFinishRender]);
    angular.module('harsco-pk').directive('ngAccordianToggle',['$timeout',ngAccordianToggle]);
    angular.module('harsco-pk').directive('numbersOnly',numbersOnly);
    angular.module('harsco-pk').directive('numbersOnlyDoller',numbersOnlyDoller);
    angular.module('harsco-pk').directive('myMaxlength',myMaxlength);
    angular.module('harsco-pk').directive('floatOnly',floatOnly);


    function ngHeaderIcons($state, $compile) {

        var getTemplate = function () {

            var current = $state.current.name;

            var template = '';
            switch (current) {
                case 'common.boiler-details':
                    template = '<md-button  class="md-icon-button" ng-click="support($event)" style="background-color: #0667a0;">' +
                        '<ng-md-icon icon="perm_phone_msg" style="fill:#fff"></ng-md-icon>' +
                        '</md-button>';
                    break;
            }

            return template;
        };

        var linker = function (scope, element, attrs) {
            element.html(getTemplate());
            $compile(element.contents())(scope);
        };

        return {
            restrict: "E",
            replace: true,
            link: linker
        };
    }

    function ngBackButton($state, $compile, $mdSidenav) {

        var getTemplate = function () {

            var current = $state.current.data && $state.current.data.back;

            var template = '';

            if (current) {
                template = '<md-button class="md-icon-button" aria-label="Menu Button" ng-click="goBack()">'
                    + '<ng-md-icon icon="arrow_back" size="24"></ng-md-icon>'
                    + '</md-button>';
            } else {
                template = '<md-button class="md-icon-button" aria-label="Menu Button" hide-gt-sm ng-click="onClickMenu();">'
                    + '<md-icon md-svg-icon="images/icons/menu.svg" aria-label="Menu Icon">'
                    + '</md-icon>'
                    + '</md-button>';
            }

            return template;
        };

        var linker = function (scope, element, attrs) {
            element.html(getTemplate());
            $compile(element.contents())(scope);
        };

        var controller = function ($scope) {

            $scope.goBack = function () {
                window.history.back(-1);
            };
            $scope.onClickMenu = function () {
                $mdSidenav('left').toggle();
            };
        };

        return {
            restrict: "E",
            replace: true,
            link: linker,
            controller: controller,
            scope: {content: '='}
        };
    }

    function mdInputContainer($timeout) {

        var linker = function (scope, element) {
            var ua = navigator.userAgent;
            if (ua.match(/chrome/i) && !ua.match(/edge/i)) {
                $timeout(function () {
                    if (element[0].querySelector('input[type=password]:-webkit-autofill')) {
                        element.addClass('md-input-has-value');
                    }
                }, 300);
            }
        };
        return {
            link: linker
        };
    }

    function mdActiveMenu($state, $compile, $mdSidenav) {

        var linker = function (scope, element, attrs) {
            element.bind('click', function () {
                var el = angular.element('.active');  // TODO change to directive specific
                el.removeClass('active');
                element.addClass('active');
            });
        };

        return {
            restrict: "A",
            link: linker
        };
    }

    function keepAlive($state, $interval, $dialog, $document) {

        var linker = function (scope, element, attrs) {

            var IDLE_WARNTIME = 600; //seconds
            var IDLE_TIMEOUT = 300; //seconds
            var _idleSecondsCounter = 0,
                _idleTimeOutCounter = 0,
                warnTime, endTime;

            var el = angular.element('#aliveId'); // TODO Move to its own directive

            el.bind('click', function () {
                restartCounter();
            });
            el.bind('mousemove', function () {
                restartCounter();
            });
            el.bind('KeyUp', function () {
                restartCounter();
            });

            element.bind('click', function () {
                restartCounter();
            });
            element.bind('mousemove', function () {
                restartCounter();
            });

            element.bind('keyup', function () {
                restartCounter();
            });

            function restartCounter() {
                $interval.cancel(warnTime);
                $interval.cancel(endTime);
                start()
            }

            function startWarnTime() {
                _idleSecondsCounter = 0;
                _idleTimeOutCounter = 0;
                warnTime = $interval(checkIdleTime, 1000);
            }

            function startTimeOut() {
                _idleTimeOutCounter = 0;
                endTime = $interval(checkEndTime, 1000);
            }

            element.on('$destroy', function () {
                $interval.cancel(warnTime);
                $interval.cancel(endTime);
                scope.destroy();
            });

            function checkIdleTime() {
                _idleSecondsCounter++;
                if (_idleSecondsCounter >= IDLE_WARNTIME) {
                    $dialog.show($dialog.templates.KEEP_ALIVE);
                    $interval.cancel(warnTime);
                    startTimeOut(_idleSecondsCounter)
                }
            }

            function checkEndTime() {
                _idleTimeOutCounter++;
                if (_idleTimeOutCounter >= IDLE_TIMEOUT) {
                    $interval.cancel(endTime);
                    $dialog.hide();
                    $state.go('common.boilers');
                }
            }

            function start() {
                if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                    startWarnTime();

                }
            }

            start();

        };

        var controller = function ($scope) {
        };

        return {
            restrict: "A",
            link: linker,
            controller: controller,
            scope: {
                destroy: '&destroyFn'
            }
        };
    }

    function ngStartWith() {

        var linker = function ($scope, element, attrs) {
            element.bind('keypress', function () {
                var value = element[0].value;
                value = value.replace("$", '');
                element[0].value = '$' + value;
            });
        };

        return {
            restrict: "A",
            replace: true,
            link: linker,
            scope: {
                content: '='
            }
        };
    }

    angular.module('harsco-pk').directive('uiMask', [function () {
        var maskDefinitions = {
            '9': /\d/,
            'A': /[a-zA-Z]/,
            '*': /[a-zA-Z0-9]/
        };
        return {
            priority: 100,
            require: 'ngModel',
            restrict: 'A',
            link: function (scope, iElement, iAttrs, controller) {

                var maskProcessed = false, eventsBound = false,
                    maskCaretMap, maskPatterns, maskPlaceholder, maskComponents,
                    validValue,
                    // Minimum required length of the value to be considered valid
                    minRequiredLength,
                    value, valueMasked, isValid, viewValue,
                    // Vars for initializing/uninitializing
                    originalPlaceholder = iAttrs.placeholder,
                    originalMaxlength = iAttrs.maxlength,
                    // Vars used exclusively in eventHandler()
                    oldValue, oldValueUnmasked, oldCaretPosition, oldSelectionLength;

                function initialize(maskAttr) {
                    if (!angular.isDefined(maskAttr)) {
                        return uninitialize();
                    }
                    processRawMask(maskAttr);
                    if (!maskProcessed) {
                        return uninitialize();
                    }
                    initializeElement();
                    bindEventListeners();
                }

                function formatter(fromModelValue) {
                    if (!maskProcessed) {
                        return fromModelValue;
                    }
                    value = unmaskValue(fromModelValue || '');
                    isValid = validateValue(value);
                    controller.$setValidity('mask', isValid);

                    if (isValid) validValue = value;

                    return isValid && value.length ? maskValue(value) : undefined;
                }


                function parser(fromViewValue) {
                    if (!maskProcessed) {
                        return fromViewValue;
                    }
                    value = unmaskValue(fromViewValue || '');
                    isValid = validateValue(value);
                    viewValue = value.length ? maskValue(value) : '';
                    // We have to set viewValue manually as the reformatting of the input
                    // value performed by eventHandler() doesn't happen until after
                    // this parser is called, which causes what the user sees in the input
                    // to be out-of-sync with what the controller's $viewValue is set to.
                    controller.$viewValue = viewValue;
                    controller.$setValidity('mask', isValid);
                    if (value === '' && controller.$error.required !== undefined) {
                        controller.$setValidity('required', false);
                    }
                    if (isValid) validValue = value;

                    return isValid ? value : undefined;
                }

                iAttrs.$observe('uiMask', initialize);
                controller.$formatters.push(formatter);
                controller.$parsers.push(parser);

                function uninitialize() {
                    maskProcessed = false;
                    unbindEventListeners();

                    if (angular.isDefined(originalPlaceholder)) {
                        iElement.attr('placeholder', originalPlaceholder);
                    } else {
                        iElement.removeAttr('placeholder');
                    }

                    if (angular.isDefined(originalMaxlength)) {
                        iElement.attr('maxlength', originalMaxlength);
                    } else {
                        iElement.removeAttr('maxlength');
                    }

                    iElement.val(controller.$modelValue);
                    controller.$viewValue = controller.$modelValue;
                    return false;
                }

                function initializeElement() {
                    value = oldValueUnmasked = unmaskValue(controller.$modelValue || '');
                    valueMasked = oldValue = maskValue(value);
                    isValid = validateValue(value);
                    viewValue = isValid && value.length ? valueMasked : '';
                    if (iAttrs.maxlength) { // Double maxlength to allow pasting new val at end of mask
                        iElement.attr('maxlength', maskCaretMap[maskCaretMap.length - 1] * 2);
                    }
                    // iElement.attr('placeholder', maskPlaceholder);
                    iElement.val(viewValue);
                    controller.$viewValue = viewValue;
                    // Not using $setViewValue so we don't clobber the model value and dirty the form
                    // without any kind of user interaction.
                }

                function bindEventListeners() {
                    if (eventsBound) {
                        return true;
                    }
                    iElement.bind('blur', blurHandler);
                    iElement.bind('mousedown mouseup', mouseDownUpHandler);
                    iElement.bind('input keyup click', eventHandler);
                    eventsBound = true;
                }

                function unbindEventListeners() {
                    if (!eventsBound) {
                        return true;
                    }
                    iElement.unbind('blur', blurHandler);
                    iElement.unbind('mousedown', mouseDownUpHandler);
                    iElement.unbind('mouseup', mouseDownUpHandler);
                    iElement.unbind('input', eventHandler);
                    iElement.unbind('keyup', eventHandler);
                    iElement.unbind('click', eventHandler);
                    eventsBound = false;
                }

                function validateValue(value) {
                    // Zero-length value validity is ngRequired's determination
                    return value.length ? value.length >= minRequiredLength : true;
                }

                function unmaskValue(value) {
                    var valueUnmasked = '',
                        maskPatternsCopy = maskPatterns.slice();
                    // Preprocess by stripping mask components from value
                    value = value.toString();
                    angular.forEach(maskComponents, function (component, i) {
                        value = value.replace(component, '');
                    });
                    angular.forEach(value.split(''), function (chr, i) {
                        if (maskPatternsCopy.length && maskPatternsCopy[0].test(chr)) {
                            valueUnmasked += chr;
                            maskPatternsCopy.shift();
                        }
                    });
                    return valueUnmasked;
                }

                function maskValue(unmaskedValue) {
                    var valueMasked = '',
                        maskCaretMapCopy = maskCaretMap.slice();
                    angular.forEach(maskPlaceholder.split(''), function (chr, i) {
                        if (unmaskedValue.length && i === maskCaretMapCopy[0]) {
                            valueMasked += unmaskedValue.charAt(0) || '_';
                            unmaskedValue = unmaskedValue.substr(1);
                            maskCaretMapCopy.shift();
                        }
                        else {
                            valueMasked += chr;
                        }
                    });
                    return valueMasked;
                }

                function processRawMask(mask) {
                    var characterCount = 0;
                    maskCaretMap = [];
                    maskPatterns = [];
                    maskPlaceholder = '';

                    // No complex mask support for now...
                    // if (mask instanceof Array) {
                    //   angular.forEach(mask, function(item, i) {
                    //     if (item instanceof RegExp) {
                    //       maskCaretMap.push(characterCount++);
                    //       maskPlaceholder += '_';
                    //       maskPatterns.push(item);
                    //     }
                    //     else if (typeof item == 'string') {
                    //       angular.forEach(item.split(''), function(chr, i) {
                    //         maskPlaceholder += chr;
                    //         characterCount++;
                    //       });
                    //     }
                    //   });
                    // }
                    // Otherwise it's a simple mask
                    // else

                    if (typeof mask === 'string') {
                        minRequiredLength = 0;
                        var isOptional = false;

                        angular.forEach(mask.split(''), function (chr, i) {
                            if (maskDefinitions[chr]) {
                                maskCaretMap.push(characterCount);
                                maskPlaceholder += '_';
                                maskPatterns.push(maskDefinitions[chr]);

                                characterCount++;
                                if (!isOptional) {
                                    minRequiredLength++;
                                }
                            }
                            else if (chr === "?") {
                                isOptional = true;
                            }
                            else {
                                maskPlaceholder += chr;
                                characterCount++;
                            }
                        });
                    }
                    // Caret position immediately following last position is valid.
                    maskCaretMap.push(maskCaretMap.slice().pop() + 1);
                    // Generate array of mask components that will be stripped from a masked value
                    // before processing to prevent mask components from being added to the unmasked value.
                    // E.g., a mask pattern of '+7 9999' won't have the 7 bleed into the unmasked value.
                    // If a maskable char is followed by a mask char and has a mask
                    // char behind it, we'll split it into it's own component so if
                    // a user is aggressively deleting in the input and a char ahead
                    // of the maskable char gets deleted, we'll still be able to strip
                    // it in the unmaskValue() preprocessing.
                    maskComponents = maskPlaceholder.replace(/[_]+/g, '_').replace(/([^_]+)([a-zA-Z0-9])([^_])/g, '$1$2_$3').split('_');
                    maskProcessed = maskCaretMap.length > 1 ? true : false;
                }

                function blurHandler(e) {
                    oldCaretPosition = 0;
                    oldSelectionLength = 0;
                    if (!isValid || value.length === 0) {
                        valueMasked = '';
                        iElement.val('');
                        scope.$apply(function () {
                            controller.$setViewValue('');
                        });
                    }
                }

                function mouseDownUpHandler(e) {
                    if (e.type === 'mousedown') {
                        iElement.bind('mouseout', mouseoutHandler);
                    } else {
                        iElement.unbind('mouseout', mouseoutHandler);
                    }
                }

                iElement.bind('mousedown mouseup', mouseDownUpHandler);

                function mouseoutHandler(e) {
                    oldSelectionLength = getSelectionLength(this);
                    iElement.unbind('mouseout', mouseoutHandler);
                }

                function eventHandler(e) {
                    e = e || {};
                    // Allows more efficient minification
                    var eventWhich = e.which,
                        eventType = e.type;
                    // Prevent shift and ctrl from mucking with old values
                    if (eventWhich === 16 || eventWhich === 91) {
                        return true;
                    }

                    var val = iElement.val(),
                        valOld = oldValue,
                        valMasked,
                        valUnmasked = unmaskValue(val),
                        valUnmaskedOld = oldValueUnmasked,
                        valAltered = false,

                        caretPos = getCaretPosition(this) || 0,
                        caretPosOld = oldCaretPosition || 0,
                        caretPosDelta = caretPos - caretPosOld,
                        caretPosMin = maskCaretMap[0],
                        caretPosMax = maskCaretMap[valUnmasked.length] || maskCaretMap.slice().shift(),

                        selectionLen = getSelectionLength(this),
                        selectionLenOld = oldSelectionLength || 0,
                        isSelected = selectionLen > 0,
                        wasSelected = selectionLenOld > 0,

                        // Case: Typing a character to overwrite a selection
                        isAddition = (val.length > valOld.length) || (selectionLenOld && val.length > valOld.length - selectionLenOld),
                        // Case: Delete and backspace behave identically on a selection
                        isDeletion = (val.length < valOld.length) || (selectionLenOld && val.length === valOld.length - selectionLenOld),
                        isSelection = (eventWhich >= 37 && eventWhich <= 40) && e.shiftKey, // Arrow key codes

                        isKeyLeftArrow = eventWhich === 37,
                        // Necessary due to "input" event not providing a key code
                        isKeyBackspace = eventWhich === 8 || (eventType !== 'keyup' && isDeletion && (caretPosDelta === -1)),
                        isKeyDelete = eventWhich === 46 || (eventType !== 'keyup' && isDeletion && (caretPosDelta === 0 ) && !wasSelected),

                        // Handles cases where caret is moved and placed in front of invalid maskCaretMap position. Logic below
                        // ensures that, on click or leftward caret placement, caret is moved leftward until directly right of
                        // non-mask character. Also applied to click since users are (arguably) more likely to backspace
                        // a character when clicking within a filled input.
                        caretBumpBack = (isKeyLeftArrow || isKeyBackspace || eventType === 'click') && caretPos > caretPosMin;

                    oldSelectionLength = selectionLen;

                    // These events don't require any action
                    if (isSelection || (isSelected && (eventType === 'click' || eventType === 'keyup'))) {
                        return true;
                    }

                    // Value Handling
                    // ==============

                    // User attempted to delete but raw value was unaffected--correct this grievous offense

                    if ((eventType === 'input') && isDeletion && !wasSelected && valUnmasked === valUnmaskedOld) {

                        while (isKeyBackspace && caretPos > caretPosMin && !isValidCaretPosition(caretPos)) {
                            caretPos--;
                        }
                        while (isKeyDelete && caretPos < caretPosMax && maskCaretMap.indexOf(caretPos) === -1) {
                            caretPos++;
                        }
                        var charIndex = maskCaretMap.indexOf(caretPos);
                        // Strip out non-mask character that user would have deleted if mask hadn't been in the way.
                        valUnmasked = valUnmasked.substring(0, charIndex) + valUnmasked.substring(charIndex + 1);
                        valAltered = true;
                    }

                    // Update values
                    // console.log(e);
                    //console.log(String.fromCharCode(e.keyCode));
                    //console.log(String.fromCodePoint(e.keyCode));
                    //console.log("---> update values start");
                    //console.log("valUnmasked:" + valUnmasked);
                    //console.log("valMasked:" + valMasked);
                    valMasked = maskValue(valUnmasked);
                    oldValue = valMasked;
                    oldValueUnmasked = valUnmasked;
                    iElement.val(valMasked);
                    if (valAltered) {
                        //console.log("value was altered");
                        //console.log("apply:" + valUnmasked);
                        // We've altered the raw value after it's been $digest'ed, we need to $apply the new value.
                        scope.$apply(function () {
                            controller.$setViewValue(valUnmasked);
                        });
                    }
                    //console.log("<--- update values end");
                    // Caret Repositioning
                    // ===================

                    // Ensure that typing always places caret ahead of typed character in cases where the first char of
                    // the input is a mask char and the caret is placed at the 0 position.
                    if (isAddition && (caretPos <= caretPosMin)) {
                        caretPos = caretPosMin + 1;
                    }

                    if (caretBumpBack) {
                        caretPos--;
                    }

                    // Make sure caret is within min and max position limits
                    caretPos = caretPos > caretPosMax ? caretPosMax : caretPos < caretPosMin ? caretPosMin : caretPos;

                    // Scoot the caret back or forth until it's in a non-mask position and within min/max position limits
                    while (!isValidCaretPosition(caretPos) && caretPos > caretPosMin && caretPos < caretPosMax) {
                        caretPos += caretBumpBack ? -1 : 1;
                    }

                    if ((caretBumpBack && caretPos < caretPosMax) || (isAddition && !isValidCaretPosition(caretPosOld))) {
                        caretPos++;
                    }
                    oldCaretPosition = caretPos;
                    setCaretPosition(this, caretPos);
                }

                function isValidCaretPosition(pos) {
                    return maskCaretMap.indexOf(pos) > -1;
                }

                function getCaretPosition(input) {
                    if (input.selectionStart !== undefined) {
                        return input.selectionStart;
                    } else if (document.selection) {
                        // Curse you IE
                        input.focus();
                        var selection = document.selection.createRange();
                        selection.moveStart('character', -input.value.length);
                        return selection.text.length;
                    }
                }

                function setCaretPosition(input, pos) {
                    if (input.offsetWidth === 0 || input.offsetHeight === 0) {
                        return true; // Input's hidden
                    }
                    if (input.setSelectionRange) {
                        input.focus();
                        input.setSelectionRange(pos, pos);
                    }
                    else if (input.createTextRange) {
                        // Curse you IE
                        var range = input.createTextRange();
                        range.collapse(true);
                        range.moveEnd('character', pos);
                        range.moveStart('character', pos);
                        range.select();
                    }
                }

                function getSelectionLength(input) {
                    if (input.selectionStart !== undefined) {
                        return (input.selectionEnd - input.selectionStart);
                    }
                    if (document.selection) {
                        return (document.selection.createRange().text.length);
                    }
                }

                // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf
                if (!Array.prototype.indexOf) {
                    Array.prototype.indexOf = function (searchElement /*, fromIndex */) {
                        "use strict";
                        if (this === null) {
                            throw new TypeError();
                        }
                        var t = Object(this);
                        var len = t.length >>> 0;
                        if (len === 0) {
                            return -1;
                        }
                        var n = 0;
                        if (arguments.length > 1) {
                            n = Number(arguments[1]);
                            if (n !== n) { // shortcut for verifying if it's NaN
                                n = 0;
                            } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
                                n = (n > 0 || -1) * Math.floor(Math.abs(n));
                            }
                        }
                        if (n >= len) {
                            return -1;
                        }
                        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
                        for (; k < len; k++) {
                            if (k in t && t[k] === searchElement) {
                                return k;
                            }
                        }
                        return -1;
                    };
                }

            }
        };
    }
    ]);

    function onFinishRender($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$emit(attr.onFinishRender);
                    });
                }
            }
        }
    }

    function ngAccordianToggle($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                element.on('click',function(event) {


                    element.toggleClass('active');
                    element.next().toggleClass("show");



                })
            }
        }
    }

    function numbersOnly () {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModelCtrl) {
                element.on('keyup',function(e) {
                    if(element[0].value == " ") {
                        e.preventDefault();
                        element[0].value = '';
                    }
                });

                element.on('change',function(e) {
                    if(element[0].value == " ") {
                        e.preventDefault();
                        element[0].value = '';
                    }
                });

                function fromUser(text) {
                    if (text) {
                        var transformedInput = text.replace(/[^0-9]/g, '');
                        if (transformedInput !== text) {
                            ngModelCtrl.$setViewValue(transformedInput);
                            ngModelCtrl.$render();
                        }
                        return transformedInput;
                    }
                    return undefined;
                }
                ngModelCtrl.$parsers.push(fromUser);
            }
        };
    };

    function floatOnly() {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModelCtrl) {
                element.on('keyup',function(e) {
                    if(element[0].value == " ") {
                        e.preventDefault();
                        element[0].value = '';
                    }
                });

                element.on('change',function(e) {
                    if(element[0].value == " ") {
                        e.preventDefault();
                        element[0].value = '';
                    }
                });

                function fromUser(text) {
                    if (text) {

                        text = text.split(' ').join('');
                        var arr = text.split('.');

                        if (arr.length == 1) {
                            var transformedInput = text.replace(/[^0-9]/g, '');
                            ngModelCtrl.$setViewValue( transformedInput);
                            ngModelCtrl.$render();
                            return  transformedInput;
                        }
                        else if (arr.length == 2 && arr[1].length <= 2) {
                            var tI1 = arr[0].replace(/[^0-9]/g, '');
                            var tI2 = arr[1].replace(/[^0-9]/g, '');
                            var tI = tI1 + '.' + tI2;

                            if (tI !== text) {
                                ngModelCtrl.$setViewValue(tI);
                                ngModelCtrl.$render();
                            }
                            return  tI;

                        }
                        else {

                            var tI1 = arr[0].replace(/[^0-9]/g, '');
                            var tI2 = arr[1].replace(/[^0-9]/g, '');
                            var tI = tI1 + '.' + tI2;

                            tI = parseFloat(tI).toFixed(2);

                            if (tI !== text) {
                                ngModelCtrl.$setViewValue( tI);
                                ngModelCtrl.$render();
                            }
                            return tI;
                        }

                    }
                    return text
                }
                ngModelCtrl.$parsers.push(fromUser);
            }
        };

    }

    function numbersOnlyDoller () {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModelCtrl) {

                function fromUser(text) {
                    if (text) {

                    text = text.split(' ').join('');
                        var arr = text.split('.');

                        if(arr.length == 1) {
                            var transformedInput = text.replace(/[^0-9]/g, '');
                            ngModelCtrl.$setViewValue('$'+transformedInput);
                            ngModelCtrl.$render();
                            return '$'+transformedInput;
                        }
                        else if(arr.length == 2 && arr[1].length <=2) {
                            var tI1 = arr[0].replace(/[^0-9]/g, '');
                            var tI2 = arr[1].replace(/[^0-9]/g, '');
                            var tI = tI1+'.'+tI2;

                            if (tI !== text) {
                                ngModelCtrl.$setViewValue('$'+tI);
                                ngModelCtrl.$render();
                            }
                            return '$'+tI;

                        }
                        else {

                            var tI1 = arr[0].replace(/[^0-9]/g, '');
                            var tI2 = arr[1].replace(/[^0-9]/g, '');
                            var tI = tI1+'.'+tI2;

                            tI = parseFloat(tI).toFixed(3);

                            if (tI !== text) {
                                ngModelCtrl.$setViewValue('$'+tI);
                                ngModelCtrl.$render();
                            }
                            return '$'+tI;
                        }


                    }
                    return text;
                }
                ngModelCtrl.$parsers.push(fromUser);
            }
        };
    };

  function myMaxlength() {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModelCtrl) {
                var maxlength = Number(attrs.myMaxlength);
                function fromUser(text) {
                    if (text.length > maxlength) {
                        var transformedInput = text.substring(0, maxlength);
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                        return transformedInput;
                    }
                    return text;
                }
                ngModelCtrl.$parsers.push(fromUser);
            }
        };
    };
})();
