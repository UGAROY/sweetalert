;(function(window, document, undefined) {
  "use strict";
  
  (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// SweetAlert
// 2014-2015 (c) - Tristan Edwards
// github.com/t4t5/sweetalert

/*
 * jQuery-like functions for manipulating the DOM
 */
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _modulesHandleDom = require('./modules/handle-dom');

/*
 * Handy utilities
 */

var _modulesUtils = require('./modules/utils');

/*
 *  Handle sweetAlert's DOM elements
 */

var _modulesHandleSwalDom = require('./modules/handle-swal-dom');

// Handle button events and keyboard events

var _modulesHandleClick = require('./modules/handle-click');

var _modulesHandleKey = require('./modules/handle-key');

var _modulesHandleKey2 = _interopRequireDefault(_modulesHandleKey);

// Default values

var _modulesDefaultParams = require('./modules/default-params');

var _modulesDefaultParams2 = _interopRequireDefault(_modulesDefaultParams);

var _modulesSetParams = require('./modules/set-params');

var _modulesSetParams2 = _interopRequireDefault(_modulesSetParams);

/*
 * Remember state in cases where opening and handling a modal will fiddle with it.
 * (We also use window.previousActiveElement as a global variable)
 */
var previousWindowKeyDown;
var lastFocusedButton;

/*
 * Global sweetAlert function
 * (this is what the user calls)
 */
var sweetAlert, swal;

sweetAlert = swal = function () {
  var customizations = arguments[0];

  (0, _modulesHandleSwalDom.resetInput)();

  /*
   * Use argument if defined or default value from params object otherwise.
   * Supports the case where a default value is boolean true and should be
   * overridden by a corresponding explicit argument which is boolean false.
   */
  function argumentOrDefault(key) {
    var args = customizations;
    return args[key] === undefined ? _modulesDefaultParams2['default'][key] : args[key];
  }

  if (customizations === undefined) {
    (0, _modulesUtils.logStr)('SweetAlert expects at least 1 attribute!');
    return false;
  }

  var params = (0, _modulesUtils.extend)({}, _modulesDefaultParams2['default']);

  switch (typeof customizations) {

    // Ex: swal("Hello", "Just testing", "info");
    case 'string':
      params.title = customizations;
      params.text = arguments[1] || '';
      params.type = arguments[2] || '';
      break;

    // Ex: swal({ title:"Hello", text: "Just testing", type: "info" });
    case 'object':
      if (customizations.title === undefined) {
        (0, _modulesUtils.logStr)('Missing "title" argument!');
        return false;
      }

      params.title = customizations.title;

      for (var customName in _modulesDefaultParams2['default']) {
        params[customName] = argumentOrDefault(customName);
      }

      // Show "Confirm" instead of "OK" if cancel button is visible
      params.confirmButtonText = params.showCancelButton ? 'Confirm' : _modulesDefaultParams2['default'].confirmButtonText;
      params.confirmButtonText = argumentOrDefault('confirmButtonText');

      // Callback function when clicking on "OK"/"Cancel"
      params.doneFunction = arguments[1] || null;

      break;

    default:
      (0, _modulesUtils.logStr)('Unexpected type of argument! Expected "string" or "object", got ' + typeof customizations);
      return false;

  }

  (0, _modulesSetParams2['default'])(params);
  (0, _modulesHandleSwalDom.fixVerticalPosition)();
  (0, _modulesHandleSwalDom.openModal)(arguments[1]);

  // Modal interactions
  var modal = (0, _modulesHandleSwalDom.getModal)();

  /*
   * Make sure all modal buttons respond to all events
   */
  var $buttons = modal.querySelectorAll('button');
  var buttonEvents = ['onclick', 'onmouseover', 'onmouseout', 'onmousedown', 'onmouseup', 'onfocus'];
  var onButtonEvent = function onButtonEvent(e) {
    return (0, _modulesHandleClick.handleButton)(e, params, modal);
  };

  for (var btnIndex = 0; btnIndex < $buttons.length; btnIndex++) {
    for (var evtIndex = 0; evtIndex < buttonEvents.length; evtIndex++) {
      var btnEvt = buttonEvents[evtIndex];
      $buttons[btnIndex][btnEvt] = onButtonEvent;
    }
  }

  // Clicking outside the modal dismisses it (if allowed by user)
  (0, _modulesHandleSwalDom.getOverlay)().onclick = onButtonEvent;

  previousWindowKeyDown = window.onkeydown;

  var onKeyEvent = function onKeyEvent(e) {
    return (0, _modulesHandleKey2['default'])(e, params, modal);
  };
  window.onkeydown = onKeyEvent;

  window.onfocus = function () {
    // When the user has focused away and focused back from the whole window.
    setTimeout(function () {
      // Put in a timeout to jump out of the event sequence.
      // Calling focus() in the event sequence confuses things.
      if (lastFocusedButton !== undefined) {
        lastFocusedButton.focus();
        lastFocusedButton = undefined;
      }
    }, 0);
  };

  // Show alert with enabled buttons always
  swal.enableButtons();
};

/*
 * Set default params for each popup
 * @param {Object} userParams
 */
sweetAlert.setDefaults = swal.setDefaults = function (userParams) {
  if (!userParams) {
    throw new Error('userParams is required');
  }
  if (typeof userParams !== 'object') {
    throw new Error('userParams has to be a object');
  }

  (0, _modulesUtils.extend)(_modulesDefaultParams2['default'], userParams);
};

/*
 * Animation when closing modal
 */
sweetAlert.close = swal.close = function () {
  var modal = (0, _modulesHandleSwalDom.getModal)();

  (0, _modulesHandleDom.fadeOut)((0, _modulesHandleSwalDom.getOverlay)(), 5);
  (0, _modulesHandleDom.fadeOut)(modal, 5);
  (0, _modulesHandleDom.removeClass)(modal, 'showSweetAlert');
  (0, _modulesHandleDom.addClass)(modal, 'hideSweetAlert');
  (0, _modulesHandleDom.removeClass)(modal, 'visible');

  /*
   * Reset icon animations
   */
  var $successIcon = modal.querySelector('.sa-icon.sa-success');
  (0, _modulesHandleDom.removeClass)($successIcon, 'animate');
  (0, _modulesHandleDom.removeClass)($successIcon.querySelector('.sa-tip'), 'animateSuccessTip');
  (0, _modulesHandleDom.removeClass)($successIcon.querySelector('.sa-long'), 'animateSuccessLong');

  var $errorIcon = modal.querySelector('.sa-icon.sa-error');
  (0, _modulesHandleDom.removeClass)($errorIcon, 'animateErrorIcon');
  (0, _modulesHandleDom.removeClass)($errorIcon.querySelector('.sa-x-mark'), 'animateXMark');

  var $warningIcon = modal.querySelector('.sa-icon.sa-warning');
  (0, _modulesHandleDom.removeClass)($warningIcon, 'pulseWarning');
  (0, _modulesHandleDom.removeClass)($warningIcon.querySelector('.sa-body'), 'pulseWarningIns');
  (0, _modulesHandleDom.removeClass)($warningIcon.querySelector('.sa-dot'), 'pulseWarningIns');

  // Reset custom class (delay so that UI changes aren't visible)
  setTimeout(function () {
    var customClass = modal.getAttribute('data-custom-class');
    (0, _modulesHandleDom.removeClass)(modal, customClass);
  }, 300);

  // Reset the page to its previous state
  window.onkeydown = previousWindowKeyDown;
  if (window.previousActiveElement) {
    window.previousActiveElement.focus();
  }
  lastFocusedButton = undefined;
  clearTimeout(modal.timeout);

  return true;
};

/*
 * Validation of the input field is done by user
 * If something is wrong => call showInputError with errorMessage
 */
sweetAlert.showInputError = swal.showInputError = function (errorMessage) {
  var modal = (0, _modulesHandleSwalDom.getModal)();

  var $errorIcon = modal.querySelector('.sa-input-error');
  (0, _modulesHandleDom.addClass)($errorIcon, 'show');

  var $errorContainer = modal.querySelector('.sa-error-container');
  (0, _modulesHandleDom.addClass)($errorContainer, 'show');

  $errorContainer.querySelector('p').innerHTML = errorMessage;

  setTimeout(function () {
    sweetAlert.enableButtons();
  }, 1);

  modal.querySelector('input').focus();
};

/*
 * Reset input error DOM elements
 */
sweetAlert.resetInputError = swal.resetInputError = function (event) {
  // If press enter => ignore
  if (event && event.keyCode === 13) {
    return false;
  }

  var $modal = (0, _modulesHandleSwalDom.getModal)();

  var $errorIcon = $modal.querySelector('.sa-input-error');
  (0, _modulesHandleDom.removeClass)($errorIcon, 'show');

  var $errorContainer = $modal.querySelector('.sa-error-container');
  (0, _modulesHandleDom.removeClass)($errorContainer, 'show');
};

/*
 * Disable confirm and cancel buttons
 */
sweetAlert.disableButtons = swal.disableButtons = function (event) {
  var modal = (0, _modulesHandleSwalDom.getModal)();
  var $confirmButton = modal.querySelector('button.confirm');
  var $cancelButton = modal.querySelector('button.cancel');
  $confirmButton.disabled = true;
  $cancelButton.disabled = true;
};

/*
 * Enable confirm and cancel buttons
 */
sweetAlert.enableButtons = swal.enableButtons = function (event) {
  var modal = (0, _modulesHandleSwalDom.getModal)();
  var $confirmButton = modal.querySelector('button.confirm');
  var $cancelButton = modal.querySelector('button.cancel');
  $confirmButton.disabled = false;
  $cancelButton.disabled = false;
};

if (typeof window !== 'undefined') {
  // The 'handle-click' module requires
  // that 'sweetAlert' was set as global.
  window.sweetAlert = window.swal = sweetAlert;
} else {
  (0, _modulesUtils.logStr)('SweetAlert is a frontend module!');
}

},{"./modules/default-params":2,"./modules/handle-click":3,"./modules/handle-dom":4,"./modules/handle-key":5,"./modules/handle-swal-dom":6,"./modules/set-params":8,"./modules/utils":9}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var defaultParams = {
  title: '',
  text: '',
  type: null,
  allowOutsideClick: false,
  showConfirmButton: true,
  showCancelButton: false,
  closeOnConfirm: true,
  closeOnCancel: true,
  confirmButtonText: 'OK',
  confirmButtonColor: '#8CD4F5',
  cancelButtonText: 'Cancel',
  imageUrl: null,
  imageSize: null,
  timer: null,
  customClass: '',
  html: false,
  animation: true,
  allowEscapeKey: true,
  inputType: 'text',
  inputPlaceholder: '',
  inputValue: '',
  showLoaderOnConfirm: false
};

exports['default'] = defaultParams;
module.exports = exports['default'];

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utils = require('./utils');

var _handleSwalDom = require('./handle-swal-dom');

var _handleDom = require('./handle-dom');

/*
 * User clicked on "Confirm"/"OK" or "Cancel"
 */
var handleButton = function handleButton(event, params, modal) {
  var e = event || window.event;
  var target = e.target || e.srcElement;

  var targetedConfirm = target.className.indexOf('confirm') !== -1;
  var targetedOverlay = target.className.indexOf('sweet-overlay') !== -1;
  var modalIsVisible = (0, _handleDom.hasClass)(modal, 'visible');
  var doneFunctionExists = params.doneFunction && modal.getAttribute('data-has-done-function') === 'true';

  // Since the user can change the background-color of the confirm button programmatically,
  // we must calculate what the color should be on hover/active
  var normalColor, hoverColor, activeColor;
  if (targetedConfirm && params.confirmButtonColor) {
    normalColor = params.confirmButtonColor;
    hoverColor = (0, _utils.colorLuminance)(normalColor, -0.04);
    activeColor = (0, _utils.colorLuminance)(normalColor, -0.14);
  }

  function shouldSetConfirmButtonColor(color) {
    if (targetedConfirm && params.confirmButtonColor) {
      target.style.backgroundColor = color;
    }
  }

  switch (e.type) {
    case 'mouseover':
      shouldSetConfirmButtonColor(hoverColor);
      break;

    case 'mouseout':
      shouldSetConfirmButtonColor(normalColor);
      break;

    case 'mousedown':
      shouldSetConfirmButtonColor(activeColor);
      break;

    case 'mouseup':
      shouldSetConfirmButtonColor(hoverColor);
      break;

    case 'focus':
      var $confirmButton = modal.querySelector('button.confirm');
      var $cancelButton = modal.querySelector('button.cancel');

      if (targetedConfirm) {
        $cancelButton.style.boxShadow = 'none';
      } else {
        $confirmButton.style.boxShadow = 'none';
      }
      break;

    case 'click':
      var clickedOnModal = modal === target;
      var clickedOnModalChild = (0, _handleDom.isDescendant)(modal, target);

      // Ignore click outside if allowOutsideClick is false
      if (!clickedOnModal && !clickedOnModalChild && modalIsVisible && !params.allowOutsideClick) {
        break;
      }

      if (targetedConfirm && doneFunctionExists && modalIsVisible) {
        handleConfirm(modal, params);
      } else if (doneFunctionExists && modalIsVisible || targetedOverlay) {
        handleCancel(modal, params);
      } else if ((0, _handleDom.isDescendant)(modal, target) && target.tagName === 'BUTTON') {
        sweetAlert.close();
      }
      break;
  }
};

/*
 *  User clicked on "Confirm"/"OK"
 */
var handleConfirm = function handleConfirm(modal, params) {
  var callbackValue = true;

  if ((0, _handleDom.hasClass)(modal, 'show-input')) {
    callbackValue = modal.querySelector('input').value;

    if (!callbackValue) {
      callbackValue = '';
    }
  }

  params.doneFunction(callbackValue);

  if (params.closeOnConfirm) {
    sweetAlert.close();
  }
  // Disable cancel and confirm button if the parameter is true
  if (params.showLoaderOnConfirm) {
    sweetAlert.disableButtons();
  }
};

/*
 *  User clicked on "Cancel"
 */
var handleCancel = function handleCancel(modal, params) {
  // Check if callback function expects a parameter (to track cancel actions)
  var functionAsStr = String(params.doneFunction).replace(/\s/g, '');
  var functionHandlesCancel = functionAsStr.substring(0, 9) === 'function(' && functionAsStr.substring(9, 10) !== ')';

  if (functionHandlesCancel) {
    params.doneFunction(false);
  }

  if (params.closeOnCancel) {
    sweetAlert.close();
  }
};

exports['default'] = {
  handleButton: handleButton,
  handleConfirm: handleConfirm,
  handleCancel: handleCancel
};
module.exports = exports['default'];

},{"./handle-dom":4,"./handle-swal-dom":6,"./utils":9}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var hasClass = function hasClass(elem, className) {
  return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
};

var addClass = function addClass(elem, className) {
  if (!hasClass(elem, className)) {
    elem.className += ' ' + className;
  }
};

var removeClass = function removeClass(elem, className) {
  var newClass = ' ' + elem.className.replace(/[\t\r\n]/g, ' ') + ' ';
  if (hasClass(elem, className)) {
    while (newClass.indexOf(' ' + className + ' ') >= 0) {
      newClass = newClass.replace(' ' + className + ' ', ' ');
    }
    elem.className = newClass.replace(/^\s+|\s+$/g, '');
  }
};

var escapeHtml = function escapeHtml(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};

var _show = function _show(elem) {
  elem.style.opacity = '';
  elem.style.display = 'block';
};

var show = function show(elems) {
  if (elems && !elems.length) {
    return _show(elems);
  }
  for (var i = 0; i < elems.length; ++i) {
    _show(elems[i]);
  }
};

var _hide = function _hide(elem) {
  elem.style.opacity = '';
  elem.style.display = 'none';
};

var hide = function hide(elems) {
  if (elems && !elems.length) {
    return _hide(elems);
  }
  for (var i = 0; i < elems.length; ++i) {
    _hide(elems[i]);
  }
};

var isDescendant = function isDescendant(parent, child) {
  var node = child.parentNode;
  while (node !== null) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
};

var getTopMargin = function getTopMargin(elem) {
  elem.style.left = '-9999px';
  elem.style.display = 'block';

  var height = elem.clientHeight,
      padding;
  if (typeof getComputedStyle !== "undefined") {
    // IE 8
    padding = parseInt(getComputedStyle(elem).getPropertyValue('padding-top'), 10);
  } else {
    padding = parseInt(elem.currentStyle.padding);
  }

  elem.style.left = '';
  elem.style.display = 'none';
  return '-' + parseInt((height + padding) / 2) + 'px';
};

var fadeIn = function fadeIn(elem, interval) {
  if (+elem.style.opacity < 1) {
    interval = interval || 16;
    elem.style.opacity = 0;
    elem.style.display = 'block';
    var last = +new Date();
    var tick = function tick() {
      elem.style.opacity = +elem.style.opacity + (new Date() - last) / 100;
      last = +new Date();

      if (+elem.style.opacity < 1) {
        setTimeout(tick, interval);
      }
    };
    tick();
  }
  elem.style.display = 'block'; //fallback IE8
};

var fadeOut = function fadeOut(elem, interval) {
  interval = interval || 16;
  elem.style.opacity = 1;
  var last = +new Date();
  var tick = function tick() {
    elem.style.opacity = +elem.style.opacity - (new Date() - last) / 100;
    last = +new Date();

    if (+elem.style.opacity > 0) {
      setTimeout(tick, interval);
    } else {
      elem.style.display = 'none';
    }
  };
  tick();
};

var fireClick = function fireClick(node) {
  // Taken from http://www.nonobtrusive.com/2011/11/29/programatically-fire-crossbrowser-click-event-with-javascript/
  // Then fixed for today's Chrome browser.
  if (typeof MouseEvent === 'function') {
    // Up-to-date approach
    var mevt = new MouseEvent('click', {
      view: window,
      bubbles: false,
      cancelable: true
    });
    node.dispatchEvent(mevt);
  } else if (document.createEvent) {
    // Fallback
    var evt = document.createEvent('MouseEvents');
    evt.initEvent('click', false, false);
    node.dispatchEvent(evt);
  } else if (document.createEventObject) {
    node.fireEvent('onclick');
  } else if (typeof node.onclick === 'function') {
    node.onclick();
  }
};

var stopEventPropagation = function stopEventPropagation(e) {
  // In particular, make sure the space bar doesn't scroll the main window.
  if (typeof e.stopPropagation === 'function') {
    e.stopPropagation();
    e.preventDefault();
  } else if (window.event && window.event.hasOwnProperty('cancelBubble')) {
    window.event.cancelBubble = true;
  }
};

exports.hasClass = hasClass;
exports.addClass = addClass;
exports.removeClass = removeClass;
exports.escapeHtml = escapeHtml;
exports._show = _show;
exports.show = show;
exports._hide = _hide;
exports.hide = hide;
exports.isDescendant = isDescendant;
exports.getTopMargin = getTopMargin;
exports.fadeIn = fadeIn;
exports.fadeOut = fadeOut;
exports.fireClick = fireClick;
exports.stopEventPropagation = stopEventPropagation;

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _handleDom = require('./handle-dom');

var _handleSwalDom = require('./handle-swal-dom');

var handleKeyDown = function handleKeyDown(event, params, modal) {
  var e = event || window.event;
  var keyCode = e.keyCode || e.which;

  var $okButton = modal.querySelector('button.confirm');
  var $cancelButton = modal.querySelector('button.cancel');
  var $modalButtons = modal.querySelectorAll('button[tabindex]');

  if ([9, 13, 32, 27].indexOf(keyCode) === -1) {
    // Don't do work on keys we don't care about.
    return;
  }

  var $targetElement = e.target || e.srcElement;

  var btnIndex = -1; // Find the button - note, this is a nodelist, not an array.
  for (var i = 0; i < $modalButtons.length; i++) {
    if ($targetElement === $modalButtons[i]) {
      btnIndex = i;
      break;
    }
  }

  if (keyCode === 9) {
    // TAB
    if (btnIndex === -1) {
      // No button focused. Jump to the confirm button.
      $targetElement = $okButton;
    } else {
      // Cycle to the next button
      if (btnIndex === $modalButtons.length - 1) {
        $targetElement = $modalButtons[0];
      } else {
        $targetElement = $modalButtons[btnIndex + 1];
      }
    }

    (0, _handleDom.stopEventPropagation)(e);
    $targetElement.focus();

    if (params.confirmButtonColor) {
      (0, _handleSwalDom.setFocusStyle)($targetElement, params.confirmButtonColor);
    }
  } else {
    if (keyCode === 13) {
      if ($targetElement.tagName === 'INPUT') {
        $targetElement = $okButton;
        $okButton.focus();
      }

      if (btnIndex === -1) {
        // ENTER/SPACE clicked outside of a button.
        $targetElement = $okButton;
      } else {
        // Do nothing - let the browser handle it.
        $targetElement = undefined;
      }
    } else if (keyCode === 27 && params.allowEscapeKey === true) {
      $targetElement = $cancelButton;
      (0, _handleDom.fireClick)($targetElement, e);
    } else {
      // Fallback - let the browser handle it.
      $targetElement = undefined;
    }
  }
};

exports['default'] = handleKeyDown;
module.exports = exports['default'];

},{"./handle-dom":4,"./handle-swal-dom":6}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = require('./utils');

var _handleDom = require('./handle-dom');

var _defaultParams = require('./default-params');

var _defaultParams2 = _interopRequireDefault(_defaultParams);

/*
 * Add modal + overlay to DOM
 */

var _injectedHtml = require('./injected-html');

var _injectedHtml2 = _interopRequireDefault(_injectedHtml);

var modalClass = '.sweet-alert';
var overlayClass = '.sweet-overlay';

var sweetAlertInitialize = function sweetAlertInitialize() {
  var sweetWrap = document.createElement('div');
  sweetWrap.innerHTML = _injectedHtml2['default'];

  // Append elements to body
  while (sweetWrap.firstChild) {
    document.body.appendChild(sweetWrap.firstChild);
  }
};

/*
 * Get DOM element of modal
 */
var getModal = function getModal() {
  var $modal = document.querySelector(modalClass);

  if (!$modal) {
    sweetAlertInitialize();
    $modal = getModal();
  }

  return $modal;
};

/*
 * Get DOM element of input (in modal)
 */
var getInput = function getInput() {
  var $modal = getModal();
  if ($modal) {
    return $modal.querySelector('input');
  }
};

/*
 * Get DOM element of overlay
 */
var getOverlay = function getOverlay() {
  return document.querySelector(overlayClass);
};

/*
 * Add box-shadow style to button (depending on its chosen bg-color)
 */
var setFocusStyle = function setFocusStyle($button, bgColor) {
  var rgbColor = (0, _utils.hexToRgb)(bgColor);
  $button.style.boxShadow = '0 0 2px rgba(' + rgbColor + ', 0.8), inset 0 0 0 1px rgba(0, 0, 0, 0.05)';
};

/*
 * Animation when opening modal
 */
var openModal = function openModal(callback) {
  var $modal = getModal();
  (0, _handleDom.fadeIn)(getOverlay(), 10);
  (0, _handleDom.show)($modal);
  (0, _handleDom.addClass)($modal, 'showSweetAlert');
  (0, _handleDom.removeClass)($modal, 'hideSweetAlert');

  window.previousActiveElement = document.activeElement;
  var $okButton = $modal.querySelector('button.confirm');
  $okButton.focus();

  setTimeout(function () {
    (0, _handleDom.addClass)($modal, 'visible');
  }, 500);

  var timer = $modal.getAttribute('data-timer');

  if (timer !== 'null' && timer !== '') {
    var timerCallback = callback;
    $modal.timeout = setTimeout(function () {
      var doneFunctionExists = (timerCallback || null) && $modal.getAttribute('data-has-done-function') === 'true';
      if (doneFunctionExists) {
        timerCallback(null);
      } else {
        sweetAlert.close();
      }
    }, timer);
  }
};

/*
 * Reset the styling of the input
 * (for example if errors have been shown)
 */
var resetInput = function resetInput() {
  var $modal = getModal();
  var $input = getInput();

  (0, _handleDom.removeClass)($modal, 'show-input');
  $input.value = _defaultParams2['default'].inputValue;
  $input.setAttribute('type', _defaultParams2['default'].inputType);
  $input.setAttribute('placeholder', _defaultParams2['default'].inputPlaceholder);

  resetInputError();
};

var resetInputError = function resetInputError(event) {
  // If press enter => ignore
  if (event && event.keyCode === 13) {
    return false;
  }

  var $modal = getModal();

  var $errorIcon = $modal.querySelector('.sa-input-error');
  (0, _handleDom.removeClass)($errorIcon, 'show');

  var $errorContainer = $modal.querySelector('.sa-error-container');
  (0, _handleDom.removeClass)($errorContainer, 'show');
};

/*
 * Set "margin-top"-property on modal based on its computed height
 */
var fixVerticalPosition = function fixVerticalPosition() {
  var $modal = getModal();
  $modal.style.marginTop = (0, _handleDom.getTopMargin)(getModal());
};

exports.sweetAlertInitialize = sweetAlertInitialize;
exports.getModal = getModal;
exports.getOverlay = getOverlay;
exports.getInput = getInput;
exports.setFocusStyle = setFocusStyle;
exports.openModal = openModal;
exports.resetInput = resetInput;
exports.resetInputError = resetInputError;
exports.fixVerticalPosition = fixVerticalPosition;

},{"./default-params":2,"./handle-dom":4,"./injected-html":7,"./utils":9}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var injectedHTML =

// Dark overlay
"<div class=\"sweet-overlay\" tabIndex=\"-1\"></div>" +

// Modal
"<div class=\"sweet-alert\">" +

// Error icon
"<div class=\"sa-icon sa-error\">\n      <span class=\"sa-x-mark\">\n        <span class=\"sa-line sa-left\"></span>\n        <span class=\"sa-line sa-right\"></span>\n      </span>\n    </div>" +

// Warning icon
"<div class=\"sa-icon sa-warning\">\n      <span class=\"sa-body\"></span>\n      <span class=\"sa-dot\"></span>\n    </div>" +

// Info icon
"<div class=\"sa-icon sa-info\"></div>" +

// Success icon
"<div class=\"sa-icon sa-success\">\n      <span class=\"sa-line sa-tip\"></span>\n      <span class=\"sa-line sa-long\"></span>\n\n      <div class=\"sa-placeholder\"></div>\n      <div class=\"sa-fix\"></div>\n    </div>" + "<div class=\"sa-icon sa-custom\"></div>" +

// Title, text and input
"<h2>Title</h2>\n    <p>Text</p>\n    <fieldset>\n      <input type=\"text\" tabIndex=\"3\" />\n      <div class=\"sa-input-error\"></div>\n    </fieldset>" +

// Input errors
"<div class=\"sa-error-container\">\n      <div class=\"icon\">!</div>\n      <p>Not valid!</p>\n    </div>" +

// Cancel and confirm buttons
"<div class=\"sa-button-container\">\n      <button class=\"cancel\" tabIndex=\"2\">Cancel</button>\n      <div class=\"sa-confirm-button-container\">\n        <button class=\"confirm\" tabIndex=\"1\">OK</button>" +

// Loading animation
"<div class=\"la-ball-fall\">\n          <div></div>\n          <div></div>\n          <div></div>\n        </div>\n      </div>\n    </div>" +

// End of modal
"</div>";

exports["default"] = injectedHTML;
module.exports = exports["default"];

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utils = require('./utils');

var _handleSwalDom = require('./handle-swal-dom');

var _handleDom = require('./handle-dom');

/*
 * Set type, text and actions on modal
 */
var alertTypes = ['error', 'warning', 'info', 'success', 'input', 'prompt'];

var setParameters = function setParameters(params) {
  var modal = (0, _handleSwalDom.getModal)();

  var $title = modal.querySelector('h2');
  var $text = modal.querySelector('p');
  var $cancelBtn = modal.querySelector('button.cancel');
  var $confirmBtn = modal.querySelector('button.confirm');

  /*
   * Title
   */
  $title.innerHTML = params.html ? params.title : (0, _handleDom.escapeHtml)(params.title).split('\n').join('<br>');

  /*
   * Text
   */
  $text.innerHTML = params.html ? params.text : (0, _handleDom.escapeHtml)(params.text || '').split('\n').join('<br>');
  if (params.text) (0, _handleDom.show)($text);

  /*
   * Custom class
   */
  if (params.customClass) {
    (0, _handleDom.addClass)(modal, params.customClass);
    modal.setAttribute('data-custom-class', params.customClass);
  } else {
    // Find previously set classes and remove them
    var customClass = modal.getAttribute('data-custom-class');
    (0, _handleDom.removeClass)(modal, customClass);
    modal.setAttribute('data-custom-class', '');
  }

  /*
   * Icon
   */
  (0, _handleDom.hide)(modal.querySelectorAll('.sa-icon'));

  if (params.type && !(0, _utils.isIE8)()) {
    var _ret = (function () {

      var validType = false;

      for (var i = 0; i < alertTypes.length; i++) {
        if (params.type === alertTypes[i]) {
          validType = true;
          break;
        }
      }

      if (!validType) {
        logStr('Unknown alert type: ' + params.type);
        return {
          v: false
        };
      }

      var typesWithIcons = ['success', 'error', 'warning', 'info'];
      var $icon = undefined;

      if (typesWithIcons.indexOf(params.type) !== -1) {
        $icon = modal.querySelector('.sa-icon.' + 'sa-' + params.type);
        (0, _handleDom.show)($icon);
      }

      var $input = (0, _handleSwalDom.getInput)();

      // Animate icon
      switch (params.type) {

        case 'success':
          (0, _handleDom.addClass)($icon, 'animate');
          (0, _handleDom.addClass)($icon.querySelector('.sa-tip'), 'animateSuccessTip');
          (0, _handleDom.addClass)($icon.querySelector('.sa-long'), 'animateSuccessLong');
          break;

        case 'error':
          (0, _handleDom.addClass)($icon, 'animateErrorIcon');
          (0, _handleDom.addClass)($icon.querySelector('.sa-x-mark'), 'animateXMark');
          break;

        case 'warning':
          (0, _handleDom.addClass)($icon, 'pulseWarning');
          (0, _handleDom.addClass)($icon.querySelector('.sa-body'), 'pulseWarningIns');
          (0, _handleDom.addClass)($icon.querySelector('.sa-dot'), 'pulseWarningIns');
          break;

        case 'input':
        case 'prompt':
          $input.setAttribute('type', params.inputType);
          $input.value = params.inputValue;
          $input.setAttribute('placeholder', params.inputPlaceholder);
          (0, _handleDom.addClass)(modal, 'show-input');
          setTimeout(function () {
            $input.focus();
            $input.addEventListener('keyup', swal.resetInputError);
          }, 400);
          break;
      }
    })();

    if (typeof _ret === 'object') return _ret.v;
  }

  /*
   * Custom image
   */
  if (params.imageUrl) {
    var $customIcon = modal.querySelector('.sa-icon.sa-custom');

    $customIcon.style.backgroundImage = 'url(' + params.imageUrl + ')';
    (0, _handleDom.show)($customIcon);

    var _imgWidth = 80;
    var _imgHeight = 80;

    if (params.imageSize) {
      var dimensions = params.imageSize.toString().split('x');
      var imgWidth = dimensions[0];
      var imgHeight = dimensions[1];

      if (!imgWidth || !imgHeight) {
        logStr('Parameter imageSize expects value with format WIDTHxHEIGHT, got ' + params.imageSize);
      } else {
        _imgWidth = imgWidth;
        _imgHeight = imgHeight;
      }
    }

    $customIcon.setAttribute('style', $customIcon.getAttribute('style') + 'width:' + _imgWidth + 'px; height:' + _imgHeight + 'px');
  }

  /*
   * Show cancel button?
   */
  modal.setAttribute('data-has-cancel-button', params.showCancelButton);
  if (params.showCancelButton) {
    $cancelBtn.style.display = 'inline-block';
  } else {
    (0, _handleDom.hide)($cancelBtn);
  }

  /*
   * Show confirm button?
   */
  modal.setAttribute('data-has-confirm-button', params.showConfirmButton);
  if (params.showConfirmButton) {
    $confirmBtn.style.display = 'inline-block';
  } else {
    (0, _handleDom.hide)($confirmBtn);
  }

  /*
   * Custom text on cancel/confirm buttons
   */
  if (params.cancelButtonText) {
    $cancelBtn.innerHTML = (0, _handleDom.escapeHtml)(params.cancelButtonText);
  }
  if (params.confirmButtonText) {
    $confirmBtn.innerHTML = (0, _handleDom.escapeHtml)(params.confirmButtonText);
  }

  /*
   * Custom color on confirm button
   */
  if (params.confirmButtonColor) {
    // Set confirm button to selected background color
    $confirmBtn.style.backgroundColor = params.confirmButtonColor;

    // Set the confirm button color to the loading ring
    $confirmBtn.style.borderLeftColor = params.confirmLoadingButtonColor;
    $confirmBtn.style.borderRightColor = params.confirmLoadingButtonColor;

    // Set box-shadow to default focused button
    (0, _handleSwalDom.setFocusStyle)($confirmBtn, params.confirmButtonColor);
  }

  /*
   * Allow outside click
   */
  modal.setAttribute('data-allow-outside-click', params.allowOutsideClick);

  /*
   * Callback function
   */
  var hasDoneFunction = params.doneFunction ? true : false;
  modal.setAttribute('data-has-done-function', hasDoneFunction);

  /*
   * Animation
   */
  if (!params.animation) {
    modal.setAttribute('data-animation', 'none');
  } else if (typeof params.animation === 'string') {
    modal.setAttribute('data-animation', params.animation); // Custom animation
  } else {
      modal.setAttribute('data-animation', 'pop');
    }

  /*
   * Timer
   */
  modal.setAttribute('data-timer', params.timer);
};

exports['default'] = setParameters;
module.exports = exports['default'];

},{"./handle-dom":4,"./handle-swal-dom":6,"./utils":9}],9:[function(require,module,exports){
/*
 * Allow user to pass their own params
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var extend = function extend(a, b) {
  for (var key in b) {
    if (b.hasOwnProperty(key)) {
      a[key] = b[key];
    }
  }
  return a;
};

/*
 * Convert HEX codes to RGB values (#000000 -> rgb(0,0,0))
 */
var hexToRgb = function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16) : null;
};

/*
 * Check if the user is using Internet Explorer 8 (for fallbacks)
 */
var isIE8 = function isIE8() {
  return window.attachEvent && !window.addEventListener;
};

/*
 * IE compatible logging for developers
 */
var logStr = function logStr(string) {
  if (window.console) {
    // IE...
    window.console.log('SweetAlert: ' + string);
  }
};

/*
 * Set hover, active and focus-states for buttons 
 * (source: http://www.sitepoint.com/javascript-generate-lighter-darker-color)
 */
var colorLuminance = function colorLuminance(hex, lum) {
  // Validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, '');
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  lum = lum || 0;

  // Convert to decimal and change luminosity
  var rgb = '#';
  var c;
  var i;

  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
    rgb += ('00' + c).substr(c.length);
  }

  return rgb;
};

exports.extend = extend;
exports.hexToRgb = hexToRgb;
exports.isIE8 = isIE8;
exports.logStr = logStr;
exports.colorLuminance = colorLuminance;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjOi9Vc2Vycy95bHVvLlRTUy9Eb2N1bWVudHMvc3dlZXRhbGVydC9kZXYvc3dlZXRhbGVydC5lczYuanMiLCJjOi9Vc2Vycy95bHVvLlRTUy9Eb2N1bWVudHMvc3dlZXRhbGVydC9kZXYvbW9kdWxlcy9kZWZhdWx0LXBhcmFtcy5qcyIsImM6L1VzZXJzL3lsdW8uVFNTL0RvY3VtZW50cy9zd2VldGFsZXJ0L2Rldi9tb2R1bGVzL2hhbmRsZS1jbGljay5qcyIsImM6L1VzZXJzL3lsdW8uVFNTL0RvY3VtZW50cy9zd2VldGFsZXJ0L2Rldi9tb2R1bGVzL2hhbmRsZS1kb20uanMiLCJjOi9Vc2Vycy95bHVvLlRTUy9Eb2N1bWVudHMvc3dlZXRhbGVydC9kZXYvbW9kdWxlcy9oYW5kbGUta2V5LmpzIiwiYzovVXNlcnMveWx1by5UU1MvRG9jdW1lbnRzL3N3ZWV0YWxlcnQvZGV2L21vZHVsZXMvaGFuZGxlLXN3YWwtZG9tLmpzIiwiYzovVXNlcnMveWx1by5UU1MvRG9jdW1lbnRzL3N3ZWV0YWxlcnQvZGV2L21vZHVsZXMvaW5qZWN0ZWQtaHRtbC5qcyIsImM6L1VzZXJzL3lsdW8uVFNTL0RvY3VtZW50cy9zd2VldGFsZXJ0L2Rldi9tb2R1bGVzL3NldC1wYXJhbXMuanMiLCJjOi9Vc2Vycy95bHVvLlRTUy9Eb2N1bWVudHMvc3dlZXRhbGVydC9kZXYvbW9kdWxlcy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7O2dDQ2dCTyxzQkFBc0I7Ozs7Ozs0QkFXdEIsaUJBQWlCOzs7Ozs7b0NBY2pCLDJCQUEyQjs7OztrQ0FJd0Isd0JBQXdCOztnQ0FDeEQsc0JBQXNCOzs7Ozs7b0NBSXRCLDBCQUEwQjs7OztnQ0FDMUIsc0JBQXNCOzs7Ozs7OztBQU1oRCxJQUFJLHFCQUFxQixDQUFDO0FBQzFCLElBQUksaUJB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LFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkMsS0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3JFLE9BQUcsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUEsQ0FBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQ3BDOztBQUVELFNBQU8sR0FBRyxDQUFDO0NBQ1osQ0FBQzs7UUFJQSxNQUFNLEdBQU4sTUFBTTtRQUNOLFFBQVEsR0FBUixRQUFRO1FBQ1IsS0FBSyxHQUFMLEtBQUs7UUFDTCxNQUFNLEdBQU4sTUFBTTtRQUNOLGNBQWMsR0FBZCxjQUFjIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIFN3ZWV0QWxlcnRcclxuLy8gMjAxNC0yMDE1IChjKSAtIFRyaXN0YW4gRWR3YXJkc1xyXG4vLyBnaXRodWIuY29tL3Q0dDUvc3dlZXRhbGVydFxyXG5cclxuLypcclxuICogalF1ZXJ5LWxpa2UgZnVuY3Rpb25zIGZvciBtYW5pcHVsYXRpbmcgdGhlIERPTVxyXG4gKi9cclxuaW1wb3J0IHtcclxuICBoYXNDbGFzcywgYWRkQ2xhc3MsIHJlbW92ZUNsYXNzLFxyXG4gIGVzY2FwZUh0bWwsXHJcbiAgX3Nob3csIHNob3csIF9oaWRlLCBoaWRlLFxyXG4gIGlzRGVzY2VuZGFudCxcclxuICBnZXRUb3BNYXJnaW4sXHJcbiAgZmFkZUluLCBmYWRlT3V0LFxyXG4gIGZpcmVDbGljayxcclxuICBzdG9wRXZlbnRQcm9wYWdhdGlvblxyXG59IGZyb20gJy4vbW9kdWxlcy9oYW5kbGUtZG9tJztcclxuXHJcbi8qXHJcbiAqIEhhbmR5IHV0aWxpdGllc1xyXG4gKi9cclxuaW1wb3J0IHtcclxuICBleHRlbmQsXHJcbiAgaGV4VG9SZ2IsXHJcbiAgaXNJRTgsXHJcbiAgbG9nU3RyLFxyXG4gIGNvbG9yTHVtaW5hbmNlXHJcbn0gZnJvbSAnLi9tb2R1bGVzL3V0aWxzJztcclxuXHJcbi8qXHJcbiAqICBIYW5kbGUgc3dlZXRBbGVydCdzIERPTSBlbGVtZW50c1xyXG4gKi9cclxuaW1wb3J0IHtcclxuICBzd2VldEFsZXJ0SW5pdGlhbGl6ZSxcclxuICBnZXRNb2RhbCxcclxuICBnZXRPdmVybGF5LFxyXG4gIGdldElucHV0LFxyXG4gIHNldEZvY3VzU3R5bGUsXHJcbiAgb3Blbk1vZGFsLFxyXG4gIHJlc2V0SW5wdXQsXHJcbiAgZml4VmVydGljYWxQb3NpdGlvblxyXG59IGZyb20gJy4vbW9kdWxlcy9oYW5kbGUtc3dhbC1kb20nO1xyXG5cclxuXHJcbi8vIEhhbmRsZSBidXR0b24gZXZlbnRzIGFuZCBrZXlib2FyZCBldmVudHNcclxuaW1wb3J0IHsgaGFuZGxlQnV0dG9uLCBoYW5kbGVDb25maXJtLCBoYW5kbGVDYW5jZWwgfSBmcm9tICcuL21vZHVsZXMvaGFuZGxlLWNsaWNrJztcclxuaW1wb3J0IGhhbmRsZUtleURvd24gZnJvbSAnLi9tb2R1bGVzL2hhbmRsZS1rZXknO1xyXG5cclxuXHJcbi8vIERlZmF1bHQgdmFsdWVzXHJcbmltcG9ydCBkZWZhdWx0UGFyYW1zIGZyb20gJy4vbW9kdWxlcy9kZWZhdWx0LXBhcmFtcyc7XHJcbmltcG9ydCBzZXRQYXJhbWV0ZXJzIGZyb20gJy4vbW9kdWxlcy9zZXQtcGFyYW1zJztcclxuXHJcbi8qXHJcbiAqIFJlbWVtYmVyIHN0YXRlIGluIGNhc2VzIHdoZXJlIG9wZW5pbmcgYW5kIGhhbmRsaW5nIGEgbW9kYWwgd2lsbCBmaWRkbGUgd2l0aCBpdC5cclxuICogKFdlIGFsc28gdXNlIHdpbmRvdy5wcmV2aW91c0FjdGl2ZUVsZW1lbnQgYXMgYSBnbG9iYWwgdmFyaWFibGUpXHJcbiAqL1xyXG52YXIgcHJldmlvdXNXaW5kb3dLZXlEb3duO1xyXG52YXIgbGFzdEZvY3VzZWRCdXR0b247XHJcblxyXG5cclxuLypcclxuICogR2xvYmFsIHN3ZWV0QWxlcnQgZnVuY3Rpb25cclxuICogKHRoaXMgaXMgd2hhdCB0aGUgdXNlciBjYWxscylcclxuICovXHJcbnZhciBzd2VldEFsZXJ0LCBzd2FsO1xyXG5cclxuc3dlZXRBbGVydCA9IHN3YWwgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgY3VzdG9taXphdGlvbnMgPSBhcmd1bWVudHNbMF07XHJcblxyXG4gIHJlc2V0SW5wdXQoKTtcclxuXHJcbiAgLypcclxuICAgKiBVc2UgYXJndW1lbnQgaWYgZGVmaW5lZCBvciBkZWZhdWx0IHZhbHVlIGZyb20gcGFyYW1zIG9iamVjdCBvdGhlcndpc2UuXHJcbiAgICogU3VwcG9ydHMgdGhlIGNhc2Ugd2hlcmUgYSBkZWZhdWx0IHZhbHVlIGlzIGJvb2xlYW4gdHJ1ZSBhbmQgc2hvdWxkIGJlXHJcbiAgICogb3ZlcnJpZGRlbiBieSBhIGNvcnJlc3BvbmRpbmcgZXhwbGljaXQgYXJndW1lbnQgd2hpY2ggaXMgYm9vbGVhbiBmYWxzZS5cclxuICAgKi9cclxuICBmdW5jdGlvbiBhcmd1bWVudE9yRGVmYXVsdChrZXkpIHtcclxuICAgIHZhciBhcmdzID0gY3VzdG9taXphdGlvbnM7XHJcbiAgICByZXR1cm4gKGFyZ3Nba2V5XSA9PT0gdW5kZWZpbmVkKSA/ICBkZWZhdWx0UGFyYW1zW2tleV0gOiBhcmdzW2tleV07XHJcbiAgfVxyXG5cclxuICBpZiAoY3VzdG9taXphdGlvbnMgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgbG9nU3RyKCdTd2VldEFsZXJ0IGV4cGVjdHMgYXQgbGVhc3QgMSBhdHRyaWJ1dGUhJyk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICB2YXIgcGFyYW1zID0gZXh0ZW5kKHt9LCBkZWZhdWx0UGFyYW1zKTtcclxuXHJcbiAgc3dpdGNoICh0eXBlb2YgY3VzdG9taXphdGlvbnMpIHtcclxuXHJcbiAgICAvLyBFeDogc3dhbChcIkhlbGxvXCIsIFwiSnVzdCB0ZXN0aW5nXCIsIFwiaW5mb1wiKTtcclxuICAgIGNhc2UgJ3N0cmluZyc6XHJcbiAgICAgIHBhcmFtcy50aXRsZSA9IGN1c3RvbWl6YXRpb25zO1xyXG4gICAgICBwYXJhbXMudGV4dCAgPSBhcmd1bWVudHNbMV0gfHwgJyc7XHJcbiAgICAgIHBhcmFtcy50eXBlICA9IGFyZ3VtZW50c1syXSB8fCAnJztcclxuICAgICAgYnJlYWs7XHJcblxyXG4gICAgLy8gRXg6IHN3YWwoeyB0aXRsZTpcIkhlbGxvXCIsIHRleHQ6IFwiSnVzdCB0ZXN0aW5nXCIsIHR5cGU6IFwiaW5mb1wiIH0pO1xyXG4gICAgY2FzZSAnb2JqZWN0JzpcclxuICAgICAgaWYgKGN1c3RvbWl6YXRpb25zLnRpdGxlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBsb2dTdHIoJ01pc3NpbmcgXCJ0aXRsZVwiIGFyZ3VtZW50IScpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcGFyYW1zLnRpdGxlID0gY3VzdG9taXphdGlvbnMudGl0bGU7XHJcblxyXG4gICAgICBmb3IgKGxldCBjdXN0b21OYW1lIGluIGRlZmF1bHRQYXJhbXMpIHtcclxuICAgICAgICBwYXJhbXNbY3VzdG9tTmFtZV0gPSBhcmd1bWVudE9yRGVmYXVsdChjdXN0b21OYW1lKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2hvdyBcIkNvbmZpcm1cIiBpbnN0ZWFkIG9mIFwiT0tcIiBpZiBjYW5jZWwgYnV0dG9uIGlzIHZpc2libGVcclxuICAgICAgcGFyYW1zLmNvbmZpcm1CdXR0b25UZXh0ID0gcGFyYW1zLnNob3dDYW5jZWxCdXR0b24gPyAnQ29uZmlybScgOiBkZWZhdWx0UGFyYW1zLmNvbmZpcm1CdXR0b25UZXh0O1xyXG4gICAgICBwYXJhbXMuY29uZmlybUJ1dHRvblRleHQgPSBhcmd1bWVudE9yRGVmYXVsdCgnY29uZmlybUJ1dHRvblRleHQnKTtcclxuXHJcbiAgICAgIC8vIENhbGxiYWNrIGZ1bmN0aW9uIHdoZW4gY2xpY2tpbmcgb24gXCJPS1wiL1wiQ2FuY2VsXCJcclxuICAgICAgcGFyYW1zLmRvbmVGdW5jdGlvbiA9IGFyZ3VtZW50c1sxXSB8fCBudWxsO1xyXG5cclxuICAgICAgYnJlYWs7XHJcblxyXG4gICAgZGVmYXVsdDpcclxuICAgICAgbG9nU3RyKCdVbmV4cGVjdGVkIHR5cGUgb2YgYXJndW1lbnQhIEV4cGVjdGVkIFwic3RyaW5nXCIgb3IgXCJvYmplY3RcIiwgZ290ICcgKyB0eXBlb2YgY3VzdG9taXphdGlvbnMpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gIH1cclxuXHJcbiAgc2V0UGFyYW1ldGVycyhwYXJhbXMpO1xyXG4gIGZpeFZlcnRpY2FsUG9zaXRpb24oKTtcclxuICBvcGVuTW9kYWwoYXJndW1lbnRzWzFdKTtcclxuXHJcbiAgLy8gTW9kYWwgaW50ZXJhY3Rpb25zXHJcbiAgdmFyIG1vZGFsID0gZ2V0TW9kYWwoKTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogTWFrZSBzdXJlIGFsbCBtb2RhbCBidXR0b25zIHJlc3BvbmQgdG8gYWxsIGV2ZW50c1xyXG4gICAqL1xyXG4gIHZhciAkYnV0dG9ucyA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbicpO1xyXG4gIHZhciBidXR0b25FdmVudHMgPSBbJ29uY2xpY2snLCAnb25tb3VzZW92ZXInLCAnb25tb3VzZW91dCcsICdvbm1vdXNlZG93bicsICdvbm1vdXNldXAnLCAnb25mb2N1cyddO1xyXG4gIHZhciBvbkJ1dHRvbkV2ZW50ID0gKGUpID0+IGhhbmRsZUJ1dHRvbihlLCBwYXJhbXMsIG1vZGFsKTtcclxuXHJcbiAgZm9yIChsZXQgYnRuSW5kZXggPSAwOyBidG5JbmRleCA8ICRidXR0b25zLmxlbmd0aDsgYnRuSW5kZXgrKykge1xyXG4gICAgZm9yIChsZXQgZXZ0SW5kZXggPSAwOyBldnRJbmRleCA8IGJ1dHRvbkV2ZW50cy5sZW5ndGg7IGV2dEluZGV4KyspIHtcclxuICAgICAgbGV0IGJ0bkV2dCA9IGJ1dHRvbkV2ZW50c1tldnRJbmRleF07XHJcbiAgICAgICRidXR0b25zW2J0bkluZGV4XVtidG5FdnRdID0gb25CdXR0b25FdmVudDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIENsaWNraW5nIG91dHNpZGUgdGhlIG1vZGFsIGRpc21pc3NlcyBpdCAoaWYgYWxsb3dlZCBieSB1c2VyKVxyXG4gIGdldE92ZXJsYXkoKS5vbmNsaWNrID0gb25CdXR0b25FdmVudDtcclxuXHJcbiAgcHJldmlvdXNXaW5kb3dLZXlEb3duID0gd2luZG93Lm9ua2V5ZG93bjtcclxuXHJcbiAgdmFyIG9uS2V5RXZlbnQgPSAoZSkgPT4gaGFuZGxlS2V5RG93bihlLCBwYXJhbXMsIG1vZGFsKTtcclxuICB3aW5kb3cub25rZXlkb3duID0gb25LZXlFdmVudDtcclxuXHJcbiAgd2luZG93Lm9uZm9jdXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyBXaGVuIHRoZSB1c2VyIGhhcyBmb2N1c2VkIGF3YXkgYW5kIGZvY3VzZWQgYmFjayBmcm9tIHRoZSB3aG9sZSB3aW5kb3cuXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgLy8gUHV0IGluIGEgdGltZW91dCB0byBqdW1wIG91dCBvZiB0aGUgZXZlbnQgc2VxdWVuY2UuXHJcbiAgICAgIC8vIENhbGxpbmcgZm9jdXMoKSBpbiB0aGUgZXZlbnQgc2VxdWVuY2UgY29uZnVzZXMgdGhpbmdzLlxyXG4gICAgICBpZiAobGFzdEZvY3VzZWRCdXR0b24gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGxhc3RGb2N1c2VkQnV0dG9uLmZvY3VzKCk7XHJcbiAgICAgICAgbGFzdEZvY3VzZWRCdXR0b24gPSB1bmRlZmluZWQ7XHJcbiAgICAgIH1cclxuICAgIH0sIDApO1xyXG4gIH07XHJcbiAgXHJcbiAgLy8gU2hvdyBhbGVydCB3aXRoIGVuYWJsZWQgYnV0dG9ucyBhbHdheXNcclxuICBzd2FsLmVuYWJsZUJ1dHRvbnMoKTtcclxufTtcclxuXHJcblxyXG5cclxuLypcclxuICogU2V0IGRlZmF1bHQgcGFyYW1zIGZvciBlYWNoIHBvcHVwXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSB1c2VyUGFyYW1zXHJcbiAqL1xyXG5zd2VldEFsZXJ0LnNldERlZmF1bHRzID0gc3dhbC5zZXREZWZhdWx0cyA9IGZ1bmN0aW9uKHVzZXJQYXJhbXMpIHtcclxuICBpZiAoIXVzZXJQYXJhbXMpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcigndXNlclBhcmFtcyBpcyByZXF1aXJlZCcpO1xyXG4gIH1cclxuICBpZiAodHlwZW9mIHVzZXJQYXJhbXMgIT09ICdvYmplY3QnKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VzZXJQYXJhbXMgaGFzIHRvIGJlIGEgb2JqZWN0Jyk7XHJcbiAgfVxyXG5cclxuICBleHRlbmQoZGVmYXVsdFBhcmFtcywgdXNlclBhcmFtcyk7XHJcbn07XHJcblxyXG5cclxuLypcclxuICogQW5pbWF0aW9uIHdoZW4gY2xvc2luZyBtb2RhbFxyXG4gKi9cclxuc3dlZXRBbGVydC5jbG9zZSA9IHN3YWwuY2xvc2UgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgbW9kYWwgPSBnZXRNb2RhbCgpO1xyXG5cclxuICBmYWRlT3V0KGdldE92ZXJsYXkoKSwgNSk7XHJcbiAgZmFkZU91dChtb2RhbCwgNSk7XHJcbiAgcmVtb3ZlQ2xhc3MobW9kYWwsICdzaG93U3dlZXRBbGVydCcpO1xyXG4gIGFkZENsYXNzKG1vZGFsLCAnaGlkZVN3ZWV0QWxlcnQnKTtcclxuICByZW1vdmVDbGFzcyhtb2RhbCwgJ3Zpc2libGUnKTtcclxuXHJcbiAgLypcclxuICAgKiBSZXNldCBpY29uIGFuaW1hdGlvbnNcclxuICAgKi9cclxuICB2YXIgJHN1Y2Nlc3NJY29uID0gbW9kYWwucXVlcnlTZWxlY3RvcignLnNhLWljb24uc2Etc3VjY2VzcycpO1xyXG4gIHJlbW92ZUNsYXNzKCRzdWNjZXNzSWNvbiwgJ2FuaW1hdGUnKTtcclxuICByZW1vdmVDbGFzcygkc3VjY2Vzc0ljb24ucXVlcnlTZWxlY3RvcignLnNhLXRpcCcpLCAnYW5pbWF0ZVN1Y2Nlc3NUaXAnKTtcclxuICByZW1vdmVDbGFzcygkc3VjY2Vzc0ljb24ucXVlcnlTZWxlY3RvcignLnNhLWxvbmcnKSwgJ2FuaW1hdGVTdWNjZXNzTG9uZycpO1xyXG5cclxuICB2YXIgJGVycm9ySWNvbiA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJy5zYS1pY29uLnNhLWVycm9yJyk7XHJcbiAgcmVtb3ZlQ2xhc3MoJGVycm9ySWNvbiwgJ2FuaW1hdGVFcnJvckljb24nKTtcclxuICByZW1vdmVDbGFzcygkZXJyb3JJY29uLnF1ZXJ5U2VsZWN0b3IoJy5zYS14LW1hcmsnKSwgJ2FuaW1hdGVYTWFyaycpO1xyXG5cclxuICB2YXIgJHdhcm5pbmdJY29uID0gbW9kYWwucXVlcnlTZWxlY3RvcignLnNhLWljb24uc2Etd2FybmluZycpO1xyXG4gIHJlbW92ZUNsYXNzKCR3YXJuaW5nSWNvbiwgJ3B1bHNlV2FybmluZycpO1xyXG4gIHJlbW92ZUNsYXNzKCR3YXJuaW5nSWNvbi5xdWVyeVNlbGVjdG9yKCcuc2EtYm9keScpLCAncHVsc2VXYXJuaW5nSW5zJyk7XHJcbiAgcmVtb3ZlQ2xhc3MoJHdhcm5pbmdJY29uLnF1ZXJ5U2VsZWN0b3IoJy5zYS1kb3QnKSwgJ3B1bHNlV2FybmluZ0lucycpO1xyXG5cclxuICAvLyBSZXNldCBjdXN0b20gY2xhc3MgKGRlbGF5IHNvIHRoYXQgVUkgY2hhbmdlcyBhcmVuJ3QgdmlzaWJsZSlcclxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGN1c3RvbUNsYXNzID0gbW9kYWwuZ2V0QXR0cmlidXRlKCdkYXRhLWN1c3RvbS1jbGFzcycpO1xyXG4gICAgcmVtb3ZlQ2xhc3MobW9kYWwsIGN1c3RvbUNsYXNzKTtcclxuICB9LCAzMDApO1xyXG5cclxuICAvLyBSZXNldCB0aGUgcGFnZSB0byBpdHMgcHJldmlvdXMgc3RhdGVcclxuICB3aW5kb3cub25rZXlkb3duID0gcHJldmlvdXNXaW5kb3dLZXlEb3duO1xyXG4gIGlmICh3aW5kb3cucHJldmlvdXNBY3RpdmVFbGVtZW50KSB7XHJcbiAgICB3aW5kb3cucHJldmlvdXNBY3RpdmVFbGVtZW50LmZvY3VzKCk7XHJcbiAgfVxyXG4gIGxhc3RGb2N1c2VkQnV0dG9uID0gdW5kZWZpbmVkO1xyXG4gIGNsZWFyVGltZW91dChtb2RhbC50aW1lb3V0KTtcclxuXHJcbiAgcmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG5cclxuLypcclxuICogVmFsaWRhdGlvbiBvZiB0aGUgaW5wdXQgZmllbGQgaXMgZG9uZSBieSB1c2VyXHJcbiAqIElmIHNvbWV0aGluZyBpcyB3cm9uZyA9PiBjYWxsIHNob3dJbnB1dEVycm9yIHdpdGggZXJyb3JNZXNzYWdlXHJcbiAqL1xyXG5zd2VldEFsZXJ0LnNob3dJbnB1dEVycm9yID0gc3dhbC5zaG93SW5wdXRFcnJvciA9IGZ1bmN0aW9uKGVycm9yTWVzc2FnZSkge1xyXG4gIHZhciBtb2RhbCA9IGdldE1vZGFsKCk7XHJcblxyXG4gIHZhciAkZXJyb3JJY29uID0gbW9kYWwucXVlcnlTZWxlY3RvcignLnNhLWlucHV0LWVycm9yJyk7XHJcbiAgYWRkQ2xhc3MoJGVycm9ySWNvbiwgJ3Nob3cnKTtcclxuXHJcbiAgdmFyICRlcnJvckNvbnRhaW5lciA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJy5zYS1lcnJvci1jb250YWluZXInKTtcclxuICBhZGRDbGFzcygkZXJyb3JDb250YWluZXIsICdzaG93Jyk7XHJcblxyXG4gICRlcnJvckNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdwJykuaW5uZXJIVE1MID0gZXJyb3JNZXNzYWdlO1xyXG5cclxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgc3dlZXRBbGVydC5lbmFibGVCdXR0b25zKCk7XHJcbiAgfSwgMSk7XHJcblxyXG4gIG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0JykuZm9jdXMoKTtcclxufTtcclxuXHJcblxyXG4vKlxyXG4gKiBSZXNldCBpbnB1dCBlcnJvciBET00gZWxlbWVudHNcclxuICovXHJcbnN3ZWV0QWxlcnQucmVzZXRJbnB1dEVycm9yID0gc3dhbC5yZXNldElucHV0RXJyb3IgPSBmdW5jdGlvbihldmVudCkge1xyXG4gIC8vIElmIHByZXNzIGVudGVyID0+IGlnbm9yZVxyXG4gIGlmIChldmVudCAmJiBldmVudC5rZXlDb2RlID09PSAxMykge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgdmFyICRtb2RhbCA9IGdldE1vZGFsKCk7XHJcblxyXG4gIHZhciAkZXJyb3JJY29uID0gJG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJy5zYS1pbnB1dC1lcnJvcicpO1xyXG4gIHJlbW92ZUNsYXNzKCRlcnJvckljb24sICdzaG93Jyk7XHJcblxyXG4gIHZhciAkZXJyb3JDb250YWluZXIgPSAkbW9kYWwucXVlcnlTZWxlY3RvcignLnNhLWVycm9yLWNvbnRhaW5lcicpO1xyXG4gIHJlbW92ZUNsYXNzKCRlcnJvckNvbnRhaW5lciwgJ3Nob3cnKTtcclxufTtcclxuXHJcbi8qXHJcbiAqIERpc2FibGUgY29uZmlybSBhbmQgY2FuY2VsIGJ1dHRvbnNcclxuICovXHJcbnN3ZWV0QWxlcnQuZGlzYWJsZUJ1dHRvbnMgPSBzd2FsLmRpc2FibGVCdXR0b25zID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICB2YXIgbW9kYWwgPSBnZXRNb2RhbCgpO1xyXG4gIHZhciAkY29uZmlybUJ1dHRvbiA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5jb25maXJtJyk7XHJcbiAgdmFyICRjYW5jZWxCdXR0b24gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCdidXR0b24uY2FuY2VsJyk7XHJcbiAgJGNvbmZpcm1CdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xyXG4gICRjYW5jZWxCdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xyXG59O1xyXG5cclxuLypcclxuICogRW5hYmxlIGNvbmZpcm0gYW5kIGNhbmNlbCBidXR0b25zXHJcbiAqL1xyXG5zd2VldEFsZXJ0LmVuYWJsZUJ1dHRvbnMgPSBzd2FsLmVuYWJsZUJ1dHRvbnMgPSBmdW5jdGlvbihldmVudCkge1xyXG4gIHZhciBtb2RhbCA9IGdldE1vZGFsKCk7XHJcbiAgdmFyICRjb25maXJtQnV0dG9uID0gbW9kYWwucXVlcnlTZWxlY3RvcignYnV0dG9uLmNvbmZpcm0nKTtcclxuICB2YXIgJGNhbmNlbEJ1dHRvbiA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5jYW5jZWwnKTtcclxuICAkY29uZmlybUJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICRjYW5jZWxCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcclxufTtcclxuXHJcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xyXG4gIC8vIFRoZSAnaGFuZGxlLWNsaWNrJyBtb2R1bGUgcmVxdWlyZXNcclxuICAvLyB0aGF0ICdzd2VldEFsZXJ0JyB3YXMgc2V0IGFzIGdsb2JhbC5cclxuICB3aW5kb3cuc3dlZXRBbGVydCA9IHdpbmRvdy5zd2FsID0gc3dlZXRBbGVydDtcclxufSBlbHNlIHtcclxuICBsb2dTdHIoJ1N3ZWV0QWxlcnQgaXMgYSBmcm9udGVuZCBtb2R1bGUhJyk7XHJcbn1cclxuIiwidmFyIGRlZmF1bHRQYXJhbXMgPSB7XHJcbiAgdGl0bGU6ICcnLFxyXG4gIHRleHQ6ICcnLFxyXG4gIHR5cGU6IG51bGwsXHJcbiAgYWxsb3dPdXRzaWRlQ2xpY2s6IGZhbHNlLFxyXG4gIHNob3dDb25maXJtQnV0dG9uOiB0cnVlLFxyXG4gIHNob3dDYW5jZWxCdXR0b246IGZhbHNlLFxyXG4gIGNsb3NlT25Db25maXJtOiB0cnVlLFxyXG4gIGNsb3NlT25DYW5jZWw6IHRydWUsXHJcbiAgY29uZmlybUJ1dHRvblRleHQ6ICdPSycsXHJcbiAgY29uZmlybUJ1dHRvbkNvbG9yOiAnIzhDRDRGNScsXHJcbiAgY2FuY2VsQnV0dG9uVGV4dDogJ0NhbmNlbCcsXHJcbiAgaW1hZ2VVcmw6IG51bGwsXHJcbiAgaW1hZ2VTaXplOiBudWxsLFxyXG4gIHRpbWVyOiBudWxsLFxyXG4gIGN1c3RvbUNsYXNzOiAnJyxcclxuICBodG1sOiBmYWxzZSxcclxuICBhbmltYXRpb246IHRydWUsXHJcbiAgYWxsb3dFc2NhcGVLZXk6IHRydWUsXHJcbiAgaW5wdXRUeXBlOiAndGV4dCcsXHJcbiAgaW5wdXRQbGFjZWhvbGRlcjogJycsXHJcbiAgaW5wdXRWYWx1ZTogJycsXHJcbiAgc2hvd0xvYWRlck9uQ29uZmlybTogZmFsc2VcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmF1bHRQYXJhbXM7XHJcbiIsImltcG9ydCB7IGNvbG9yTHVtaW5hbmNlIH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IGdldE1vZGFsIH0gZnJvbSAnLi9oYW5kbGUtc3dhbC1kb20nO1xyXG5pbXBvcnQgeyBoYXNDbGFzcywgaXNEZXNjZW5kYW50IH0gZnJvbSAnLi9oYW5kbGUtZG9tJztcclxuXHJcblxyXG4vKlxyXG4gKiBVc2VyIGNsaWNrZWQgb24gXCJDb25maXJtXCIvXCJPS1wiIG9yIFwiQ2FuY2VsXCJcclxuICovXHJcbnZhciBoYW5kbGVCdXR0b24gPSBmdW5jdGlvbihldmVudCwgcGFyYW1zLCBtb2RhbCkge1xyXG4gIHZhciBlID0gZXZlbnQgfHwgd2luZG93LmV2ZW50O1xyXG4gIHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XHJcblxyXG4gIHZhciB0YXJnZXRlZENvbmZpcm0gPSB0YXJnZXQuY2xhc3NOYW1lLmluZGV4T2YoJ2NvbmZpcm0nKSAhPT0gLTE7XHJcbiAgdmFyIHRhcmdldGVkT3ZlcmxheSA9IHRhcmdldC5jbGFzc05hbWUuaW5kZXhPZignc3dlZXQtb3ZlcmxheScpICE9PSAtMTtcclxuICB2YXIgbW9kYWxJc1Zpc2libGUgID0gaGFzQ2xhc3MobW9kYWwsICd2aXNpYmxlJyk7XHJcbiAgdmFyIGRvbmVGdW5jdGlvbkV4aXN0cyA9IChwYXJhbXMuZG9uZUZ1bmN0aW9uICYmIG1vZGFsLmdldEF0dHJpYnV0ZSgnZGF0YS1oYXMtZG9uZS1mdW5jdGlvbicpID09PSAndHJ1ZScpO1xyXG5cclxuICAvLyBTaW5jZSB0aGUgdXNlciBjYW4gY2hhbmdlIHRoZSBiYWNrZ3JvdW5kLWNvbG9yIG9mIHRoZSBjb25maXJtIGJ1dHRvbiBwcm9ncmFtbWF0aWNhbGx5LFxyXG4gIC8vIHdlIG11c3QgY2FsY3VsYXRlIHdoYXQgdGhlIGNvbG9yIHNob3VsZCBiZSBvbiBob3Zlci9hY3RpdmVcclxuICB2YXIgbm9ybWFsQ29sb3IsIGhvdmVyQ29sb3IsIGFjdGl2ZUNvbG9yO1xyXG4gIGlmICh0YXJnZXRlZENvbmZpcm0gJiYgcGFyYW1zLmNvbmZpcm1CdXR0b25Db2xvcikge1xyXG4gICAgbm9ybWFsQ29sb3IgID0gcGFyYW1zLmNvbmZpcm1CdXR0b25Db2xvcjtcclxuICAgIGhvdmVyQ29sb3IgICA9IGNvbG9yTHVtaW5hbmNlKG5vcm1hbENvbG9yLCAtMC4wNCk7XHJcbiAgICBhY3RpdmVDb2xvciAgPSBjb2xvckx1bWluYW5jZShub3JtYWxDb2xvciwgLTAuMTQpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2hvdWxkU2V0Q29uZmlybUJ1dHRvbkNvbG9yKGNvbG9yKSB7XHJcbiAgICBpZiAodGFyZ2V0ZWRDb25maXJtICYmIHBhcmFtcy5jb25maXJtQnV0dG9uQ29sb3IpIHtcclxuICAgICAgdGFyZ2V0LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGNvbG9yO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc3dpdGNoIChlLnR5cGUpIHtcclxuICAgIGNhc2UgJ21vdXNlb3Zlcic6XHJcbiAgICAgIHNob3VsZFNldENvbmZpcm1CdXR0b25Db2xvcihob3ZlckNvbG9yKTtcclxuICAgICAgYnJlYWs7XHJcblxyXG4gICAgY2FzZSAnbW91c2VvdXQnOlxyXG4gICAgICBzaG91bGRTZXRDb25maXJtQnV0dG9uQ29sb3Iobm9ybWFsQ29sb3IpO1xyXG4gICAgICBicmVhaztcclxuXHJcbiAgICBjYXNlICdtb3VzZWRvd24nOlxyXG4gICAgICBzaG91bGRTZXRDb25maXJtQnV0dG9uQ29sb3IoYWN0aXZlQ29sb3IpO1xyXG4gICAgICBicmVhaztcclxuXHJcbiAgICBjYXNlICdtb3VzZXVwJzpcclxuICAgICAgc2hvdWxkU2V0Q29uZmlybUJ1dHRvbkNvbG9yKGhvdmVyQ29sb3IpO1xyXG4gICAgICBicmVhaztcclxuXHJcbiAgICBjYXNlICdmb2N1cyc6XHJcbiAgICAgIGxldCAkY29uZmlybUJ1dHRvbiA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5jb25maXJtJyk7XHJcbiAgICAgIGxldCAkY2FuY2VsQnV0dG9uICA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5jYW5jZWwnKTtcclxuXHJcbiAgICAgIGlmICh0YXJnZXRlZENvbmZpcm0pIHtcclxuICAgICAgICAkY2FuY2VsQnV0dG9uLnN0eWxlLmJveFNoYWRvdyA9ICdub25lJztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkY29uZmlybUJ1dHRvbi5zdHlsZS5ib3hTaGFkb3cgPSAnbm9uZSc7XHJcbiAgICAgIH1cclxuICAgICAgYnJlYWs7XHJcblxyXG4gICAgY2FzZSAnY2xpY2snOlxyXG4gICAgICBsZXQgY2xpY2tlZE9uTW9kYWwgPSAobW9kYWwgPT09IHRhcmdldCk7XHJcbiAgICAgIGxldCBjbGlja2VkT25Nb2RhbENoaWxkID0gaXNEZXNjZW5kYW50KG1vZGFsLCB0YXJnZXQpO1xyXG5cclxuICAgICAgLy8gSWdub3JlIGNsaWNrIG91dHNpZGUgaWYgYWxsb3dPdXRzaWRlQ2xpY2sgaXMgZmFsc2VcclxuICAgICAgaWYgKCFjbGlja2VkT25Nb2RhbCAmJiAhY2xpY2tlZE9uTW9kYWxDaGlsZCAmJiBtb2RhbElzVmlzaWJsZSAmJiAhcGFyYW1zLmFsbG93T3V0c2lkZUNsaWNrKSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh0YXJnZXRlZENvbmZpcm0gJiYgZG9uZUZ1bmN0aW9uRXhpc3RzICYmIG1vZGFsSXNWaXNpYmxlKSB7XHJcbiAgICAgICAgaGFuZGxlQ29uZmlybShtb2RhbCwgcGFyYW1zKTtcclxuICAgICAgfSBlbHNlIGlmIChkb25lRnVuY3Rpb25FeGlzdHMgJiYgbW9kYWxJc1Zpc2libGUgfHwgdGFyZ2V0ZWRPdmVybGF5KSB7XHJcbiAgICAgICAgaGFuZGxlQ2FuY2VsKG1vZGFsLCBwYXJhbXMpO1xyXG4gICAgICB9IGVsc2UgaWYgKGlzRGVzY2VuZGFudChtb2RhbCwgdGFyZ2V0KSAmJiB0YXJnZXQudGFnTmFtZSA9PT0gJ0JVVFRPTicpIHtcclxuICAgICAgICBzd2VldEFsZXJ0LmNsb3NlKCk7XHJcbiAgICAgIH1cclxuICAgICAgYnJlYWs7XHJcbiAgfVxyXG59O1xyXG5cclxuLypcclxuICogIFVzZXIgY2xpY2tlZCBvbiBcIkNvbmZpcm1cIi9cIk9LXCJcclxuICovXHJcbnZhciBoYW5kbGVDb25maXJtID0gZnVuY3Rpb24obW9kYWwsIHBhcmFtcykge1xyXG4gIHZhciBjYWxsYmFja1ZhbHVlID0gdHJ1ZTtcclxuXHJcbiAgaWYgKGhhc0NsYXNzKG1vZGFsLCAnc2hvdy1pbnB1dCcpKSB7XHJcbiAgICBjYWxsYmFja1ZhbHVlID0gbW9kYWwucXVlcnlTZWxlY3RvcignaW5wdXQnKS52YWx1ZTtcclxuXHJcbiAgICBpZiAoIWNhbGxiYWNrVmFsdWUpIHtcclxuICAgICAgY2FsbGJhY2tWYWx1ZSA9ICcnO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcGFyYW1zLmRvbmVGdW5jdGlvbihjYWxsYmFja1ZhbHVlKTtcclxuXHJcbiAgaWYgKHBhcmFtcy5jbG9zZU9uQ29uZmlybSkge1xyXG4gICAgc3dlZXRBbGVydC5jbG9zZSgpO1xyXG4gIH1cclxuICAvLyBEaXNhYmxlIGNhbmNlbCBhbmQgY29uZmlybSBidXR0b24gaWYgdGhlIHBhcmFtZXRlciBpcyB0cnVlXHJcbiAgaWYgKHBhcmFtcy5zaG93TG9hZGVyT25Db25maXJtKSB7XHJcbiAgICBzd2VldEFsZXJ0LmRpc2FibGVCdXR0b25zKCk7XHJcbiAgfVxyXG59O1xyXG5cclxuLypcclxuICogIFVzZXIgY2xpY2tlZCBvbiBcIkNhbmNlbFwiXHJcbiAqL1xyXG52YXIgaGFuZGxlQ2FuY2VsID0gZnVuY3Rpb24obW9kYWwsIHBhcmFtcykge1xyXG4gIC8vIENoZWNrIGlmIGNhbGxiYWNrIGZ1bmN0aW9uIGV4cGVjdHMgYSBwYXJhbWV0ZXIgKHRvIHRyYWNrIGNhbmNlbCBhY3Rpb25zKVxyXG4gIHZhciBmdW5jdGlvbkFzU3RyID0gU3RyaW5nKHBhcmFtcy5kb25lRnVuY3Rpb24pLnJlcGxhY2UoL1xccy9nLCAnJyk7XHJcbiAgdmFyIGZ1bmN0aW9uSGFuZGxlc0NhbmNlbCA9IGZ1bmN0aW9uQXNTdHIuc3Vic3RyaW5nKDAsIDkpID09PSAnZnVuY3Rpb24oJyAmJiBmdW5jdGlvbkFzU3RyLnN1YnN0cmluZyg5LCAxMCkgIT09ICcpJztcclxuXHJcbiAgaWYgKGZ1bmN0aW9uSGFuZGxlc0NhbmNlbCkge1xyXG4gICAgcGFyYW1zLmRvbmVGdW5jdGlvbihmYWxzZSk7XHJcbiAgfVxyXG5cclxuICBpZiAocGFyYW1zLmNsb3NlT25DYW5jZWwpIHtcclxuICAgIHN3ZWV0QWxlcnQuY2xvc2UoKTtcclxuICB9XHJcbn07XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIGhhbmRsZUJ1dHRvbixcclxuICBoYW5kbGVDb25maXJtLFxyXG4gIGhhbmRsZUNhbmNlbFxyXG59O1xyXG4iLCJ2YXIgaGFzQ2xhc3MgPSBmdW5jdGlvbihlbGVtLCBjbGFzc05hbWUpIHtcclxuICByZXR1cm4gbmV3IFJlZ0V4cCgnICcgKyBjbGFzc05hbWUgKyAnICcpLnRlc3QoJyAnICsgZWxlbS5jbGFzc05hbWUgKyAnICcpO1xyXG59O1xyXG5cclxudmFyIGFkZENsYXNzID0gZnVuY3Rpb24oZWxlbSwgY2xhc3NOYW1lKSB7XHJcbiAgaWYgKCFoYXNDbGFzcyhlbGVtLCBjbGFzc05hbWUpKSB7XHJcbiAgICBlbGVtLmNsYXNzTmFtZSArPSAnICcgKyBjbGFzc05hbWU7XHJcbiAgfVxyXG59O1xyXG5cclxudmFyIHJlbW92ZUNsYXNzID0gZnVuY3Rpb24oZWxlbSwgY2xhc3NOYW1lKSB7XHJcbiAgdmFyIG5ld0NsYXNzID0gJyAnICsgZWxlbS5jbGFzc05hbWUucmVwbGFjZSgvW1xcdFxcclxcbl0vZywgJyAnKSArICcgJztcclxuICBpZiAoaGFzQ2xhc3MoZWxlbSwgY2xhc3NOYW1lKSkge1xyXG4gICAgd2hpbGUgKG5ld0NsYXNzLmluZGV4T2YoJyAnICsgY2xhc3NOYW1lICsgJyAnKSA+PSAwKSB7XHJcbiAgICAgIG5ld0NsYXNzID0gbmV3Q2xhc3MucmVwbGFjZSgnICcgKyBjbGFzc05hbWUgKyAnICcsICcgJyk7XHJcbiAgICB9XHJcbiAgICBlbGVtLmNsYXNzTmFtZSA9IG5ld0NsYXNzLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcclxuICB9XHJcbn07XHJcblxyXG52YXIgZXNjYXBlSHRtbCA9IGZ1bmN0aW9uKHN0cikge1xyXG4gIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICBkaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoc3RyKSk7XHJcbiAgcmV0dXJuIGRpdi5pbm5lckhUTUw7XHJcbn07XHJcblxyXG52YXIgX3Nob3cgPSBmdW5jdGlvbihlbGVtKSB7XHJcbiAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gJyc7XHJcbiAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxufTtcclxuXHJcbnZhciBzaG93ID0gZnVuY3Rpb24oZWxlbXMpIHtcclxuICBpZiAoZWxlbXMgJiYgIWVsZW1zLmxlbmd0aCkge1xyXG4gICAgcmV0dXJuIF9zaG93KGVsZW1zKTtcclxuICB9XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtcy5sZW5ndGg7ICsraSkge1xyXG4gICAgX3Nob3coZWxlbXNbaV0pO1xyXG4gIH1cclxufTtcclxuXHJcbnZhciBfaGlkZSA9IGZ1bmN0aW9uKGVsZW0pIHtcclxuICBlbGVtLnN0eWxlLm9wYWNpdHkgPSAnJztcclxuICBlbGVtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbn07XHJcblxyXG52YXIgaGlkZSA9IGZ1bmN0aW9uKGVsZW1zKSB7XHJcbiAgaWYgKGVsZW1zICYmICFlbGVtcy5sZW5ndGgpIHtcclxuICAgIHJldHVybiBfaGlkZShlbGVtcyk7XHJcbiAgfVxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbXMubGVuZ3RoOyArK2kpIHtcclxuICAgIF9oaWRlKGVsZW1zW2ldKTtcclxuICB9XHJcbn07XHJcblxyXG52YXIgaXNEZXNjZW5kYW50ID0gZnVuY3Rpb24ocGFyZW50LCBjaGlsZCkge1xyXG4gIHZhciBub2RlID0gY2hpbGQucGFyZW50Tm9kZTtcclxuICB3aGlsZSAobm9kZSAhPT0gbnVsbCkge1xyXG4gICAgaWYgKG5vZGUgPT09IHBhcmVudCkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XHJcbiAgfVxyXG4gIHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbnZhciBnZXRUb3BNYXJnaW4gPSBmdW5jdGlvbihlbGVtKSB7XHJcbiAgZWxlbS5zdHlsZS5sZWZ0ID0gJy05OTk5cHgnO1xyXG4gIGVsZW0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcblxyXG4gIHZhciBoZWlnaHQgPSBlbGVtLmNsaWVudEhlaWdodCxcclxuICAgICAgcGFkZGluZztcclxuICBpZiAodHlwZW9mIGdldENvbXB1dGVkU3R5bGUgIT09IFwidW5kZWZpbmVkXCIpIHsgLy8gSUUgOFxyXG4gICAgcGFkZGluZyA9IHBhcnNlSW50KGdldENvbXB1dGVkU3R5bGUoZWxlbSkuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy10b3AnKSwgMTApO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBwYWRkaW5nID0gcGFyc2VJbnQoZWxlbS5jdXJyZW50U3R5bGUucGFkZGluZyk7XHJcbiAgfVxyXG5cclxuICBlbGVtLnN0eWxlLmxlZnQgPSAnJztcclxuICBlbGVtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgcmV0dXJuICgnLScgKyBwYXJzZUludCgoaGVpZ2h0ICsgcGFkZGluZykgLyAyKSArICdweCcpO1xyXG59O1xyXG5cclxudmFyIGZhZGVJbiA9IGZ1bmN0aW9uKGVsZW0sIGludGVydmFsKSB7XHJcbiAgaWYgKCtlbGVtLnN0eWxlLm9wYWNpdHkgPCAxKSB7XHJcbiAgICBpbnRlcnZhbCA9IGludGVydmFsIHx8IDE2O1xyXG4gICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gMDtcclxuICAgIGVsZW0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICB2YXIgbGFzdCA9ICtuZXcgRGF0ZSgpO1xyXG4gICAgdmFyIHRpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gK2VsZW0uc3R5bGUub3BhY2l0eSArIChuZXcgRGF0ZSgpIC0gbGFzdCkgLyAxMDA7XHJcbiAgICAgIGxhc3QgPSArbmV3IERhdGUoKTtcclxuXHJcbiAgICAgIGlmICgrZWxlbS5zdHlsZS5vcGFjaXR5IDwgMSkge1xyXG4gICAgICAgIHNldFRpbWVvdXQodGljaywgaW50ZXJ2YWwpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGljaygpO1xyXG4gIH1cclxuICBlbGVtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snOyAvL2ZhbGxiYWNrIElFOFxyXG59O1xyXG5cclxudmFyIGZhZGVPdXQgPSBmdW5jdGlvbihlbGVtLCBpbnRlcnZhbCkge1xyXG4gIGludGVydmFsID0gaW50ZXJ2YWwgfHwgMTY7XHJcbiAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gMTtcclxuICB2YXIgbGFzdCA9ICtuZXcgRGF0ZSgpO1xyXG4gIHZhciB0aWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSArZWxlbS5zdHlsZS5vcGFjaXR5IC0gKG5ldyBEYXRlKCkgLSBsYXN0KSAvIDEwMDtcclxuICAgIGxhc3QgPSArbmV3IERhdGUoKTtcclxuXHJcbiAgICBpZiAoK2VsZW0uc3R5bGUub3BhY2l0eSA+IDApIHtcclxuICAgICAgc2V0VGltZW91dCh0aWNrLCBpbnRlcnZhbCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBlbGVtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB9XHJcbiAgfTtcclxuICB0aWNrKCk7XHJcbn07XHJcblxyXG52YXIgZmlyZUNsaWNrID0gZnVuY3Rpb24obm9kZSkge1xyXG4gIC8vIFRha2VuIGZyb20gaHR0cDovL3d3dy5ub25vYnRydXNpdmUuY29tLzIwMTEvMTEvMjkvcHJvZ3JhbWF0aWNhbGx5LWZpcmUtY3Jvc3Nicm93c2VyLWNsaWNrLWV2ZW50LXdpdGgtamF2YXNjcmlwdC9cclxuICAvLyBUaGVuIGZpeGVkIGZvciB0b2RheSdzIENocm9tZSBicm93c2VyLlxyXG4gIGlmICh0eXBlb2YgTW91c2VFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgLy8gVXAtdG8tZGF0ZSBhcHByb2FjaFxyXG4gICAgdmFyIG1ldnQgPSBuZXcgTW91c2VFdmVudCgnY2xpY2snLCB7XHJcbiAgICAgIHZpZXc6IHdpbmRvdyxcclxuICAgICAgYnViYmxlczogZmFsc2UsXHJcbiAgICAgIGNhbmNlbGFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgbm9kZS5kaXNwYXRjaEV2ZW50KG1ldnQpO1xyXG4gIH0gZWxzZSBpZiAoIGRvY3VtZW50LmNyZWF0ZUV2ZW50ICkge1xyXG4gICAgLy8gRmFsbGJhY2tcclxuICAgIHZhciBldnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnTW91c2VFdmVudHMnKTtcclxuICAgIGV2dC5pbml0RXZlbnQoJ2NsaWNrJywgZmFsc2UsIGZhbHNlKTtcclxuICAgIG5vZGUuZGlzcGF0Y2hFdmVudChldnQpO1xyXG4gIH0gZWxzZSBpZiAoZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QpIHtcclxuICAgIG5vZGUuZmlyZUV2ZW50KCdvbmNsaWNrJykgO1xyXG4gIH0gZWxzZSBpZiAodHlwZW9mIG5vZGUub25jbGljayA9PT0gJ2Z1bmN0aW9uJyApIHtcclxuICAgIG5vZGUub25jbGljaygpO1xyXG4gIH1cclxufTtcclxuXHJcbnZhciBzdG9wRXZlbnRQcm9wYWdhdGlvbiA9IGZ1bmN0aW9uKGUpIHtcclxuICAvLyBJbiBwYXJ0aWN1bGFyLCBtYWtlIHN1cmUgdGhlIHNwYWNlIGJhciBkb2Vzbid0IHNjcm9sbCB0aGUgbWFpbiB3aW5kb3cuXHJcbiAgaWYgKHR5cGVvZiBlLnN0b3BQcm9wYWdhdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICB9IGVsc2UgaWYgKHdpbmRvdy5ldmVudCAmJiB3aW5kb3cuZXZlbnQuaGFzT3duUHJvcGVydHkoJ2NhbmNlbEJ1YmJsZScpKSB7XHJcbiAgICB3aW5kb3cuZXZlbnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgeyBcclxuICBoYXNDbGFzcywgYWRkQ2xhc3MsIHJlbW92ZUNsYXNzLCBcclxuICBlc2NhcGVIdG1sLCBcclxuICBfc2hvdywgc2hvdywgX2hpZGUsIGhpZGUsIFxyXG4gIGlzRGVzY2VuZGFudCwgXHJcbiAgZ2V0VG9wTWFyZ2luLFxyXG4gIGZhZGVJbiwgZmFkZU91dCxcclxuICBmaXJlQ2xpY2ssXHJcbiAgc3RvcEV2ZW50UHJvcGFnYXRpb25cclxufTtcclxuIiwiaW1wb3J0IHsgc3RvcEV2ZW50UHJvcGFnYXRpb24sIGZpcmVDbGljayB9IGZyb20gJy4vaGFuZGxlLWRvbSc7XHJcbmltcG9ydCB7IHNldEZvY3VzU3R5bGUgfSBmcm9tICcuL2hhbmRsZS1zd2FsLWRvbSc7XHJcblxyXG5cclxudmFyIGhhbmRsZUtleURvd24gPSBmdW5jdGlvbihldmVudCwgcGFyYW1zLCBtb2RhbCkge1xyXG4gIHZhciBlID0gZXZlbnQgfHwgd2luZG93LmV2ZW50O1xyXG4gIHZhciBrZXlDb2RlID0gZS5rZXlDb2RlIHx8IGUud2hpY2g7XHJcblxyXG4gIHZhciAkb2tCdXR0b24gICAgID0gbW9kYWwucXVlcnlTZWxlY3RvcignYnV0dG9uLmNvbmZpcm0nKTtcclxuICB2YXIgJGNhbmNlbEJ1dHRvbiA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5jYW5jZWwnKTtcclxuICB2YXIgJG1vZGFsQnV0dG9ucyA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvblt0YWJpbmRleF0nKTtcclxuXHJcblxyXG4gIGlmIChbOSwgMTMsIDMyLCAyN10uaW5kZXhPZihrZXlDb2RlKSA9PT0gLTEpIHtcclxuICAgIC8vIERvbid0IGRvIHdvcmsgb24ga2V5cyB3ZSBkb24ndCBjYXJlIGFib3V0LlxyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdmFyICR0YXJnZXRFbGVtZW50ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG5cclxuICB2YXIgYnRuSW5kZXggPSAtMTsgLy8gRmluZCB0aGUgYnV0dG9uIC0gbm90ZSwgdGhpcyBpcyBhIG5vZGVsaXN0LCBub3QgYW4gYXJyYXkuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAkbW9kYWxCdXR0b25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAoJHRhcmdldEVsZW1lbnQgPT09ICRtb2RhbEJ1dHRvbnNbaV0pIHtcclxuICAgICAgYnRuSW5kZXggPSBpO1xyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmIChrZXlDb2RlID09PSA5KSB7XHJcbiAgICAvLyBUQUJcclxuICAgIGlmIChidG5JbmRleCA9PT0gLTEpIHtcclxuICAgICAgLy8gTm8gYnV0dG9uIGZvY3VzZWQuIEp1bXAgdG8gdGhlIGNvbmZpcm0gYnV0dG9uLlxyXG4gICAgICAkdGFyZ2V0RWxlbWVudCA9ICRva0J1dHRvbjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIEN5Y2xlIHRvIHRoZSBuZXh0IGJ1dHRvblxyXG4gICAgICBpZiAoYnRuSW5kZXggPT09ICRtb2RhbEJ1dHRvbnMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICR0YXJnZXRFbGVtZW50ID0gJG1vZGFsQnV0dG9uc1swXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkdGFyZ2V0RWxlbWVudCA9ICRtb2RhbEJ1dHRvbnNbYnRuSW5kZXggKyAxXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0b3BFdmVudFByb3BhZ2F0aW9uKGUpO1xyXG4gICAgJHRhcmdldEVsZW1lbnQuZm9jdXMoKTtcclxuXHJcbiAgICBpZiAocGFyYW1zLmNvbmZpcm1CdXR0b25Db2xvcikge1xyXG4gICAgICBzZXRGb2N1c1N0eWxlKCR0YXJnZXRFbGVtZW50LCBwYXJhbXMuY29uZmlybUJ1dHRvbkNvbG9yKTtcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgaWYgKGtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgIGlmICgkdGFyZ2V0RWxlbWVudC50YWdOYW1lID09PSAnSU5QVVQnKSB7XHJcbiAgICAgICAgJHRhcmdldEVsZW1lbnQgPSAkb2tCdXR0b247XHJcbiAgICAgICAgJG9rQnV0dG9uLmZvY3VzKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChidG5JbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAvLyBFTlRFUi9TUEFDRSBjbGlja2VkIG91dHNpZGUgb2YgYSBidXR0b24uXHJcbiAgICAgICAgJHRhcmdldEVsZW1lbnQgPSAkb2tCdXR0b247XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gRG8gbm90aGluZyAtIGxldCB0aGUgYnJvd3NlciBoYW5kbGUgaXQuXHJcbiAgICAgICAgJHRhcmdldEVsZW1lbnQgPSB1bmRlZmluZWQ7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoa2V5Q29kZSA9PT0gMjcgJiYgcGFyYW1zLmFsbG93RXNjYXBlS2V5ID09PSB0cnVlKSB7XHJcbiAgICAgICR0YXJnZXRFbGVtZW50ID0gJGNhbmNlbEJ1dHRvbjtcclxuICAgICAgZmlyZUNsaWNrKCR0YXJnZXRFbGVtZW50LCBlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIEZhbGxiYWNrIC0gbGV0IHRoZSBicm93c2VyIGhhbmRsZSBpdC5cclxuICAgICAgJHRhcmdldEVsZW1lbnQgPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgaGFuZGxlS2V5RG93bjtcclxuIiwiaW1wb3J0IHsgaGV4VG9SZ2IgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgcmVtb3ZlQ2xhc3MsIGdldFRvcE1hcmdpbiwgZmFkZUluLCBzaG93LCBhZGRDbGFzcyB9IGZyb20gJy4vaGFuZGxlLWRvbSc7XHJcbmltcG9ydCBkZWZhdWx0UGFyYW1zIGZyb20gJy4vZGVmYXVsdC1wYXJhbXMnO1xyXG5cclxudmFyIG1vZGFsQ2xhc3MgICA9ICcuc3dlZXQtYWxlcnQnO1xyXG52YXIgb3ZlcmxheUNsYXNzID0gJy5zd2VldC1vdmVybGF5JztcclxuXHJcbi8qXHJcbiAqIEFkZCBtb2RhbCArIG92ZXJsYXkgdG8gRE9NXHJcbiAqL1xyXG5pbXBvcnQgaW5qZWN0ZWRIVE1MIGZyb20gJy4vaW5qZWN0ZWQtaHRtbCc7XHJcblxyXG52YXIgc3dlZXRBbGVydEluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgc3dlZXRXcmFwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgc3dlZXRXcmFwLmlubmVySFRNTCA9IGluamVjdGVkSFRNTDtcclxuXHJcbiAgLy8gQXBwZW5kIGVsZW1lbnRzIHRvIGJvZHlcclxuICB3aGlsZSAoc3dlZXRXcmFwLmZpcnN0Q2hpbGQpIHtcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3dlZXRXcmFwLmZpcnN0Q2hpbGQpO1xyXG4gIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIEdldCBET00gZWxlbWVudCBvZiBtb2RhbFxyXG4gKi9cclxudmFyIGdldE1vZGFsID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyICRtb2RhbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IobW9kYWxDbGFzcyk7XHJcblxyXG4gIGlmICghJG1vZGFsKSB7XHJcbiAgICBzd2VldEFsZXJ0SW5pdGlhbGl6ZSgpO1xyXG4gICAgJG1vZGFsID0gZ2V0TW9kYWwoKTtcclxuICB9XHJcblxyXG4gIHJldHVybiAkbW9kYWw7XHJcbn07XHJcblxyXG4vKlxyXG4gKiBHZXQgRE9NIGVsZW1lbnQgb2YgaW5wdXQgKGluIG1vZGFsKVxyXG4gKi9cclxudmFyIGdldElucHV0ID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyICRtb2RhbCA9IGdldE1vZGFsKCk7XHJcbiAgaWYgKCRtb2RhbCkge1xyXG4gICAgcmV0dXJuICRtb2RhbC5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpO1xyXG4gIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIEdldCBET00gZWxlbWVudCBvZiBvdmVybGF5XHJcbiAqL1xyXG52YXIgZ2V0T3ZlcmxheSA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKG92ZXJsYXlDbGFzcyk7XHJcbn07XHJcblxyXG4vKlxyXG4gKiBBZGQgYm94LXNoYWRvdyBzdHlsZSB0byBidXR0b24gKGRlcGVuZGluZyBvbiBpdHMgY2hvc2VuIGJnLWNvbG9yKVxyXG4gKi9cclxudmFyIHNldEZvY3VzU3R5bGUgPSBmdW5jdGlvbigkYnV0dG9uLCBiZ0NvbG9yKSB7XHJcbiAgdmFyIHJnYkNvbG9yID0gaGV4VG9SZ2IoYmdDb2xvcik7XHJcbiAgJGJ1dHRvbi5zdHlsZS5ib3hTaGFkb3cgPSAnMCAwIDJweCByZ2JhKCcgKyByZ2JDb2xvciArICcsIDAuOCksIGluc2V0IDAgMCAwIDFweCByZ2JhKDAsIDAsIDAsIDAuMDUpJztcclxufTtcclxuXHJcbi8qXHJcbiAqIEFuaW1hdGlvbiB3aGVuIG9wZW5pbmcgbW9kYWxcclxuICovXHJcbnZhciBvcGVuTW9kYWwgPSBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gIHZhciAkbW9kYWwgPSBnZXRNb2RhbCgpO1xyXG4gIGZhZGVJbihnZXRPdmVybGF5KCksIDEwKTtcclxuICBzaG93KCRtb2RhbCk7XHJcbiAgYWRkQ2xhc3MoJG1vZGFsLCAnc2hvd1N3ZWV0QWxlcnQnKTtcclxuICByZW1vdmVDbGFzcygkbW9kYWwsICdoaWRlU3dlZXRBbGVydCcpO1xyXG5cclxuICB3aW5kb3cucHJldmlvdXNBY3RpdmVFbGVtZW50ID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcclxuICB2YXIgJG9rQnV0dG9uID0gJG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5jb25maXJtJyk7XHJcbiAgJG9rQnV0dG9uLmZvY3VzKCk7XHJcblxyXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgYWRkQ2xhc3MoJG1vZGFsLCAndmlzaWJsZScpO1xyXG4gIH0sIDUwMCk7XHJcblxyXG4gIHZhciB0aW1lciA9ICRtb2RhbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGltZXInKTtcclxuXHJcbiAgaWYgKHRpbWVyICE9PSAnbnVsbCcgJiYgdGltZXIgIT09ICcnKSB7XHJcbiAgICB2YXIgdGltZXJDYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgJG1vZGFsLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgZG9uZUZ1bmN0aW9uRXhpc3RzID0gKCh0aW1lckNhbGxiYWNrIHx8IG51bGwpICYmICRtb2RhbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaGFzLWRvbmUtZnVuY3Rpb24nKSA9PT0gJ3RydWUnKTtcclxuICAgICAgaWYgKGRvbmVGdW5jdGlvbkV4aXN0cykgeyBcclxuICAgICAgICB0aW1lckNhbGxiYWNrKG51bGwpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHN3ZWV0QWxlcnQuY2xvc2UoKTtcclxuICAgICAgfVxyXG4gICAgfSwgdGltZXIpO1xyXG4gIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIFJlc2V0IHRoZSBzdHlsaW5nIG9mIHRoZSBpbnB1dFxyXG4gKiAoZm9yIGV4YW1wbGUgaWYgZXJyb3JzIGhhdmUgYmVlbiBzaG93bilcclxuICovXHJcbnZhciByZXNldElucHV0ID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyICRtb2RhbCA9IGdldE1vZGFsKCk7XHJcbiAgdmFyICRpbnB1dCA9IGdldElucHV0KCk7XHJcblxyXG4gIHJlbW92ZUNsYXNzKCRtb2RhbCwgJ3Nob3ctaW5wdXQnKTtcclxuICAkaW5wdXQudmFsdWUgPSBkZWZhdWx0UGFyYW1zLmlucHV0VmFsdWU7XHJcbiAgJGlucHV0LnNldEF0dHJpYnV0ZSgndHlwZScsIGRlZmF1bHRQYXJhbXMuaW5wdXRUeXBlKTtcclxuICAkaW5wdXQuc2V0QXR0cmlidXRlKCdwbGFjZWhvbGRlcicsIGRlZmF1bHRQYXJhbXMuaW5wdXRQbGFjZWhvbGRlcik7XHJcblxyXG4gIHJlc2V0SW5wdXRFcnJvcigpO1xyXG59O1xyXG5cclxuXHJcbnZhciByZXNldElucHV0RXJyb3IgPSBmdW5jdGlvbihldmVudCkge1xyXG4gIC8vIElmIHByZXNzIGVudGVyID0+IGlnbm9yZVxyXG4gIGlmIChldmVudCAmJiBldmVudC5rZXlDb2RlID09PSAxMykge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgdmFyICRtb2RhbCA9IGdldE1vZGFsKCk7XHJcblxyXG4gIHZhciAkZXJyb3JJY29uID0gJG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJy5zYS1pbnB1dC1lcnJvcicpO1xyXG4gIHJlbW92ZUNsYXNzKCRlcnJvckljb24sICdzaG93Jyk7XHJcblxyXG4gIHZhciAkZXJyb3JDb250YWluZXIgPSAkbW9kYWwucXVlcnlTZWxlY3RvcignLnNhLWVycm9yLWNvbnRhaW5lcicpO1xyXG4gIHJlbW92ZUNsYXNzKCRlcnJvckNvbnRhaW5lciwgJ3Nob3cnKTtcclxufTtcclxuXHJcblxyXG4vKlxyXG4gKiBTZXQgXCJtYXJnaW4tdG9wXCItcHJvcGVydHkgb24gbW9kYWwgYmFzZWQgb24gaXRzIGNvbXB1dGVkIGhlaWdodFxyXG4gKi9cclxudmFyIGZpeFZlcnRpY2FsUG9zaXRpb24gPSBmdW5jdGlvbigpIHtcclxuICB2YXIgJG1vZGFsID0gZ2V0TW9kYWwoKTtcclxuICAkbW9kYWwuc3R5bGUubWFyZ2luVG9wID0gZ2V0VG9wTWFyZ2luKGdldE1vZGFsKCkpO1xyXG59O1xyXG5cclxuXHJcbmV4cG9ydCB7IFxyXG4gIHN3ZWV0QWxlcnRJbml0aWFsaXplLFxyXG4gIGdldE1vZGFsLFxyXG4gIGdldE92ZXJsYXksXHJcbiAgZ2V0SW5wdXQsXHJcbiAgc2V0Rm9jdXNTdHlsZSxcclxuICBvcGVuTW9kYWwsXHJcbiAgcmVzZXRJbnB1dCxcclxuICByZXNldElucHV0RXJyb3IsXHJcbiAgZml4VmVydGljYWxQb3NpdGlvblxyXG59O1xyXG4iLCJ2YXIgaW5qZWN0ZWRIVE1MID0gXHJcblxyXG4gIC8vIERhcmsgb3ZlcmxheVxyXG4gIGA8ZGl2IGNsYXNzPVwic3dlZXQtb3ZlcmxheVwiIHRhYkluZGV4PVwiLTFcIj48L2Rpdj5gICtcclxuXHJcbiAgLy8gTW9kYWxcclxuICBgPGRpdiBjbGFzcz1cInN3ZWV0LWFsZXJ0XCI+YCArXHJcblxyXG4gICAgLy8gRXJyb3IgaWNvblxyXG4gICAgYDxkaXYgY2xhc3M9XCJzYS1pY29uIHNhLWVycm9yXCI+XHJcbiAgICAgIDxzcGFuIGNsYXNzPVwic2EteC1tYXJrXCI+XHJcbiAgICAgICAgPHNwYW4gY2xhc3M9XCJzYS1saW5lIHNhLWxlZnRcIj48L3NwYW4+XHJcbiAgICAgICAgPHNwYW4gY2xhc3M9XCJzYS1saW5lIHNhLXJpZ2h0XCI+PC9zcGFuPlxyXG4gICAgICA8L3NwYW4+XHJcbiAgICA8L2Rpdj5gICtcclxuXHJcbiAgICAvLyBXYXJuaW5nIGljb25cclxuICAgIGA8ZGl2IGNsYXNzPVwic2EtaWNvbiBzYS13YXJuaW5nXCI+XHJcbiAgICAgIDxzcGFuIGNsYXNzPVwic2EtYm9keVwiPjwvc3Bhbj5cclxuICAgICAgPHNwYW4gY2xhc3M9XCJzYS1kb3RcIj48L3NwYW4+XHJcbiAgICA8L2Rpdj5gICtcclxuXHJcbiAgICAvLyBJbmZvIGljb25cclxuICAgIGA8ZGl2IGNsYXNzPVwic2EtaWNvbiBzYS1pbmZvXCI+PC9kaXY+YCArXHJcblxyXG4gICAgLy8gU3VjY2VzcyBpY29uXHJcbiAgICBgPGRpdiBjbGFzcz1cInNhLWljb24gc2Etc3VjY2Vzc1wiPlxyXG4gICAgICA8c3BhbiBjbGFzcz1cInNhLWxpbmUgc2EtdGlwXCI+PC9zcGFuPlxyXG4gICAgICA8c3BhbiBjbGFzcz1cInNhLWxpbmUgc2EtbG9uZ1wiPjwvc3Bhbj5cclxuXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJzYS1wbGFjZWhvbGRlclwiPjwvZGl2PlxyXG4gICAgICA8ZGl2IGNsYXNzPVwic2EtZml4XCI+PC9kaXY+XHJcbiAgICA8L2Rpdj5gICtcclxuXHJcbiAgICBgPGRpdiBjbGFzcz1cInNhLWljb24gc2EtY3VzdG9tXCI+PC9kaXY+YCArXHJcblxyXG4gICAgLy8gVGl0bGUsIHRleHQgYW5kIGlucHV0XHJcbiAgICBgPGgyPlRpdGxlPC9oMj5cclxuICAgIDxwPlRleHQ8L3A+XHJcbiAgICA8ZmllbGRzZXQ+XHJcbiAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIHRhYkluZGV4PVwiM1wiIC8+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJzYS1pbnB1dC1lcnJvclwiPjwvZGl2PlxyXG4gICAgPC9maWVsZHNldD5gICtcclxuXHJcbiAgICAvLyBJbnB1dCBlcnJvcnNcclxuICAgIGA8ZGl2IGNsYXNzPVwic2EtZXJyb3ItY29udGFpbmVyXCI+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJpY29uXCI+ITwvZGl2PlxyXG4gICAgICA8cD5Ob3QgdmFsaWQhPC9wPlxyXG4gICAgPC9kaXY+YCArXHJcblxyXG4gICAgLy8gQ2FuY2VsIGFuZCBjb25maXJtIGJ1dHRvbnNcclxuICAgIGA8ZGl2IGNsYXNzPVwic2EtYnV0dG9uLWNvbnRhaW5lclwiPlxyXG4gICAgICA8YnV0dG9uIGNsYXNzPVwiY2FuY2VsXCIgdGFiSW5kZXg9XCIyXCI+Q2FuY2VsPC9idXR0b24+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJzYS1jb25maXJtLWJ1dHRvbi1jb250YWluZXJcIj5cclxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwiY29uZmlybVwiIHRhYkluZGV4PVwiMVwiPk9LPC9idXR0b24+YCArIFxyXG5cclxuICAgICAgICAvLyBMb2FkaW5nIGFuaW1hdGlvblxyXG4gICAgICAgIGA8ZGl2IGNsYXNzPVwibGEtYmFsbC1mYWxsXCI+XHJcbiAgICAgICAgICA8ZGl2PjwvZGl2PlxyXG4gICAgICAgICAgPGRpdj48L2Rpdj5cclxuICAgICAgICAgIDxkaXY+PC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+YCArXHJcblxyXG4gIC8vIEVuZCBvZiBtb2RhbFxyXG4gIGA8L2Rpdj5gO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgaW5qZWN0ZWRIVE1MO1xyXG4iLCJ2YXIgYWxlcnRUeXBlcyA9IFsnZXJyb3InLCAnd2FybmluZycsICdpbmZvJywgJ3N1Y2Nlc3MnLCAnaW5wdXQnLCAncHJvbXB0J107XHJcblxyXG5pbXBvcnQge1xyXG4gIGlzSUU4XHJcbn0gZnJvbSAnLi91dGlscyc7XHJcblxyXG5pbXBvcnQge1xyXG4gIGdldE1vZGFsLFxyXG4gIGdldElucHV0LFxyXG4gIHNldEZvY3VzU3R5bGVcclxufSBmcm9tICcuL2hhbmRsZS1zd2FsLWRvbSc7XHJcblxyXG5pbXBvcnQge1xyXG4gIGhhc0NsYXNzLCBhZGRDbGFzcywgcmVtb3ZlQ2xhc3MsXHJcbiAgZXNjYXBlSHRtbCxcclxuICBfc2hvdywgc2hvdywgX2hpZGUsIGhpZGVcclxufSBmcm9tICcuL2hhbmRsZS1kb20nO1xyXG5cclxuXHJcbi8qXHJcbiAqIFNldCB0eXBlLCB0ZXh0IGFuZCBhY3Rpb25zIG9uIG1vZGFsXHJcbiAqL1xyXG52YXIgc2V0UGFyYW1ldGVycyA9IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gIHZhciBtb2RhbCA9IGdldE1vZGFsKCk7XHJcblxyXG4gIHZhciAkdGl0bGUgPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCdoMicpO1xyXG4gIHZhciAkdGV4dCA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJ3AnKTtcclxuICB2YXIgJGNhbmNlbEJ0biA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5jYW5jZWwnKTtcclxuICB2YXIgJGNvbmZpcm1CdG4gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCdidXR0b24uY29uZmlybScpO1xyXG5cclxuICAvKlxyXG4gICAqIFRpdGxlXHJcbiAgICovXHJcbiAgJHRpdGxlLmlubmVySFRNTCA9IHBhcmFtcy5odG1sID8gcGFyYW1zLnRpdGxlIDogZXNjYXBlSHRtbChwYXJhbXMudGl0bGUpLnNwbGl0KCdcXG4nKS5qb2luKCc8YnI+Jyk7XHJcblxyXG4gIC8qXHJcbiAgICogVGV4dFxyXG4gICAqL1xyXG4gICR0ZXh0LmlubmVySFRNTCA9IHBhcmFtcy5odG1sID8gcGFyYW1zLnRleHQgOiBlc2NhcGVIdG1sKHBhcmFtcy50ZXh0IHx8ICcnKS5zcGxpdCgnXFxuJykuam9pbignPGJyPicpO1xyXG4gIGlmIChwYXJhbXMudGV4dCkgc2hvdygkdGV4dCk7XHJcblxyXG4gIC8qXHJcbiAgICogQ3VzdG9tIGNsYXNzXHJcbiAgICovXHJcbiAgaWYgKHBhcmFtcy5jdXN0b21DbGFzcykge1xyXG4gICAgYWRkQ2xhc3MobW9kYWwsIHBhcmFtcy5jdXN0b21DbGFzcyk7XHJcbiAgICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtY3VzdG9tLWNsYXNzJywgcGFyYW1zLmN1c3RvbUNsYXNzKTtcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gRmluZCBwcmV2aW91c2x5IHNldCBjbGFzc2VzIGFuZCByZW1vdmUgdGhlbVxyXG4gICAgbGV0IGN1c3RvbUNsYXNzID0gbW9kYWwuZ2V0QXR0cmlidXRlKCdkYXRhLWN1c3RvbS1jbGFzcycpO1xyXG4gICAgcmVtb3ZlQ2xhc3MobW9kYWwsIGN1c3RvbUNsYXNzKTtcclxuICAgIG1vZGFsLnNldEF0dHJpYnV0ZSgnZGF0YS1jdXN0b20tY2xhc3MnLCAnJyk7XHJcbiAgfVxyXG5cclxuICAvKlxyXG4gICAqIEljb25cclxuICAgKi9cclxuICBoaWRlKG1vZGFsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zYS1pY29uJykpO1xyXG5cclxuICBpZiAocGFyYW1zLnR5cGUgJiYgIWlzSUU4KCkpIHtcclxuXHJcbiAgICBsZXQgdmFsaWRUeXBlID0gZmFsc2U7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGVydFR5cGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChwYXJhbXMudHlwZSA9PT0gYWxlcnRUeXBlc1tpXSkge1xyXG4gICAgICAgIHZhbGlkVHlwZSA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXZhbGlkVHlwZSkge1xyXG4gICAgICBsb2dTdHIoJ1Vua25vd24gYWxlcnQgdHlwZTogJyArIHBhcmFtcy50eXBlKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCB0eXBlc1dpdGhJY29ucyA9IFsnc3VjY2VzcycsICdlcnJvcicsICd3YXJuaW5nJywgJ2luZm8nXTtcclxuICAgIGxldCAkaWNvbjtcclxuXHJcbiAgICBpZiAodHlwZXNXaXRoSWNvbnMuaW5kZXhPZihwYXJhbXMudHlwZSkgIT09IC0xKSB7XHJcbiAgICAgICRpY29uID0gbW9kYWwucXVlcnlTZWxlY3RvcignLnNhLWljb24uJyArICdzYS0nICsgcGFyYW1zLnR5cGUpO1xyXG4gICAgICBzaG93KCRpY29uKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgJGlucHV0ID0gZ2V0SW5wdXQoKTtcclxuXHJcbiAgICAvLyBBbmltYXRlIGljb25cclxuICAgIHN3aXRjaCAocGFyYW1zLnR5cGUpIHtcclxuXHJcbiAgICAgIGNhc2UgJ3N1Y2Nlc3MnOlxyXG4gICAgICAgIGFkZENsYXNzKCRpY29uLCAnYW5pbWF0ZScpO1xyXG4gICAgICAgIGFkZENsYXNzKCRpY29uLnF1ZXJ5U2VsZWN0b3IoJy5zYS10aXAnKSwgJ2FuaW1hdGVTdWNjZXNzVGlwJyk7XHJcbiAgICAgICAgYWRkQ2xhc3MoJGljb24ucXVlcnlTZWxlY3RvcignLnNhLWxvbmcnKSwgJ2FuaW1hdGVTdWNjZXNzTG9uZycpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSAnZXJyb3InOlxyXG4gICAgICAgIGFkZENsYXNzKCRpY29uLCAnYW5pbWF0ZUVycm9ySWNvbicpO1xyXG4gICAgICAgIGFkZENsYXNzKCRpY29uLnF1ZXJ5U2VsZWN0b3IoJy5zYS14LW1hcmsnKSwgJ2FuaW1hdGVYTWFyaycpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSAnd2FybmluZyc6XHJcbiAgICAgICAgYWRkQ2xhc3MoJGljb24sICdwdWxzZVdhcm5pbmcnKTtcclxuICAgICAgICBhZGRDbGFzcygkaWNvbi5xdWVyeVNlbGVjdG9yKCcuc2EtYm9keScpLCAncHVsc2VXYXJuaW5nSW5zJyk7XHJcbiAgICAgICAgYWRkQ2xhc3MoJGljb24ucXVlcnlTZWxlY3RvcignLnNhLWRvdCcpLCAncHVsc2VXYXJuaW5nSW5zJyk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlICdpbnB1dCc6XHJcbiAgICAgIGNhc2UgJ3Byb21wdCc6XHJcbiAgICAgICAgJGlucHV0LnNldEF0dHJpYnV0ZSgndHlwZScsIHBhcmFtcy5pbnB1dFR5cGUpO1xyXG4gICAgICAgICRpbnB1dC52YWx1ZSA9IHBhcmFtcy5pbnB1dFZhbHVlO1xyXG4gICAgICAgICRpbnB1dC5zZXRBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyJywgcGFyYW1zLmlucHV0UGxhY2Vob2xkZXIpO1xyXG4gICAgICAgIGFkZENsYXNzKG1vZGFsLCAnc2hvdy1pbnB1dCcpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgJGlucHV0LmZvY3VzKCk7XHJcbiAgICAgICAgICAkaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBzd2FsLnJlc2V0SW5wdXRFcnJvcik7XHJcbiAgICAgICAgfSwgNDAwKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qXHJcbiAgICogQ3VzdG9tIGltYWdlXHJcbiAgICovXHJcbiAgaWYgKHBhcmFtcy5pbWFnZVVybCkge1xyXG4gICAgbGV0ICRjdXN0b21JY29uID0gbW9kYWwucXVlcnlTZWxlY3RvcignLnNhLWljb24uc2EtY3VzdG9tJyk7XHJcblxyXG4gICAgJGN1c3RvbUljb24uc3R5bGUuYmFja2dyb3VuZEltYWdlID0gJ3VybCgnICsgcGFyYW1zLmltYWdlVXJsICsgJyknO1xyXG4gICAgc2hvdygkY3VzdG9tSWNvbik7XHJcblxyXG4gICAgbGV0IF9pbWdXaWR0aCA9IDgwO1xyXG4gICAgbGV0IF9pbWdIZWlnaHQgPSA4MDtcclxuXHJcbiAgICBpZiAocGFyYW1zLmltYWdlU2l6ZSkge1xyXG4gICAgICBsZXQgZGltZW5zaW9ucyA9IHBhcmFtcy5pbWFnZVNpemUudG9TdHJpbmcoKS5zcGxpdCgneCcpO1xyXG4gICAgICBsZXQgaW1nV2lkdGggPSBkaW1lbnNpb25zWzBdO1xyXG4gICAgICBsZXQgaW1nSGVpZ2h0ID0gZGltZW5zaW9uc1sxXTtcclxuXHJcbiAgICAgIGlmICghaW1nV2lkdGggfHwgIWltZ0hlaWdodCkge1xyXG4gICAgICAgIGxvZ1N0cignUGFyYW1ldGVyIGltYWdlU2l6ZSBleHBlY3RzIHZhbHVlIHdpdGggZm9ybWF0IFdJRFRIeEhFSUdIVCwgZ290ICcgKyBwYXJhbXMuaW1hZ2VTaXplKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBfaW1nV2lkdGggPSBpbWdXaWR0aDtcclxuICAgICAgICBfaW1nSGVpZ2h0ID0gaW1nSGVpZ2h0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgJGN1c3RvbUljb24uc2V0QXR0cmlidXRlKCdzdHlsZScsICRjdXN0b21JY29uLmdldEF0dHJpYnV0ZSgnc3R5bGUnKSArICd3aWR0aDonICsgX2ltZ1dpZHRoICsgJ3B4OyBoZWlnaHQ6JyArIF9pbWdIZWlnaHQgKyAncHgnKTtcclxuICB9XHJcblxyXG4gIC8qXHJcbiAgICogU2hvdyBjYW5jZWwgYnV0dG9uP1xyXG4gICAqL1xyXG4gIG1vZGFsLnNldEF0dHJpYnV0ZSgnZGF0YS1oYXMtY2FuY2VsLWJ1dHRvbicsIHBhcmFtcy5zaG93Q2FuY2VsQnV0dG9uKTtcclxuICBpZiAocGFyYW1zLnNob3dDYW5jZWxCdXR0b24pIHtcclxuICAgICRjYW5jZWxCdG4uc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBoaWRlKCRjYW5jZWxCdG4pO1xyXG4gIH1cclxuXHJcbiAgLypcclxuICAgKiBTaG93IGNvbmZpcm0gYnV0dG9uP1xyXG4gICAqL1xyXG4gIG1vZGFsLnNldEF0dHJpYnV0ZSgnZGF0YS1oYXMtY29uZmlybS1idXR0b24nLCBwYXJhbXMuc2hvd0NvbmZpcm1CdXR0b24pO1xyXG4gIGlmIChwYXJhbXMuc2hvd0NvbmZpcm1CdXR0b24pIHtcclxuICAgICRjb25maXJtQnRuLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcclxuICB9IGVsc2Uge1xyXG4gICAgaGlkZSgkY29uZmlybUJ0bik7XHJcbiAgfVxyXG5cclxuICAvKlxyXG4gICAqIEN1c3RvbSB0ZXh0IG9uIGNhbmNlbC9jb25maXJtIGJ1dHRvbnNcclxuICAgKi9cclxuICBpZiAocGFyYW1zLmNhbmNlbEJ1dHRvblRleHQpIHtcclxuICAgICRjYW5jZWxCdG4uaW5uZXJIVE1MID0gZXNjYXBlSHRtbChwYXJhbXMuY2FuY2VsQnV0dG9uVGV4dCk7XHJcbiAgfVxyXG4gIGlmIChwYXJhbXMuY29uZmlybUJ1dHRvblRleHQpIHtcclxuICAgICRjb25maXJtQnRuLmlubmVySFRNTCA9IGVzY2FwZUh0bWwocGFyYW1zLmNvbmZpcm1CdXR0b25UZXh0KTtcclxuICB9XHJcblxyXG4gIC8qXHJcbiAgICogQ3VzdG9tIGNvbG9yIG9uIGNvbmZpcm0gYnV0dG9uXHJcbiAgICovXHJcbiAgaWYgKHBhcmFtcy5jb25maXJtQnV0dG9uQ29sb3IpIHtcclxuICAgIC8vIFNldCBjb25maXJtIGJ1dHRvbiB0byBzZWxlY3RlZCBiYWNrZ3JvdW5kIGNvbG9yXHJcbiAgICAkY29uZmlybUJ0bi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBwYXJhbXMuY29uZmlybUJ1dHRvbkNvbG9yO1xyXG5cclxuICAgIC8vIFNldCB0aGUgY29uZmlybSBidXR0b24gY29sb3IgdG8gdGhlIGxvYWRpbmcgcmluZ1xyXG4gICAgJGNvbmZpcm1CdG4uc3R5bGUuYm9yZGVyTGVmdENvbG9yID0gcGFyYW1zLmNvbmZpcm1Mb2FkaW5nQnV0dG9uQ29sb3I7XHJcbiAgICAkY29uZmlybUJ0bi5zdHlsZS5ib3JkZXJSaWdodENvbG9yID0gcGFyYW1zLmNvbmZpcm1Mb2FkaW5nQnV0dG9uQ29sb3I7XHJcblxyXG4gICAgLy8gU2V0IGJveC1zaGFkb3cgdG8gZGVmYXVsdCBmb2N1c2VkIGJ1dHRvblxyXG4gICAgc2V0Rm9jdXNTdHlsZSgkY29uZmlybUJ0biwgcGFyYW1zLmNvbmZpcm1CdXR0b25Db2xvcik7XHJcbiAgfVxyXG5cclxuICAvKlxyXG4gICAqIEFsbG93IG91dHNpZGUgY2xpY2tcclxuICAgKi9cclxuICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYWxsb3ctb3V0c2lkZS1jbGljaycsIHBhcmFtcy5hbGxvd091dHNpZGVDbGljayk7XHJcblxyXG4gIC8qXHJcbiAgICogQ2FsbGJhY2sgZnVuY3Rpb25cclxuICAgKi9cclxuICB2YXIgaGFzRG9uZUZ1bmN0aW9uID0gcGFyYW1zLmRvbmVGdW5jdGlvbiA/IHRydWUgOiBmYWxzZTtcclxuICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtaGFzLWRvbmUtZnVuY3Rpb24nLCBoYXNEb25lRnVuY3Rpb24pO1xyXG5cclxuICAvKlxyXG4gICAqIEFuaW1hdGlvblxyXG4gICAqL1xyXG4gIGlmICghcGFyYW1zLmFuaW1hdGlvbikge1xyXG4gICAgbW9kYWwuc2V0QXR0cmlidXRlKCdkYXRhLWFuaW1hdGlvbicsICdub25lJyk7XHJcbiAgfSBlbHNlIGlmICh0eXBlb2YgcGFyYW1zLmFuaW1hdGlvbiA9PT0gJ3N0cmluZycpIHtcclxuICAgIG1vZGFsLnNldEF0dHJpYnV0ZSgnZGF0YS1hbmltYXRpb24nLCBwYXJhbXMuYW5pbWF0aW9uKTsgLy8gQ3VzdG9tIGFuaW1hdGlvblxyXG4gIH0gZWxzZSB7XHJcbiAgICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYW5pbWF0aW9uJywgJ3BvcCcpO1xyXG4gIH1cclxuXHJcbiAgLypcclxuICAgKiBUaW1lclxyXG4gICAqL1xyXG4gIG1vZGFsLnNldEF0dHJpYnV0ZSgnZGF0YS10aW1lcicsIHBhcmFtcy50aW1lcik7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBzZXRQYXJhbWV0ZXJzO1xyXG4iLCIvKlxyXG4gKiBBbGxvdyB1c2VyIHRvIHBhc3MgdGhlaXIgb3duIHBhcmFtc1xyXG4gKi9cclxudmFyIGV4dGVuZCA9IGZ1bmN0aW9uKGEsIGIpIHtcclxuICBmb3IgKHZhciBrZXkgaW4gYikge1xyXG4gICAgaWYgKGIuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICBhW2tleV0gPSBiW2tleV07XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBhO1xyXG59O1xyXG5cclxuLypcclxuICogQ29udmVydCBIRVggY29kZXMgdG8gUkdCIHZhbHVlcyAoIzAwMDAwMCAtPiByZ2IoMCwwLDApKVxyXG4gKi9cclxudmFyIGhleFRvUmdiID0gZnVuY3Rpb24oaGV4KSB7XHJcbiAgdmFyIHJlc3VsdCA9IC9eIz8oW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkkL2kuZXhlYyhoZXgpO1xyXG4gIHJldHVybiByZXN1bHQgPyBwYXJzZUludChyZXN1bHRbMV0sIDE2KSArICcsICcgKyBwYXJzZUludChyZXN1bHRbMl0sIDE2KSArICcsICcgKyBwYXJzZUludChyZXN1bHRbM10sIDE2KSA6IG51bGw7XHJcbn07XHJcblxyXG4vKlxyXG4gKiBDaGVjayBpZiB0aGUgdXNlciBpcyB1c2luZyBJbnRlcm5ldCBFeHBsb3JlciA4IChmb3IgZmFsbGJhY2tzKVxyXG4gKi9cclxudmFyIGlzSUU4ID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuICh3aW5kb3cuYXR0YWNoRXZlbnQgJiYgIXdpbmRvdy5hZGRFdmVudExpc3RlbmVyKTtcclxufTtcclxuXHJcbi8qXHJcbiAqIElFIGNvbXBhdGlibGUgbG9nZ2luZyBmb3IgZGV2ZWxvcGVyc1xyXG4gKi9cclxudmFyIGxvZ1N0ciA9IGZ1bmN0aW9uKHN0cmluZykge1xyXG4gIGlmICh3aW5kb3cuY29uc29sZSkge1xyXG4gICAgLy8gSUUuLi5cclxuICAgIHdpbmRvdy5jb25zb2xlLmxvZygnU3dlZXRBbGVydDogJyArIHN0cmluZyk7XHJcbiAgfVxyXG59O1xyXG5cclxuLypcclxuICogU2V0IGhvdmVyLCBhY3RpdmUgYW5kIGZvY3VzLXN0YXRlcyBmb3IgYnV0dG9ucyBcclxuICogKHNvdXJjZTogaHR0cDovL3d3dy5zaXRlcG9pbnQuY29tL2phdmFzY3JpcHQtZ2VuZXJhdGUtbGlnaHRlci1kYXJrZXItY29sb3IpXHJcbiAqL1xyXG52YXIgY29sb3JMdW1pbmFuY2UgPSBmdW5jdGlvbihoZXgsIGx1bSkge1xyXG4gIC8vIFZhbGlkYXRlIGhleCBzdHJpbmdcclxuICBoZXggPSBTdHJpbmcoaGV4KS5yZXBsYWNlKC9bXjAtOWEtZl0vZ2ksICcnKTtcclxuICBpZiAoaGV4Lmxlbmd0aCA8IDYpIHtcclxuICAgIGhleCA9IGhleFswXSArIGhleFswXSArIGhleFsxXSArIGhleFsxXSArIGhleFsyXSArIGhleFsyXTtcclxuICB9XHJcbiAgbHVtID0gbHVtIHx8IDA7XHJcblxyXG4gIC8vIENvbnZlcnQgdG8gZGVjaW1hbCBhbmQgY2hhbmdlIGx1bWlub3NpdHlcclxuICB2YXIgcmdiID0gJyMnO1xyXG4gIHZhciBjO1xyXG4gIHZhciBpO1xyXG5cclxuICBmb3IgKGkgPSAwOyBpIDwgMzsgaSsrKSB7XHJcbiAgICBjID0gcGFyc2VJbnQoaGV4LnN1YnN0cihpICogMiwgMiksIDE2KTtcclxuICAgIGMgPSBNYXRoLnJvdW5kKE1hdGgubWluKE1hdGgubWF4KDAsIGMgKyBjICogbHVtKSwgMjU1KSkudG9TdHJpbmcoMTYpO1xyXG4gICAgcmdiICs9ICgnMDAnICsgYykuc3Vic3RyKGMubGVuZ3RoKTtcclxuICB9XHJcblxyXG4gIHJldHVybiByZ2I7XHJcbn07XHJcblxyXG5cclxuZXhwb3J0IHtcclxuICBleHRlbmQsXHJcbiAgaGV4VG9SZ2IsXHJcbiAgaXNJRTgsXHJcbiAgbG9nU3RyLFxyXG4gIGNvbG9yTHVtaW5hbmNlXHJcbn07XHJcbiJdfQ==

  
  /*
   * Use SweetAlert with RequireJS
   */
  
  if (typeof define === 'function' && define.amd) {
    define(function () {
      return sweetAlert;
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = sweetAlert;
  }

})(window, document);