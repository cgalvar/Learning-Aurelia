/* */ 
(function(process) {
  var componentHandler = (function() {
    'use strict';
    var registeredComponents_ = [];
    var createdComponents_ = [];
    var downgradeMethod_ = 'mdlDowngrade_';
    var componentConfigProperty_ = 'mdlComponentConfigInternal_';
    function findRegisteredClass_(name, optReplace) {
      for (var i = 0; i < registeredComponents_.length; i++) {
        if (registeredComponents_[i].className === name) {
          if (optReplace !== undefined) {
            registeredComponents_[i] = optReplace;
          }
          return registeredComponents_[i];
        }
      }
      return false;
    }
    function upgradeDomInternal(jsClass, cssClass) {
      if (jsClass === undefined && cssClass === undefined) {
        for (var i = 0; i < registeredComponents_.length; i++) {
          upgradeDomInternal(registeredComponents_[i].className, registeredComponents_[i].cssClass);
        }
      } else {
        if (cssClass === undefined) {
          var registeredClass = findRegisteredClass_(jsClass);
          if (registeredClass) {
            cssClass = registeredClass.cssClass;
          }
        }
        var elements = document.querySelectorAll('.' + cssClass);
        for (var n = 0; n < elements.length; n++) {
          upgradeElementInternal(elements[n], jsClass);
        }
      }
    }
    function upgradeElementInternal(element, jsClass) {
      var dataUpgraded = element.getAttribute('data-upgraded');
      if (dataUpgraded === null || dataUpgraded.indexOf(jsClass) === -1) {
        if (dataUpgraded === null) {
          dataUpgraded = '';
        }
        element.setAttribute('data-upgraded', dataUpgraded + ',' + jsClass);
        var registeredClass = findRegisteredClass_(jsClass);
        if (registeredClass) {
          var instance = new registeredClass.classConstructor(element);
          instance[componentConfigProperty_] = registeredClass;
          createdComponents_.push(instance);
          registeredClass.callbacks.forEach(function(callback) {
            callback(element);
          });
          if (registeredClass.widget) {
            element[jsClass] = instance;
          }
        } else {
          throw 'Unable to find a registered component for the given class.';
        }
        var ev = document.createEvent('Events');
        ev.initEvent('mdl-componentupgraded', true, true);
        element.dispatchEvent(ev);
      }
    }
    function registerInternal(config) {
      var newConfig = {
        'classConstructor': config.constructor,
        'className': config.classAsString,
        'cssClass': config.cssClass,
        'widget': config.widget === undefined ? true : config.widget,
        'callbacks': []
      };
      registeredComponents_.forEach(function(item) {
        if (item.cssClass === newConfig.cssClass) {
          throw 'The provided cssClass has already been registered.';
        }
        if (item.className === newConfig.className) {
          throw 'The provided className has already been registered';
        }
      });
      if (config.constructor.prototype.hasOwnProperty(componentConfigProperty_)) {
        throw 'MDL component classes must not have ' + componentConfigProperty_ + ' defined as a property.';
      }
      var found = findRegisteredClass_(config.classAsString, newConfig);
      if (!found) {
        registeredComponents_.push(newConfig);
      }
    }
    function registerUpgradedCallbackInternal(jsClass, callback) {
      var regClass = findRegisteredClass_(jsClass);
      if (regClass) {
        regClass.callbacks.push(callback);
      }
    }
    function upgradeAllRegisteredInternal() {
      for (var n = 0; n < registeredComponents_.length; n++) {
        upgradeDomInternal(registeredComponents_[n].className);
      }
    }
    function findCreatedComponentByNodeInternal(node) {
      for (var n = 0; n < createdComponents_.length; n++) {
        var component = createdComponents_[n];
        if (component.element_ === node) {
          return component;
        }
      }
    }
    function deconstructComponentInternal(component) {
      if (component && component[componentConfigProperty_].classConstructor.prototype.hasOwnProperty(downgradeMethod_)) {
        component[downgradeMethod_]();
        var componentIndex = createdComponents_.indexOf(component);
        createdComponents_.splice(componentIndex, 1);
        var upgrades = component.element_.dataset.upgraded.split(',');
        var componentPlace = upgrades.indexOf(component[componentConfigProperty_].classAsString);
        upgrades.splice(componentPlace, 1);
        component.element_.dataset.upgraded = upgrades.join(',');
        var ev = document.createEvent('Events');
        ev.initEvent('mdl-componentdowngraded', true, true);
        component.element_.dispatchEvent(ev);
      }
    }
    function downgradeNodesInternal(nodes) {
      var downgradeNode = function(node) {
        deconstructComponentInternal(findCreatedComponentByNodeInternal(node));
      };
      if (nodes instanceof Array || nodes instanceof NodeList) {
        for (var n = 0; n < nodes.length; n++) {
          downgradeNode(nodes[n]);
        }
      } else if (nodes instanceof Node) {
        downgradeNode(nodes);
      } else {
        throw 'Invalid argument provided to downgrade MDL nodes.';
      }
    }
    return {
      upgradeDom: upgradeDomInternal,
      upgradeElement: upgradeElementInternal,
      upgradeAllRegistered: upgradeAllRegisteredInternal,
      registerUpgradedCallback: registerUpgradedCallbackInternal,
      register: registerInternal,
      downgradeElements: downgradeNodesInternal
    };
  })();
  window.addEventListener('load', function() {
    'use strict';
    if ('classList' in document.createElement('div') && 'querySelector' in document && 'addEventListener' in window && Array.prototype.forEach) {
      document.documentElement.classList.add('mdl-js');
      componentHandler.upgradeAllRegistered();
    } else {
      componentHandler.upgradeElement = componentHandler.register = function() {};
    }
  });
  (function() {
    'use strict';
    if (!Date.now) {
      Date.now = function() {
        return new Date().getTime();
      };
    }
    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
      var vp = vendors[i];
      window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = (window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame']);
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
      var lastTime = 0;
      window.requestAnimationFrame = function(callback) {
        var now = Date.now();
        var nextTime = Math.max(lastTime + 16, now);
        return setTimeout(function() {
          callback(lastTime = nextTime);
        }, nextTime - now);
      };
      window.cancelAnimationFrame = clearTimeout;
    }
  })();
  function MaterialButton(element) {
    'use strict';
    this.element_ = element;
    this.init();
  }
  MaterialButton.prototype.Constant_ = {};
  MaterialButton.prototype.CssClasses_ = {
    RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_CONTAINER: 'mdl-button__ripple-container',
    RIPPLE: 'mdl-ripple'
  };
  MaterialButton.prototype.blurHandler = function(event) {
    'use strict';
    if (event) {
      this.element_.blur();
    }
  };
  MaterialButton.prototype.disable = function() {
    'use strict';
    this.element_.disabled = true;
  };
  MaterialButton.prototype.enable = function() {
    'use strict';
    this.element_.disabled = false;
  };
  MaterialButton.prototype.init = function() {
    'use strict';
    if (this.element_) {
      if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
        var rippleContainer = document.createElement('span');
        rippleContainer.classList.add(this.CssClasses_.RIPPLE_CONTAINER);
        this.rippleElement_ = document.createElement('span');
        this.rippleElement_.classList.add(this.CssClasses_.RIPPLE);
        rippleContainer.appendChild(this.rippleElement_);
        this.boundRippleBlurHandler = this.blurHandler.bind(this);
        this.rippleElement_.addEventListener('mouseup', this.boundRippleBlurHandler);
        this.element_.appendChild(rippleContainer);
      }
      this.boundButtonBlurHandler = this.blurHandler.bind(this);
      this.element_.addEventListener('mouseup', this.boundButtonBlurHandler);
      this.element_.addEventListener('mouseleave', this.boundButtonBlurHandler);
    }
  };
  MaterialButton.prototype.mdlDowngrade_ = function() {
    'use strict';
    if (this.rippleElement_) {
      this.rippleElement_.removeEventListener('mouseup', this.boundRippleBlurHandler);
    }
    this.element_.removeEventListener('mouseup', this.boundButtonBlurHandler);
    this.element_.removeEventListener('mouseleave', this.boundButtonBlurHandler);
  };
  componentHandler.register({
    constructor: MaterialButton,
    classAsString: 'MaterialButton',
    cssClass: 'mdl-js-button'
  });
  function MaterialCheckbox(element) {
    'use strict';
    this.element_ = element;
    this.init();
  }
  MaterialCheckbox.prototype.Constant_ = {TINY_TIMEOUT: 0.001};
  MaterialCheckbox.prototype.CssClasses_ = {
    INPUT: 'mdl-checkbox__input',
    BOX_OUTLINE: 'mdl-checkbox__box-outline',
    FOCUS_HELPER: 'mdl-checkbox__focus-helper',
    TICK_OUTLINE: 'mdl-checkbox__tick-outline',
    RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
    RIPPLE_CONTAINER: 'mdl-checkbox__ripple-container',
    RIPPLE_CENTER: 'mdl-ripple--center',
    RIPPLE: 'mdl-ripple',
    IS_FOCUSED: 'is-focused',
    IS_DISABLED: 'is-disabled',
    IS_CHECKED: 'is-checked',
    IS_UPGRADED: 'is-upgraded'
  };
  MaterialCheckbox.prototype.onChange_ = function(event) {
    'use strict';
    this.updateClasses_();
  };
  MaterialCheckbox.prototype.onFocus_ = function(event) {
    'use strict';
    this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
  };
  MaterialCheckbox.prototype.onBlur_ = function(event) {
    'use strict';
    this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
  };
  MaterialCheckbox.prototype.onMouseUp_ = function(event) {
    'use strict';
    this.blur_();
  };
  MaterialCheckbox.prototype.updateClasses_ = function() {
    'use strict';
    if (this.inputElement_.disabled) {
      this.element_.classList.add(this.CssClasses_.IS_DISABLED);
    } else {
      this.element_.classList.remove(this.CssClasses_.IS_DISABLED);
    }
    if (this.inputElement_.checked) {
      this.element_.classList.add(this.CssClasses_.IS_CHECKED);
    } else {
      this.element_.classList.remove(this.CssClasses_.IS_CHECKED);
    }
  };
  MaterialCheckbox.prototype.blur_ = function(event) {
    'use strict';
    window.setTimeout(function() {
      this.inputElement_.blur();
    }.bind(this), this.Constant_.TINY_TIMEOUT);
  };
  MaterialCheckbox.prototype.disable = function() {
    'use strict';
    this.inputElement_.disabled = true;
    this.updateClasses_();
  };
  MaterialCheckbox.prototype.enable = function() {
    'use strict';
    this.inputElement_.disabled = false;
    this.updateClasses_();
  };
  MaterialCheckbox.prototype.check = function() {
    'use strict';
    this.inputElement_.checked = true;
    this.updateClasses_();
  };
  MaterialCheckbox.prototype.uncheck = function() {
    'use strict';
    this.inputElement_.checked = false;
    this.updateClasses_();
  };
  MaterialCheckbox.prototype.init = function() {
    'use strict';
    if (this.element_) {
      this.inputElement_ = this.element_.querySelector('.' + this.CssClasses_.INPUT);
      var boxOutline = document.createElement('span');
      boxOutline.classList.add(this.CssClasses_.BOX_OUTLINE);
      var tickContainer = document.createElement('span');
      tickContainer.classList.add(this.CssClasses_.FOCUS_HELPER);
      var tickOutline = document.createElement('span');
      tickOutline.classList.add(this.CssClasses_.TICK_OUTLINE);
      boxOutline.appendChild(tickOutline);
      this.element_.appendChild(tickContainer);
      this.element_.appendChild(boxOutline);
      if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
        this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
        this.rippleContainerElement_ = document.createElement('span');
        this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CONTAINER);
        this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_EFFECT);
        this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CENTER);
        this.boundRippleMouseUp = this.onMouseUp_.bind(this);
        this.rippleContainerElement_.addEventListener('mouseup', this.boundRippleMouseUp);
        var ripple = document.createElement('span');
        ripple.classList.add(this.CssClasses_.RIPPLE);
        this.rippleContainerElement_.appendChild(ripple);
        this.element_.appendChild(this.rippleContainerElement_);
      }
      this.boundInputOnChange = this.onChange_.bind(this);
      this.boundInputOnFocus = this.onFocus_.bind(this);
      this.boundInputOnBlur = this.onBlur_.bind(this);
      this.boundElementMouseUp = this.onMouseUp_.bind(this);
      this.inputElement_.addEventListener('change', this.boundInputOnChange);
      this.inputElement_.addEventListener('focus', this.boundInputOnFocus);
      this.inputElement_.addEventListener('blur', this.boundInputOnBlur);
      this.element_.addEventListener('mouseup', this.boundElementMouseUp);
      this.updateClasses_();
      this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
    }
  };
  MaterialCheckbox.prototype.mdlDowngrade_ = function() {
    'use strict';
    if (this.rippleContainerElement_) {
      this.rippleContainerElement_.removeEventListener('mouseup', this.boundRippleMouseUp);
    }
    this.inputElement_.removeEventListener('change', this.boundInputOnChange);
    this.inputElement_.removeEventListener('focus', this.boundInputOnFocus);
    this.inputElement_.removeEventListener('blur', this.boundInputOnBlur);
    this.element_.removeEventListener('mouseup', this.boundElementMouseUp);
  };
  componentHandler.register({
    constructor: MaterialCheckbox,
    classAsString: 'MaterialCheckbox',
    cssClass: 'mdl-js-checkbox'
  });
  function MaterialIconToggle(element) {
    'use strict';
    this.element_ = element;
    this.init();
  }
  MaterialIconToggle.prototype.Constant_ = {TINY_TIMEOUT: 0.001};
  MaterialIconToggle.prototype.CssClasses_ = {
    INPUT: 'mdl-icon-toggle__input',
    JS_RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
    RIPPLE_CONTAINER: 'mdl-icon-toggle__ripple-container',
    RIPPLE_CENTER: 'mdl-ripple--center',
    RIPPLE: 'mdl-ripple',
    IS_FOCUSED: 'is-focused',
    IS_DISABLED: 'is-disabled',
    IS_CHECKED: 'is-checked'
  };
  MaterialIconToggle.prototype.onChange_ = function(event) {
    'use strict';
    this.updateClasses_();
  };
  MaterialIconToggle.prototype.onFocus_ = function(event) {
    'use strict';
    this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
  };
  MaterialIconToggle.prototype.onBlur_ = function(event) {
    'use strict';
    this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
  };
  MaterialIconToggle.prototype.onMouseUp_ = function(event) {
    'use strict';
    this.blur_();
  };
  MaterialIconToggle.prototype.updateClasses_ = function() {
    'use strict';
    if (this.inputElement_.disabled) {
      this.element_.classList.add(this.CssClasses_.IS_DISABLED);
    } else {
      this.element_.classList.remove(this.CssClasses_.IS_DISABLED);
    }
    if (this.inputElement_.checked) {
      this.element_.classList.add(this.CssClasses_.IS_CHECKED);
    } else {
      this.element_.classList.remove(this.CssClasses_.IS_CHECKED);
    }
  };
  MaterialIconToggle.prototype.blur_ = function(event) {
    'use strict';
    window.setTimeout(function() {
      this.inputElement_.blur();
    }.bind(this), this.Constant_.TINY_TIMEOUT);
  };
  MaterialIconToggle.prototype.disable = function() {
    'use strict';
    this.inputElement_.disabled = true;
    this.updateClasses_();
  };
  MaterialIconToggle.prototype.enable = function() {
    'use strict';
    this.inputElement_.disabled = false;
    this.updateClasses_();
  };
  MaterialIconToggle.prototype.check = function() {
    'use strict';
    this.inputElement_.checked = true;
    this.updateClasses_();
  };
  MaterialIconToggle.prototype.uncheck = function() {
    'use strict';
    this.inputElement_.checked = false;
    this.updateClasses_();
  };
  MaterialIconToggle.prototype.init = function() {
    'use strict';
    if (this.element_) {
      this.inputElement_ = this.element_.querySelector('.' + this.CssClasses_.INPUT);
      if (this.element_.classList.contains(this.CssClasses_.JS_RIPPLE_EFFECT)) {
        this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
        this.rippleContainerElement_ = document.createElement('span');
        this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CONTAINER);
        this.rippleContainerElement_.classList.add(this.CssClasses_.JS_RIPPLE_EFFECT);
        this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CENTER);
        this.boundRippleMouseUp = this.onMouseUp_.bind(this);
        this.rippleContainerElement_.addEventListener('mouseup', this.boundRippleMouseUp);
        var ripple = document.createElement('span');
        ripple.classList.add(this.CssClasses_.RIPPLE);
        this.rippleContainerElement_.appendChild(ripple);
        this.element_.appendChild(this.rippleContainerElement_);
      }
      this.boundInputOnChange = this.onChange_.bind(this);
      this.boundInputOnFocus = this.onFocus_.bind(this);
      this.boundInputOnBlur = this.onBlur_.bind(this);
      this.boundElementOnMouseUp = this.onMouseUp_.bind(this);
      this.inputElement_.addEventListener('change', this.boundInputOnChange);
      this.inputElement_.addEventListener('focus', this.boundInputOnFocus);
      this.inputElement_.addEventListener('blur', this.boundInputOnBlur);
      this.element_.addEventListener('mouseup', this.boundElementOnMouseUp);
      this.updateClasses_();
      this.element_.classList.add('is-upgraded');
    }
  };
  MaterialIconToggle.prototype.mdlDowngrade_ = function() {
    'use strict';
    if (this.rippleContainerElement_) {
      this.rippleContainerElement_.removeEventListener('mouseup', this.boundRippleMouseUp);
    }
    this.inputElement_.removeEventListener('change', this.boundInputOnChange);
    this.inputElement_.removeEventListener('focus', this.boundInputOnFocus);
    this.inputElement_.removeEventListener('blur', this.boundInputOnBlur);
    this.element_.removeEventListener('mouseup', this.boundElementOnMouseUp);
  };
  componentHandler.register({
    constructor: MaterialIconToggle,
    classAsString: 'MaterialIconToggle',
    cssClass: 'mdl-js-icon-toggle'
  });
  function MaterialMenu(element) {
    'use strict';
    this.element_ = element;
    this.init();
  }
  MaterialMenu.prototype.Constant_ = {
    TRANSITION_DURATION_SECONDS: 0.3,
    TRANSITION_DURATION_FRACTION: 0.8,
    CLOSE_TIMEOUT: 150
  };
  MaterialMenu.prototype.Keycodes_ = {
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32,
    UP_ARROW: 38,
    DOWN_ARROW: 40
  };
  MaterialMenu.prototype.CssClasses_ = {
    CONTAINER: 'mdl-menu__container',
    OUTLINE: 'mdl-menu__outline',
    ITEM: 'mdl-menu__item',
    ITEM_RIPPLE_CONTAINER: 'mdl-menu__item-ripple-container',
    RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
    RIPPLE: 'mdl-ripple',
    IS_UPGRADED: 'is-upgraded',
    IS_VISIBLE: 'is-visible',
    IS_ANIMATING: 'is-animating',
    BOTTOM_LEFT: 'mdl-menu--bottom-left',
    BOTTOM_RIGHT: 'mdl-menu--bottom-right',
    TOP_LEFT: 'mdl-menu--top-left',
    TOP_RIGHT: 'mdl-menu--top-right',
    UNALIGNED: 'mdl-menu--unaligned'
  };
  MaterialMenu.prototype.init = function() {
    'use strict';
    if (this.element_) {
      var container = document.createElement('div');
      container.classList.add(this.CssClasses_.CONTAINER);
      this.element_.parentElement.insertBefore(container, this.element_);
      this.element_.parentElement.removeChild(this.element_);
      container.appendChild(this.element_);
      this.container_ = container;
      var outline = document.createElement('div');
      outline.classList.add(this.CssClasses_.OUTLINE);
      this.outline_ = outline;
      container.insertBefore(outline, this.element_);
      var forElId = this.element_.getAttribute('for');
      var forEl = null;
      if (forElId) {
        forEl = document.getElementById(forElId);
        if (forEl) {
          this.forElement_ = forEl;
          forEl.addEventListener('click', this.handleForClick_.bind(this));
          forEl.addEventListener('keydown', this.handleForKeyboardEvent_.bind(this));
        }
      }
      var items = this.element_.querySelectorAll('.' + this.CssClasses_.ITEM);
      for (var i = 0; i < items.length; i++) {
        items[i].addEventListener('click', this.handleItemClick_.bind(this));
        items[i].tabIndex = '-1';
        items[i].addEventListener('keydown', this.handleItemKeyboardEvent_.bind(this));
      }
      if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
        this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
        for (i = 0; i < items.length; i++) {
          var item = items[i];
          var rippleContainer = document.createElement('span');
          rippleContainer.classList.add(this.CssClasses_.ITEM_RIPPLE_CONTAINER);
          var ripple = document.createElement('span');
          ripple.classList.add(this.CssClasses_.RIPPLE);
          rippleContainer.appendChild(ripple);
          item.appendChild(rippleContainer);
          item.classList.add(this.CssClasses_.RIPPLE_EFFECT);
        }
      }
      if (this.element_.classList.contains(this.CssClasses_.BOTTOM_LEFT)) {
        this.outline_.classList.add(this.CssClasses_.BOTTOM_LEFT);
      }
      if (this.element_.classList.contains(this.CssClasses_.BOTTOM_RIGHT)) {
        this.outline_.classList.add(this.CssClasses_.BOTTOM_RIGHT);
      }
      if (this.element_.classList.contains(this.CssClasses_.TOP_LEFT)) {
        this.outline_.classList.add(this.CssClasses_.TOP_LEFT);
      }
      if (this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)) {
        this.outline_.classList.add(this.CssClasses_.TOP_RIGHT);
      }
      if (this.element_.classList.contains(this.CssClasses_.UNALIGNED)) {
        this.outline_.classList.add(this.CssClasses_.UNALIGNED);
      }
      container.classList.add(this.CssClasses_.IS_UPGRADED);
    }
  };
  MaterialMenu.prototype.handleForClick_ = function(evt) {
    'use strict';
    if (this.element_ && this.forElement_) {
      var rect = this.forElement_.getBoundingClientRect();
      var forRect = this.forElement_.parentElement.getBoundingClientRect();
      if (this.element_.classList.contains(this.CssClasses_.UNALIGNED)) {} else if (this.element_.classList.contains(this.CssClasses_.BOTTOM_RIGHT)) {
        this.container_.style.right = (forRect.right - rect.right) + 'px';
        this.container_.style.top = this.forElement_.offsetTop + this.forElement_.offsetHeight + 'px';
      } else if (this.element_.classList.contains(this.CssClasses_.TOP_LEFT)) {
        this.container_.style.left = this.forElement_.offsetLeft + 'px';
        this.container_.style.bottom = (forRect.bottom - rect.top) + 'px';
      } else if (this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)) {
        this.container_.style.right = (forRect.right - rect.right) + 'px';
        this.container_.style.bottom = (forRect.bottom - rect.top) + 'px';
      } else {
        this.container_.style.left = this.forElement_.offsetLeft + 'px';
        this.container_.style.top = this.forElement_.offsetTop + this.forElement_.offsetHeight + 'px';
      }
    }
    this.toggle(evt);
  };
  MaterialMenu.prototype.handleForKeyboardEvent_ = function(evt) {
    'use strict';
    if (this.element_ && this.container_ && this.forElement_) {
      var items = this.element_.querySelectorAll('.' + this.CssClasses_.ITEM + ':not([disabled])');
      if (items && items.length > 0 && this.container_.classList.contains(this.CssClasses_.IS_VISIBLE)) {
        if (evt.keyCode === this.Keycodes_.UP_ARROW) {
          evt.preventDefault();
          items[items.length - 1].focus();
        } else if (evt.keyCode === this.Keycodes_.DOWN_ARROW) {
          evt.preventDefault();
          items[0].focus();
        }
      }
    }
  };
  MaterialMenu.prototype.handleItemKeyboardEvent_ = function(evt) {
    'use strict';
    if (this.element_ && this.container_) {
      var items = this.element_.querySelectorAll('.' + this.CssClasses_.ITEM + ':not([disabled])');
      if (items && items.length > 0 && this.container_.classList.contains(this.CssClasses_.IS_VISIBLE)) {
        var currentIndex = Array.prototype.slice.call(items).indexOf(evt.target);
        if (evt.keyCode === this.Keycodes_.UP_ARROW) {
          evt.preventDefault();
          if (currentIndex > 0) {
            items[currentIndex - 1].focus();
          } else {
            items[items.length - 1].focus();
          }
        } else if (evt.keyCode === this.Keycodes_.DOWN_ARROW) {
          evt.preventDefault();
          if (items.length > currentIndex + 1) {
            items[currentIndex + 1].focus();
          } else {
            items[0].focus();
          }
        } else if (evt.keyCode === this.Keycodes_.SPACE || evt.keyCode === this.Keycodes_.ENTER) {
          evt.preventDefault();
          var e = new MouseEvent('mousedown');
          evt.target.dispatchEvent(e);
          e = new MouseEvent('mouseup');
          evt.target.dispatchEvent(e);
          evt.target.click();
        } else if (evt.keyCode === this.Keycodes_.ESCAPE) {
          evt.preventDefault();
          this.hide();
        }
      }
    }
  };
  MaterialMenu.prototype.handleItemClick_ = function(evt) {
    'use strict';
    if (evt.target.getAttribute('disabled') !== null) {
      evt.stopPropagation();
    } else {
      this.closing_ = true;
      window.setTimeout(function(evt) {
        this.hide();
        this.closing_ = false;
      }.bind(this), this.Constant_.CLOSE_TIMEOUT);
    }
  };
  MaterialMenu.prototype.applyClip_ = function(height, width) {
    'use strict';
    if (this.element_.classList.contains(this.CssClasses_.UNALIGNED)) {
      this.element_.style.clip = null;
    } else if (this.element_.classList.contains(this.CssClasses_.BOTTOM_RIGHT)) {
      this.element_.style.clip = 'rect(0 ' + width + 'px ' + '0 ' + width + 'px)';
    } else if (this.element_.classList.contains(this.CssClasses_.TOP_LEFT)) {
      this.element_.style.clip = 'rect(' + height + 'px 0 ' + height + 'px 0)';
    } else if (this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)) {
      this.element_.style.clip = 'rect(' + height + 'px ' + width + 'px ' + height + 'px ' + width + 'px)';
    } else {
      this.element_.style.clip = null;
    }
  };
  MaterialMenu.prototype.addAnimationEndListener_ = function() {
    'use strict';
    var cleanup = function() {
      this.element_.classList.remove(this.CssClasses_.IS_ANIMATING);
    }.bind(this);
    this.element_.addEventListener('transitionend', cleanup);
    this.element_.addEventListener('webkitTransitionEnd', cleanup);
  };
  MaterialMenu.prototype.show = function(evt) {
    'use strict';
    if (this.element_ && this.container_ && this.outline_) {
      var height = this.element_.getBoundingClientRect().height;
      var width = this.element_.getBoundingClientRect().width;
      this.container_.style.width = width + 'px';
      this.container_.style.height = height + 'px';
      this.outline_.style.width = width + 'px';
      this.outline_.style.height = height + 'px';
      var transitionDuration = this.Constant_.TRANSITION_DURATION_SECONDS * this.Constant_.TRANSITION_DURATION_FRACTION;
      var items = this.element_.querySelectorAll('.' + this.CssClasses_.ITEM);
      for (var i = 0; i < items.length; i++) {
        var itemDelay = null;
        if (this.element_.classList.contains(this.CssClasses_.TOP_LEFT) || this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)) {
          itemDelay = ((height - items[i].offsetTop - items[i].offsetHeight) / height * transitionDuration) + 's';
        } else {
          itemDelay = (items[i].offsetTop / height * transitionDuration) + 's';
        }
        items[i].style.transitionDelay = itemDelay;
      }
      this.applyClip_(height, width);
      window.requestAnimationFrame(function() {
        this.element_.classList.add(this.CssClasses_.IS_ANIMATING);
        this.element_.style.clip = 'rect(0 ' + width + 'px ' + height + 'px 0)';
        this.container_.classList.add(this.CssClasses_.IS_VISIBLE);
      }.bind(this));
      this.addAnimationEndListener_();
      var callback = function(e) {
        if (e !== evt && !this.closing_) {
          document.removeEventListener('click', callback);
          this.hide();
        }
      }.bind(this);
      document.addEventListener('click', callback);
    }
  };
  MaterialMenu.prototype.hide = function() {
    'use strict';
    if (this.element_ && this.container_ && this.outline_) {
      var items = this.element_.querySelectorAll('.' + this.CssClasses_.ITEM);
      for (var i = 0; i < items.length; i++) {
        items[i].style.transitionDelay = null;
      }
      var height = this.element_.getBoundingClientRect().height;
      var width = this.element_.getBoundingClientRect().width;
      this.element_.classList.add(this.CssClasses_.IS_ANIMATING);
      this.applyClip_(height, width);
      this.container_.classList.remove(this.CssClasses_.IS_VISIBLE);
      this.addAnimationEndListener_();
    }
  };
  MaterialMenu.prototype.toggle = function(evt) {
    'use strict';
    if (this.container_.classList.contains(this.CssClasses_.IS_VISIBLE)) {
      this.hide();
    } else {
      this.show(evt);
    }
  };
  componentHandler.register({
    constructor: MaterialMenu,
    classAsString: 'MaterialMenu',
    cssClass: 'mdl-js-menu'
  });
  function MaterialProgress(element) {
    'use strict';
    this.element_ = element;
    this.init();
  }
  MaterialProgress.prototype.Constant_ = {};
  MaterialProgress.prototype.CssClasses_ = {INDETERMINATE_CLASS: 'mdl-progress__indeterminate'};
  MaterialProgress.prototype.setProgress = function(p) {
    'use strict';
    if (this.element_.classList.contains(this.CssClasses_.INDETERMINATE_CLASS)) {
      return ;
    }
    this.progressbar_.style.width = p + '%';
  };
  MaterialProgress.prototype.setBuffer = function(p) {
    'use strict';
    this.bufferbar_.style.width = p + '%';
    this.auxbar_.style.width = (100 - p) + '%';
  };
  MaterialProgress.prototype.init = function() {
    'use strict';
    if (this.element_) {
      var el = document.createElement('div');
      el.className = 'progressbar bar bar1';
      this.element_.appendChild(el);
      this.progressbar_ = el;
      el = document.createElement('div');
      el.className = 'bufferbar bar bar2';
      this.element_.appendChild(el);
      this.bufferbar_ = el;
      el = document.createElement('div');
      el.className = 'auxbar bar bar3';
      this.element_.appendChild(el);
      this.auxbar_ = el;
      this.progressbar_.style.width = '0%';
      this.bufferbar_.style.width = '100%';
      this.auxbar_.style.width = '0%';
      this.element_.classList.add('is-upgraded');
    }
  };
  componentHandler.register({
    constructor: MaterialProgress,
    classAsString: 'MaterialProgress',
    cssClass: 'mdl-js-progress'
  });
  function MaterialRadio(element) {
    'use strict';
    this.element_ = element;
    this.init();
  }
  MaterialRadio.prototype.Constant_ = {TINY_TIMEOUT: 0.001};
  MaterialRadio.prototype.CssClasses_ = {
    IS_FOCUSED: 'is-focused',
    IS_DISABLED: 'is-disabled',
    IS_CHECKED: 'is-checked',
    IS_UPGRADED: 'is-upgraded',
    JS_RADIO: 'mdl-js-radio',
    RADIO_BTN: 'mdl-radio__button',
    RADIO_OUTER_CIRCLE: 'mdl-radio__outer-circle',
    RADIO_INNER_CIRCLE: 'mdl-radio__inner-circle',
    RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
    RIPPLE_CONTAINER: 'mdl-radio__ripple-container',
    RIPPLE_CENTER: 'mdl-ripple--center',
    RIPPLE: 'mdl-ripple'
  };
  MaterialRadio.prototype.onChange_ = function(event) {
    'use strict';
    this.updateClasses_(this.btnElement_, this.element_);
    var radios = document.getElementsByClassName(this.CssClasses_.JS_RADIO);
    for (var i = 0; i < radios.length; i++) {
      var button = radios[i].querySelector('.' + this.CssClasses_.RADIO_BTN);
      if (button.getAttribute('name') === this.btnElement_.getAttribute('name')) {
        this.updateClasses_(button, radios[i]);
      }
    }
  };
  MaterialRadio.prototype.onFocus_ = function(event) {
    'use strict';
    this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
  };
  MaterialRadio.prototype.onBlur_ = function(event) {
    'use strict';
    this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
  };
  MaterialRadio.prototype.onMouseup_ = function(event) {
    'use strict';
    this.blur_();
  };
  MaterialRadio.prototype.updateClasses_ = function(button, label) {
    'use strict';
    if (button.disabled) {
      label.classList.add(this.CssClasses_.IS_DISABLED);
    } else {
      label.classList.remove(this.CssClasses_.IS_DISABLED);
    }
    if (button.checked) {
      label.classList.add(this.CssClasses_.IS_CHECKED);
    } else {
      label.classList.remove(this.CssClasses_.IS_CHECKED);
    }
  };
  MaterialRadio.prototype.blur_ = function(event) {
    'use strict';
    window.setTimeout(function() {
      this.btnElement_.blur();
    }.bind(this), this.Constant_.TINY_TIMEOUT);
  };
  MaterialRadio.prototype.disable = function() {
    'use strict';
    this.btnElement_.disabled = true;
    this.updateClasses_(this.btnElement_, this.element_);
  };
  MaterialRadio.prototype.enable = function() {
    'use strict';
    this.btnElement_.disabled = false;
    this.updateClasses_(this.btnElement_, this.element_);
  };
  MaterialRadio.prototype.check = function() {
    'use strict';
    this.btnElement_.checked = true;
    this.updateClasses_(this.btnElement_, this.element_);
  };
  MaterialRadio.prototype.uncheck = function() {
    'use strict';
    this.btnElement_.checked = false;
    this.updateClasses_(this.btnElement_, this.element_);
  };
  MaterialRadio.prototype.init = function() {
    'use strict';
    if (this.element_) {
      this.btnElement_ = this.element_.querySelector('.' + this.CssClasses_.RADIO_BTN);
      var outerCircle = document.createElement('span');
      outerCircle.classList.add(this.CssClasses_.RADIO_OUTER_CIRCLE);
      var innerCircle = document.createElement('span');
      innerCircle.classList.add(this.CssClasses_.RADIO_INNER_CIRCLE);
      this.element_.appendChild(outerCircle);
      this.element_.appendChild(innerCircle);
      var rippleContainer;
      if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
        this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
        rippleContainer = document.createElement('span');
        rippleContainer.classList.add(this.CssClasses_.RIPPLE_CONTAINER);
        rippleContainer.classList.add(this.CssClasses_.RIPPLE_EFFECT);
        rippleContainer.classList.add(this.CssClasses_.RIPPLE_CENTER);
        rippleContainer.addEventListener('mouseup', this.onMouseup_.bind(this));
        var ripple = document.createElement('span');
        ripple.classList.add(this.CssClasses_.RIPPLE);
        rippleContainer.appendChild(ripple);
        this.element_.appendChild(rippleContainer);
      }
      this.btnElement_.addEventListener('change', this.onChange_.bind(this));
      this.btnElement_.addEventListener('focus', this.onFocus_.bind(this));
      this.btnElement_.addEventListener('blur', this.onBlur_.bind(this));
      this.element_.addEventListener('mouseup', this.onMouseup_.bind(this));
      this.updateClasses_(this.btnElement_, this.element_);
      this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
    }
  };
  componentHandler.register({
    constructor: MaterialRadio,
    classAsString: 'MaterialRadio',
    cssClass: 'mdl-js-radio'
  });
  function MaterialSlider(element) {
    'use strict';
    this.element_ = element;
    this.isIE_ = window.navigator.msPointerEnabled;
    this.init();
  }
  MaterialSlider.prototype.Constant_ = {};
  MaterialSlider.prototype.CssClasses_ = {
    IE_CONTAINER: 'mdl-slider__ie-container',
    SLIDER_CONTAINER: 'mdl-slider__container',
    BACKGROUND_FLEX: 'mdl-slider__background-flex',
    BACKGROUND_LOWER: 'mdl-slider__background-lower',
    BACKGROUND_UPPER: 'mdl-slider__background-upper',
    IS_LOWEST_VALUE: 'is-lowest-value',
    IS_UPGRADED: 'is-upgraded'
  };
  MaterialSlider.prototype.onInput_ = function(event) {
    'use strict';
    this.updateValueStyles_();
  };
  MaterialSlider.prototype.onChange_ = function(event) {
    'use strict';
    this.updateValueStyles_();
  };
  MaterialSlider.prototype.onMouseUp_ = function(event) {
    'use strict';
    event.target.blur();
  };
  MaterialSlider.prototype.onContainerMouseDown_ = function(event) {
    'use strict';
    if (event.target !== this.element_.parentElement) {
      return ;
    }
    event.preventDefault();
    var newEvent = new MouseEvent('mousedown', {
      target: event.target,
      buttons: event.buttons,
      clientX: event.clientX,
      clientY: this.element_.getBoundingClientRect().y
    });
    this.element_.dispatchEvent(newEvent);
  };
  MaterialSlider.prototype.updateValueStyles_ = function(event) {
    'use strict';
    var fraction = (this.element_.value - this.element_.min) / (this.element_.max - this.element_.min);
    if (fraction === 0) {
      this.element_.classList.add(this.CssClasses_.IS_LOWEST_VALUE);
    } else {
      this.element_.classList.remove(this.CssClasses_.IS_LOWEST_VALUE);
    }
    if (!this.isIE_) {
      this.backgroundLower_.style.flex = fraction;
      this.backgroundLower_.style.webkitFlex = fraction;
      this.backgroundUpper_.style.flex = 1 - fraction;
      this.backgroundUpper_.style.webkitFlex = 1 - fraction;
    }
  };
  MaterialSlider.prototype.disable = function() {
    'use strict';
    this.element_.disabled = true;
  };
  MaterialSlider.prototype.enable = function() {
    'use strict';
    this.element_.disabled = false;
  };
  MaterialSlider.prototype.change = function(value) {
    'use strict';
    if (value) {
      this.element_.value = value;
    }
    this.updateValueStyles_();
  };
  MaterialSlider.prototype.init = function() {
    'use strict';
    if (this.element_) {
      if (this.isIE_) {
        var containerIE = document.createElement('div');
        containerIE.classList.add(this.CssClasses_.IE_CONTAINER);
        this.element_.parentElement.insertBefore(containerIE, this.element_);
        this.element_.parentElement.removeChild(this.element_);
        containerIE.appendChild(this.element_);
      } else {
        var container = document.createElement('div');
        container.classList.add(this.CssClasses_.SLIDER_CONTAINER);
        this.element_.parentElement.insertBefore(container, this.element_);
        this.element_.parentElement.removeChild(this.element_);
        container.appendChild(this.element_);
        var backgroundFlex = document.createElement('div');
        backgroundFlex.classList.add(this.CssClasses_.BACKGROUND_FLEX);
        container.appendChild(backgroundFlex);
        this.backgroundLower_ = document.createElement('div');
        this.backgroundLower_.classList.add(this.CssClasses_.BACKGROUND_LOWER);
        backgroundFlex.appendChild(this.backgroundLower_);
        this.backgroundUpper_ = document.createElement('div');
        this.backgroundUpper_.classList.add(this.CssClasses_.BACKGROUND_UPPER);
        backgroundFlex.appendChild(this.backgroundUpper_);
      }
      this.boundInputHandler = this.onInput_.bind(this);
      this.boundChangeHandler = this.onChange_.bind(this);
      this.boundMouseUpHandler = this.onMouseUp_.bind(this);
      this.boundContainerMouseDownHandler = this.onContainerMouseDown_.bind(this);
      this.element_.addEventListener('input', this.boundInputHandler);
      this.element_.addEventListener('change', this.boundChangeHandler);
      this.element_.addEventListener('mouseup', this.boundMouseUpHandler);
      this.element_.parentElement.addEventListener('mousedown', this.boundContainerMouseDownHandler);
      this.updateValueStyles_();
      this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
    }
  };
  MaterialSlider.prototype.mdlDowngrade_ = function() {
    'use strict';
    this.element_.removeEventListener('input', this.boundInputHandler);
    this.element_.removeEventListener('change', this.boundChangeHandler);
    this.element_.removeEventListener('mouseup', this.boundMouseUpHandler);
    this.element_.parentElement.removeEventListener('mousedown', this.boundContainerMouseDownHandler);
  };
  componentHandler.register({
    constructor: MaterialSlider,
    classAsString: 'MaterialSlider',
    cssClass: 'mdl-js-slider'
  });
  function MaterialSpinner(element) {
    'use strict';
    this.element_ = element;
    this.init();
  }
  MaterialSpinner.prototype.Constant_ = {MDL_SPINNER_LAYER_COUNT: 4};
  MaterialSpinner.prototype.CssClasses_ = {
    MDL_SPINNER_LAYER: 'mdl-spinner__layer',
    MDL_SPINNER_CIRCLE_CLIPPER: 'mdl-spinner__circle-clipper',
    MDL_SPINNER_CIRCLE: 'mdl-spinner__circle',
    MDL_SPINNER_GAP_PATCH: 'mdl-spinner__gap-patch',
    MDL_SPINNER_LEFT: 'mdl-spinner__left',
    MDL_SPINNER_RIGHT: 'mdl-spinner__right'
  };
  MaterialSpinner.prototype.createLayer = function(index) {
    'use strict';
    var layer = document.createElement('div');
    layer.classList.add(this.CssClasses_.MDL_SPINNER_LAYER);
    layer.classList.add(this.CssClasses_.MDL_SPINNER_LAYER + '-' + index);
    var leftClipper = document.createElement('div');
    leftClipper.classList.add(this.CssClasses_.MDL_SPINNER_CIRCLE_CLIPPER);
    leftClipper.classList.add(this.CssClasses_.MDL_SPINNER_LEFT);
    var gapPatch = document.createElement('div');
    gapPatch.classList.add(this.CssClasses_.MDL_SPINNER_GAP_PATCH);
    var rightClipper = document.createElement('div');
    rightClipper.classList.add(this.CssClasses_.MDL_SPINNER_CIRCLE_CLIPPER);
    rightClipper.classList.add(this.CssClasses_.MDL_SPINNER_RIGHT);
    var circleOwners = [leftClipper, gapPatch, rightClipper];
    for (var i = 0; i < circleOwners.length; i++) {
      var circle = document.createElement('div');
      circle.classList.add(this.CssClasses_.MDL_SPINNER_CIRCLE);
      circleOwners[i].appendChild(circle);
    }
    layer.appendChild(leftClipper);
    layer.appendChild(gapPatch);
    layer.appendChild(rightClipper);
    this.element_.appendChild(layer);
  };
  MaterialSpinner.prototype.stop = function() {
    'use strict';
    this.element_.classList.remove('is-active');
  };
  MaterialSpinner.prototype.start = function() {
    'use strict';
    this.element_.classList.add('is-active');
  };
  MaterialSpinner.prototype.init = function() {
    'use strict';
    if (this.element_) {
      for (var i = 1; i <= this.Constant_.MDL_SPINNER_LAYER_COUNT; i++) {
        this.createLayer(i);
      }
      this.element_.classList.add('is-upgraded');
    }
  };
  componentHandler.register({
    constructor: MaterialSpinner,
    classAsString: 'MaterialSpinner',
    cssClass: 'mdl-js-spinner'
  });
  function MaterialSwitch(element) {
    'use strict';
    this.element_ = element;
    this.init();
  }
  MaterialSwitch.prototype.Constant_ = {TINY_TIMEOUT: 0.001};
  MaterialSwitch.prototype.CssClasses_ = {
    INPUT: 'mdl-switch__input',
    TRACK: 'mdl-switch__track',
    THUMB: 'mdl-switch__thumb',
    FOCUS_HELPER: 'mdl-switch__focus-helper',
    RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
    RIPPLE_CONTAINER: 'mdl-switch__ripple-container',
    RIPPLE_CENTER: 'mdl-ripple--center',
    RIPPLE: 'mdl-ripple',
    IS_FOCUSED: 'is-focused',
    IS_DISABLED: 'is-disabled',
    IS_CHECKED: 'is-checked'
  };
  MaterialSwitch.prototype.onChange_ = function(event) {
    'use strict';
    this.updateClasses_();
  };
  MaterialSwitch.prototype.onFocus_ = function(event) {
    'use strict';
    this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
  };
  MaterialSwitch.prototype.onBlur_ = function(event) {
    'use strict';
    this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
  };
  MaterialSwitch.prototype.onMouseUp_ = function(event) {
    'use strict';
    this.blur_();
  };
  MaterialSwitch.prototype.updateClasses_ = function() {
    'use strict';
    if (this.inputElement_.disabled) {
      this.element_.classList.add(this.CssClasses_.IS_DISABLED);
    } else {
      this.element_.classList.remove(this.CssClasses_.IS_DISABLED);
    }
    if (this.inputElement_.checked) {
      this.element_.classList.add(this.CssClasses_.IS_CHECKED);
    } else {
      this.element_.classList.remove(this.CssClasses_.IS_CHECKED);
    }
  };
  MaterialSwitch.prototype.blur_ = function(event) {
    'use strict';
    window.setTimeout(function() {
      this.inputElement_.blur();
    }.bind(this), this.Constant_.TINY_TIMEOUT);
  };
  MaterialSwitch.prototype.disable = function() {
    'use strict';
    this.inputElement_.disabled = true;
    this.updateClasses_();
  };
  MaterialSwitch.prototype.enable = function() {
    'use strict';
    this.inputElement_.disabled = false;
    this.updateClasses_();
  };
  MaterialSwitch.prototype.on = function() {
    'use strict';
    this.inputElement_.checked = true;
    this.updateClasses_();
  };
  MaterialSwitch.prototype.off = function() {
    'use strict';
    this.inputElement_.checked = false;
    this.updateClasses_();
  };
  MaterialSwitch.prototype.init = function() {
    'use strict';
    if (this.element_) {
      this.inputElement_ = this.element_.querySelector('.' + this.CssClasses_.INPUT);
      var track = document.createElement('div');
      track.classList.add(this.CssClasses_.TRACK);
      var thumb = document.createElement('div');
      thumb.classList.add(this.CssClasses_.THUMB);
      var focusHelper = document.createElement('span');
      focusHelper.classList.add(this.CssClasses_.FOCUS_HELPER);
      thumb.appendChild(focusHelper);
      this.element_.appendChild(track);
      this.element_.appendChild(thumb);
      this.boundMouseUpHandler = this.onMouseUp_.bind(this);
      if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
        this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
        this.rippleContainerElement_ = document.createElement('span');
        this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CONTAINER);
        this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_EFFECT);
        this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CENTER);
        this.rippleContainerElement_.addEventListener('mouseup', this.boundMouseUpHandler);
        var ripple = document.createElement('span');
        ripple.classList.add(this.CssClasses_.RIPPLE);
        this.rippleContainerElement_.appendChild(ripple);
        this.element_.appendChild(this.rippleContainerElement_);
      }
      this.boundChangeHandler = this.onChange_.bind(this);
      this.boundFocusHandler = this.onFocus_.bind(this);
      this.boundBlurHandler = this.onBlur_.bind(this);
      this.inputElement_.addEventListener('change', this.boundChangeHandler);
      this.inputElement_.addEventListener('focus', this.boundFocusHandler);
      this.inputElement_.addEventListener('blur', this.boundBlurHandler);
      this.element_.addEventListener('mouseup', this.boundMouseUpHandler);
      this.updateClasses_();
      this.element_.classList.add('is-upgraded');
    }
  };
  MaterialSwitch.prototype.mdlDowngrade_ = function() {
    'use strict';
    if (this.rippleContainerElement_) {
      this.rippleContainerElement_.removeEventListener('mouseup', this.boundMouseUpHandler);
    }
    this.inputElement_.removeEventListener('change', this.boundChangeHandler);
    this.inputElement_.removeEventListener('focus', this.boundFocusHandler);
    this.inputElement_.removeEventListener('blur', this.boundBlurHandler);
    this.element_.removeEventListener('mouseup', this.boundMouseUpHandler);
  };
  componentHandler.register({
    constructor: MaterialSwitch,
    classAsString: 'MaterialSwitch',
    cssClass: 'mdl-js-switch'
  });
  function MaterialTabs(element) {
    'use strict';
    this.element_ = element;
    this.init();
  }
  MaterialTabs.prototype.Constant_ = {};
  MaterialTabs.prototype.CssClasses_ = {
    TAB_CLASS: 'mdl-tabs__tab',
    PANEL_CLASS: 'mdl-tabs__panel',
    ACTIVE_CLASS: 'is-active',
    UPGRADED_CLASS: 'is-upgraded',
    MDL_JS_RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    MDL_RIPPLE_CONTAINER: 'mdl-tabs__ripple-container',
    MDL_RIPPLE: 'mdl-ripple',
    MDL_JS_RIPPLE_EFFECT_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events'
  };
  MaterialTabs.prototype.initTabs_ = function(e) {
    'use strict';
    if (this.element_.classList.contains(this.CssClasses_.MDL_JS_RIPPLE_EFFECT)) {
      this.element_.classList.add(this.CssClasses_.MDL_JS_RIPPLE_EFFECT_IGNORE_EVENTS);
    }
    this.tabs_ = this.element_.querySelectorAll('.' + this.CssClasses_.TAB_CLASS);
    this.panels_ = this.element_.querySelectorAll('.' + this.CssClasses_.PANEL_CLASS);
    for (var i = 0; i < this.tabs_.length; i++) {
      new MaterialTab(this.tabs_[i], this);
    }
    this.element_.classList.add(this.CssClasses_.UPGRADED_CLASS);
  };
  MaterialTabs.prototype.resetTabState_ = function() {
    'use strict';
    for (var k = 0; k < this.tabs_.length; k++) {
      this.tabs_[k].classList.remove(this.CssClasses_.ACTIVE_CLASS);
    }
  };
  MaterialTabs.prototype.resetPanelState_ = function() {
    'use strict';
    for (var j = 0; j < this.panels_.length; j++) {
      this.panels_[j].classList.remove(this.CssClasses_.ACTIVE_CLASS);
    }
  };
  MaterialTabs.prototype.init = function() {
    'use strict';
    if (this.element_) {
      this.initTabs_();
    }
  };
  function MaterialTab(tab, ctx) {
    'use strict';
    if (tab) {
      if (ctx.element_.classList.contains(ctx.CssClasses_.MDL_JS_RIPPLE_EFFECT)) {
        var rippleContainer = document.createElement('span');
        rippleContainer.classList.add(ctx.CssClasses_.MDL_RIPPLE_CONTAINER);
        rippleContainer.classList.add(ctx.CssClasses_.MDL_JS_RIPPLE_EFFECT);
        var ripple = document.createElement('span');
        ripple.classList.add(ctx.CssClasses_.MDL_RIPPLE);
        rippleContainer.appendChild(ripple);
        tab.appendChild(rippleContainer);
      }
      tab.addEventListener('click', function(e) {
        e.preventDefault();
        var href = tab.href.split('#')[1];
        var panel = ctx.element_.querySelector('#' + href);
        ctx.resetTabState_();
        ctx.resetPanelState_();
        tab.classList.add(ctx.CssClasses_.ACTIVE_CLASS);
        panel.classList.add(ctx.CssClasses_.ACTIVE_CLASS);
      });
    }
  }
  componentHandler.register({
    constructor: MaterialTabs,
    classAsString: 'MaterialTabs',
    cssClass: 'mdl-js-tabs'
  });
  function MaterialTextfield(element) {
    'use strict';
    this.element_ = element;
    this.maxRows = this.Constant_.NO_MAX_ROWS;
    this.init();
  }
  MaterialTextfield.prototype.Constant_ = {
    NO_MAX_ROWS: -1,
    MAX_ROWS_ATTRIBUTE: 'maxrows'
  };
  MaterialTextfield.prototype.CssClasses_ = {
    LABEL: 'mdl-textfield__label',
    INPUT: 'mdl-textfield__input',
    IS_DIRTY: 'is-dirty',
    IS_FOCUSED: 'is-focused',
    IS_DISABLED: 'is-disabled',
    IS_INVALID: 'is-invalid',
    IS_UPGRADED: 'is-upgraded'
  };
  MaterialTextfield.prototype.onKeyDown_ = function(event) {
    'use strict';
    var currentRowCount = event.target.value.split('\n').length;
    if (event.keyCode === 13) {
      if (currentRowCount >= this.maxRows) {
        event.preventDefault();
      }
    }
  };
  MaterialTextfield.prototype.onFocus_ = function(event) {
    'use strict';
    this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
  };
  MaterialTextfield.prototype.onBlur_ = function(event) {
    'use strict';
    this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
  };
  MaterialTextfield.prototype.updateClasses_ = function() {
    'use strict';
    if (this.input_.disabled) {
      this.element_.classList.add(this.CssClasses_.IS_DISABLED);
    } else {
      this.element_.classList.remove(this.CssClasses_.IS_DISABLED);
    }
    if (this.input_.validity.valid) {
      this.element_.classList.remove(this.CssClasses_.IS_INVALID);
    } else {
      this.element_.classList.add(this.CssClasses_.IS_INVALID);
    }
    if (this.input_.value && this.input_.value.length > 0) {
      this.element_.classList.add(this.CssClasses_.IS_DIRTY);
    } else {
      this.element_.classList.remove(this.CssClasses_.IS_DIRTY);
    }
  };
  MaterialTextfield.prototype.disable = function() {
    'use strict';
    this.input_.disabled = true;
    this.updateClasses_();
  };
  MaterialTextfield.prototype.enable = function() {
    'use strict';
    this.input_.disabled = false;
    this.updateClasses_();
  };
  MaterialTextfield.prototype.change = function(value) {
    'use strict';
    if (value) {
      this.input_.value = value;
    }
    this.updateClasses_();
  };
  MaterialTextfield.prototype.init = function() {
    'use strict';
    if (this.element_) {
      this.label_ = this.element_.querySelector('.' + this.CssClasses_.LABEL);
      this.input_ = this.element_.querySelector('.' + this.CssClasses_.INPUT);
      if (this.input_) {
        if (this.input_.hasAttribute(this.Constant_.MAX_ROWS_ATTRIBUTE)) {
          this.maxRows = parseInt(this.input_.getAttribute(this.Constant_.MAX_ROWS_ATTRIBUTE), 10);
          if (isNaN(this.maxRows)) {
            this.maxRows = this.Constant_.NO_MAX_ROWS;
          }
        }
        this.boundUpdateClassesHandler = this.updateClasses_.bind(this);
        this.boundFocusHandler = this.onFocus_.bind(this);
        this.boundBlurHandler = this.onBlur_.bind(this);
        this.input_.addEventListener('input', this.boundUpdateClassesHandler);
        this.input_.addEventListener('focus', this.boundFocusHandler);
        this.input_.addEventListener('blur', this.boundBlurHandler);
        if (this.maxRows !== this.Constant_.NO_MAX_ROWS) {
          this.boundKeyDownHandler = this.onKeyDown_.bind(this);
          this.input_.addEventListener('keydown', this.boundKeyDownHandler);
        }
        this.updateClasses_();
        this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
      }
    }
  };
  MaterialTextfield.prototype.mdlDowngrade_ = function() {
    'use strict';
    this.input_.removeEventListener('input', this.boundUpdateClassesHandler);
    this.input_.removeEventListener('focus', this.boundFocusHandler);
    this.input_.removeEventListener('blur', this.boundBlurHandler);
    if (this.boundKeyDownHandler) {
      this.input_.removeEventListener('keydown', this.boundKeyDownHandler);
    }
  };
  componentHandler.register({
    constructor: MaterialTextfield,
    classAsString: 'MaterialTextfield',
    cssClass: 'mdl-js-textfield'
  });
  function MaterialTooltip(element) {
    'use strict';
    this.element_ = element;
    this.init();
  }
  MaterialTooltip.prototype.Constant_ = {};
  MaterialTooltip.prototype.CssClasses_ = {IS_ACTIVE: 'is-active'};
  MaterialTooltip.prototype.handleMouseEnter_ = function(event) {
    'use strict';
    event.stopPropagation();
    var props = event.target.getBoundingClientRect();
    this.element_.style.left = props.left + (props.width / 2) + 'px';
    this.element_.style.marginLeft = -1 * (this.element_.offsetWidth / 2) + 'px';
    this.element_.style.top = props.top + props.height + 10 + 'px';
    this.element_.classList.add(this.CssClasses_.IS_ACTIVE);
  };
  MaterialTooltip.prototype.handleMouseLeave_ = function(event) {
    'use strict';
    event.stopPropagation();
    this.element_.classList.remove(this.CssClasses_.IS_ACTIVE);
  };
  MaterialTooltip.prototype.init = function() {
    'use strict';
    if (this.element_) {
      var forElId = this.element_.getAttribute('for');
      if (forElId) {
        this.forElement_ = document.getElementById(forElId);
      }
      if (this.forElement_) {
        this.boundMouseEnterHandler = this.handleMouseEnter_.bind(this);
        this.boundMouseLeaveHandler = this.handleMouseLeave_.bind(this);
        this.forElement_.addEventListener('mouseenter', this.boundMouseEnterHandler, false);
        this.forElement_.addEventListener('click', this.boundMouseEnterHandler, false);
        this.forElement_.addEventListener('mouseleave', this.boundMouseLeaveHandler);
      }
    }
  };
  MaterialTooltip.prototype.mdlDowngrade_ = function() {
    'use strict';
    if (this.forElement_) {
      this.forElement_.removeEventListener('mouseenter', this.boundMouseEnterHandler, false);
      this.forElement_.removeEventListener('click', this.boundMouseEnterHandler, false);
      this.forElement_.removeEventListener('mouseleave', this.boundMouseLeaveHandler);
    }
  };
  componentHandler.register({
    constructor: MaterialTooltip,
    classAsString: 'MaterialTooltip',
    cssClass: 'mdl-tooltip'
  });
  function MaterialLayout(element) {
    'use strict';
    this.element_ = element;
    this.init();
  }
  MaterialLayout.prototype.Constant_ = {
    MAX_WIDTH: '(max-width: 850px)',
    TAB_SCROLL_PIXELS: 100,
    MENU_ICON: 'menu',
    CHEVRON_LEFT: 'chevron_left',
    CHEVRON_RIGHT: 'chevron_right'
  };
  MaterialLayout.prototype.Mode_ = {
    STANDARD: 0,
    SEAMED: 1,
    WATERFALL: 2,
    SCROLL: 3
  };
  MaterialLayout.prototype.CssClasses_ = {
    CONTAINER: 'mdl-layout__container',
    HEADER: 'mdl-layout__header',
    DRAWER: 'mdl-layout__drawer',
    CONTENT: 'mdl-layout__content',
    DRAWER_BTN: 'mdl-layout__drawer-button',
    ICON: 'material-icons',
    JS_RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_CONTAINER: 'mdl-layout__tab-ripple-container',
    RIPPLE: 'mdl-ripple',
    RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
    HEADER_SEAMED: 'mdl-layout__header--seamed',
    HEADER_WATERFALL: 'mdl-layout__header--waterfall',
    HEADER_SCROLL: 'mdl-layout__header--scroll',
    FIXED_HEADER: 'mdl-layout--fixed-header',
    OBFUSCATOR: 'mdl-layout__obfuscator',
    TAB_BAR: 'mdl-layout__tab-bar',
    TAB_CONTAINER: 'mdl-layout__tab-bar-container',
    TAB: 'mdl-layout__tab',
    TAB_BAR_BUTTON: 'mdl-layout__tab-bar-button',
    TAB_BAR_LEFT_BUTTON: 'mdl-layout__tab-bar-left-button',
    TAB_BAR_RIGHT_BUTTON: 'mdl-layout__tab-bar-right-button',
    PANEL: 'mdl-layout__tab-panel',
    HAS_DRAWER: 'has-drawer',
    HAS_TABS: 'has-tabs',
    HAS_SCROLLING_HEADER: 'has-scrolling-header',
    CASTING_SHADOW: 'is-casting-shadow',
    IS_COMPACT: 'is-compact',
    IS_SMALL_SCREEN: 'is-small-screen',
    IS_DRAWER_OPEN: 'is-visible',
    IS_ACTIVE: 'is-active',
    IS_UPGRADED: 'is-upgraded',
    IS_ANIMATING: 'is-animating'
  };
  MaterialLayout.prototype.contentScrollHandler_ = function() {
    'use strict';
    if (this.header_.classList.contains(this.CssClasses_.IS_ANIMATING)) {
      return ;
    }
    if (this.content_.scrollTop > 0 && !this.header_.classList.contains(this.CssClasses_.IS_COMPACT)) {
      this.header_.classList.add(this.CssClasses_.CASTING_SHADOW);
      this.header_.classList.add(this.CssClasses_.IS_COMPACT);
      this.header_.classList.add(this.CssClasses_.IS_ANIMATING);
    } else if (this.content_.scrollTop <= 0 && this.header_.classList.contains(this.CssClasses_.IS_COMPACT)) {
      this.header_.classList.remove(this.CssClasses_.CASTING_SHADOW);
      this.header_.classList.remove(this.CssClasses_.IS_COMPACT);
      this.header_.classList.add(this.CssClasses_.IS_ANIMATING);
    }
  };
  MaterialLayout.prototype.screenSizeHandler_ = function() {
    'use strict';
    if (this.screenSizeMediaQuery_.matches) {
      this.element_.classList.add(this.CssClasses_.IS_SMALL_SCREEN);
    } else {
      this.element_.classList.remove(this.CssClasses_.IS_SMALL_SCREEN);
      if (this.drawer_) {
        this.drawer_.classList.remove(this.CssClasses_.IS_DRAWER_OPEN);
      }
    }
  };
  MaterialLayout.prototype.drawerToggleHandler_ = function() {
    'use strict';
    this.drawer_.classList.toggle(this.CssClasses_.IS_DRAWER_OPEN);
  };
  MaterialLayout.prototype.headerTransitionEndHandler = function() {
    'use strict';
    this.header_.classList.remove(this.CssClasses_.IS_ANIMATING);
  };
  MaterialLayout.prototype.headerClickHandler = function() {
    'use strict';
    if (this.header_.classList.contains(this.CssClasses_.IS_COMPACT)) {
      this.header_.classList.remove(this.CssClasses_.IS_COMPACT);
      this.header_.classList.add(this.CssClasses_.IS_ANIMATING);
    }
  };
  MaterialLayout.prototype.resetTabState_ = function(tabBar) {
    'use strict';
    for (var k = 0; k < tabBar.length; k++) {
      tabBar[k].classList.remove(this.CssClasses_.IS_ACTIVE);
    }
  };
  MaterialLayout.prototype.resetPanelState_ = function(panels) {
    'use strict';
    for (var j = 0; j < panels.length; j++) {
      panels[j].classList.remove(this.CssClasses_.IS_ACTIVE);
    }
  };
  MaterialLayout.prototype.init = function() {
    'use strict';
    if (this.element_) {
      var container = document.createElement('div');
      container.classList.add(this.CssClasses_.CONTAINER);
      this.element_.parentElement.insertBefore(container, this.element_);
      this.element_.parentElement.removeChild(this.element_);
      container.appendChild(this.element_);
      var directChildren = this.element_.childNodes;
      for (var c = 0; c < directChildren.length; c++) {
        var child = directChildren[c];
        if (child.classList && child.classList.contains(this.CssClasses_.HEADER)) {
          this.header_ = child;
        }
        if (child.classList && child.classList.contains(this.CssClasses_.DRAWER)) {
          this.drawer_ = child;
        }
        if (child.classList && child.classList.contains(this.CssClasses_.CONTENT)) {
          this.content_ = child;
        }
      }
      if (this.header_) {
        this.tabBar_ = this.header_.querySelector('.' + this.CssClasses_.TAB_BAR);
      }
      var mode = this.Mode_.STANDARD;
      this.screenSizeMediaQuery_ = window.matchMedia(this.Constant_.MAX_WIDTH);
      this.screenSizeMediaQuery_.addListener(this.screenSizeHandler_.bind(this));
      this.screenSizeHandler_();
      if (this.header_) {
        if (this.header_.classList.contains(this.CssClasses_.HEADER_SEAMED)) {
          mode = this.Mode_.SEAMED;
        } else if (this.header_.classList.contains(this.CssClasses_.HEADER_WATERFALL)) {
          mode = this.Mode_.WATERFALL;
          this.header_.addEventListener('transitionend', this.headerTransitionEndHandler.bind(this));
          this.header_.addEventListener('click', this.headerClickHandler.bind(this));
        } else if (this.header_.classList.contains(this.CssClasses_.HEADER_SCROLL)) {
          mode = this.Mode_.SCROLL;
          container.classList.add(this.CssClasses_.HAS_SCROLLING_HEADER);
        }
        if (mode === this.Mode_.STANDARD) {
          this.header_.classList.add(this.CssClasses_.CASTING_SHADOW);
          if (this.tabBar_) {
            this.tabBar_.classList.add(this.CssClasses_.CASTING_SHADOW);
          }
        } else if (mode === this.Mode_.SEAMED || mode === this.Mode_.SCROLL) {
          this.header_.classList.remove(this.CssClasses_.CASTING_SHADOW);
          if (this.tabBar_) {
            this.tabBar_.classList.remove(this.CssClasses_.CASTING_SHADOW);
          }
        } else if (mode === this.Mode_.WATERFALL) {
          this.content_.addEventListener('scroll', this.contentScrollHandler_.bind(this));
          this.contentScrollHandler_();
        }
      }
      if (this.drawer_) {
        var drawerButton = document.createElement('div');
        drawerButton.classList.add(this.CssClasses_.DRAWER_BTN);
        var drawerButtonIcon = document.createElement('i');
        drawerButtonIcon.classList.add(this.CssClasses_.ICON);
        drawerButtonIcon.textContent = this.Constant_.MENU_ICON;
        drawerButton.appendChild(drawerButtonIcon);
        drawerButton.addEventListener('click', this.drawerToggleHandler_.bind(this));
        this.element_.classList.add(this.CssClasses_.HAS_DRAWER);
        if (this.element_.classList.contains(this.CssClasses_.FIXED_HEADER)) {
          this.header_.insertBefore(drawerButton, this.header_.firstChild);
        } else {
          this.element_.insertBefore(drawerButton, this.content_);
        }
        var obfuscator = document.createElement('div');
        obfuscator.classList.add(this.CssClasses_.OBFUSCATOR);
        this.element_.appendChild(obfuscator);
        obfuscator.addEventListener('click', this.drawerToggleHandler_.bind(this));
      }
      if (this.header_ && this.tabBar_) {
        this.element_.classList.add(this.CssClasses_.HAS_TABS);
        var tabContainer = document.createElement('div');
        tabContainer.classList.add(this.CssClasses_.TAB_CONTAINER);
        this.header_.insertBefore(tabContainer, this.tabBar_);
        this.header_.removeChild(this.tabBar_);
        var leftButton = document.createElement('div');
        leftButton.classList.add(this.CssClasses_.TAB_BAR_BUTTON);
        leftButton.classList.add(this.CssClasses_.TAB_BAR_LEFT_BUTTON);
        var leftButtonIcon = document.createElement('i');
        leftButtonIcon.classList.add(this.CssClasses_.ICON);
        leftButtonIcon.textContent = this.Constant_.CHEVRON_LEFT;
        leftButton.appendChild(leftButtonIcon);
        leftButton.addEventListener('click', function() {
          this.tabBar_.scrollLeft -= this.Constant_.TAB_SCROLL_PIXELS;
        }.bind(this));
        var rightButton = document.createElement('div');
        rightButton.classList.add(this.CssClasses_.TAB_BAR_BUTTON);
        rightButton.classList.add(this.CssClasses_.TAB_BAR_RIGHT_BUTTON);
        var rightButtonIcon = document.createElement('i');
        rightButtonIcon.classList.add(this.CssClasses_.ICON);
        rightButtonIcon.textContent = this.Constant_.CHEVRON_RIGHT;
        rightButton.appendChild(rightButtonIcon);
        rightButton.addEventListener('click', function() {
          this.tabBar_.scrollLeft += this.Constant_.TAB_SCROLL_PIXELS;
        }.bind(this));
        tabContainer.appendChild(leftButton);
        tabContainer.appendChild(this.tabBar_);
        tabContainer.appendChild(rightButton);
        var tabScrollHandler = function() {
          if (this.tabBar_.scrollLeft > 0) {
            leftButton.classList.add(this.CssClasses_.IS_ACTIVE);
          } else {
            leftButton.classList.remove(this.CssClasses_.IS_ACTIVE);
          }
          if (this.tabBar_.scrollLeft < this.tabBar_.scrollWidth - this.tabBar_.offsetWidth) {
            rightButton.classList.add(this.CssClasses_.IS_ACTIVE);
          } else {
            rightButton.classList.remove(this.CssClasses_.IS_ACTIVE);
          }
        }.bind(this);
        this.tabBar_.addEventListener('scroll', tabScrollHandler);
        tabScrollHandler();
        if (this.tabBar_.classList.contains(this.CssClasses_.JS_RIPPLE_EFFECT)) {
          this.tabBar_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
        }
        var tabs = this.tabBar_.querySelectorAll('.' + this.CssClasses_.TAB);
        var panels = this.content_.querySelectorAll('.' + this.CssClasses_.PANEL);
        for (var i = 0; i < tabs.length; i++) {
          new MaterialLayoutTab(tabs[i], tabs, panels, this);
        }
      }
      this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
    }
  };
  function MaterialLayoutTab(tab, tabs, panels, layout) {
    'use strict';
    if (tab) {
      if (layout.tabBar_.classList.contains(layout.CssClasses_.JS_RIPPLE_EFFECT)) {
        var rippleContainer = document.createElement('span');
        rippleContainer.classList.add(layout.CssClasses_.RIPPLE_CONTAINER);
        rippleContainer.classList.add(layout.CssClasses_.JS_RIPPLE_EFFECT);
        var ripple = document.createElement('span');
        ripple.classList.add(layout.CssClasses_.RIPPLE);
        rippleContainer.appendChild(ripple);
        tab.appendChild(rippleContainer);
      }
      tab.addEventListener('click', function(e) {
        e.preventDefault();
        var href = tab.href.split('#')[1];
        var panel = layout.content_.querySelector('#' + href);
        layout.resetTabState_(tabs);
        layout.resetPanelState_(panels);
        tab.classList.add(layout.CssClasses_.IS_ACTIVE);
        panel.classList.add(layout.CssClasses_.IS_ACTIVE);
      });
    }
  }
  componentHandler.register({
    constructor: MaterialLayout,
    classAsString: 'MaterialLayout',
    cssClass: 'mdl-js-layout'
  });
  function MaterialDataTable(element) {
    'use strict';
    this.element_ = element;
    this.init();
  }
  MaterialDataTable.prototype.Constant_ = {};
  MaterialDataTable.prototype.CssClasses_ = {
    DATA_TABLE: 'mdl-data-table',
    SELECTABLE: 'mdl-data-table--selectable',
    IS_SELECTED: 'is-selected',
    IS_UPGRADED: 'is-upgraded'
  };
  MaterialDataTable.prototype.selectRow_ = function(checkbox, row, rows) {
    'use strict';
    if (row) {
      return function() {
        if (checkbox.checked) {
          row.classList.add(this.CssClasses_.IS_SELECTED);
        } else {
          row.classList.remove(this.CssClasses_.IS_SELECTED);
        }
      }.bind(this);
    }
    if (rows) {
      return function() {
        var i;
        var el;
        if (checkbox.checked) {
          for (i = 0; i < rows.length; i++) {
            el = rows[i].querySelector('td').querySelector('.mdl-checkbox');
            el.MaterialCheckbox.check();
            rows[i].classList.add(this.CssClasses_.IS_SELECTED);
          }
        } else {
          for (i = 0; i < rows.length; i++) {
            el = rows[i].querySelector('td').querySelector('.mdl-checkbox');
            el.MaterialCheckbox.uncheck();
            rows[i].classList.remove(this.CssClasses_.IS_SELECTED);
          }
        }
      }.bind(this);
    }
  };
  MaterialDataTable.prototype.createCheckbox_ = function(row, rows) {
    'use strict';
    var label = document.createElement('label');
    label.classList.add('mdl-checkbox');
    label.classList.add('mdl-js-checkbox');
    label.classList.add('mdl-js-ripple-effect');
    label.classList.add('mdl-data-table__select');
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('mdl-checkbox__input');
    if (row) {
      checkbox.addEventListener('change', this.selectRow_(checkbox, row));
    } else if (rows) {
      checkbox.addEventListener('change', this.selectRow_(checkbox, null, rows));
    }
    label.appendChild(checkbox);
    componentHandler.upgradeElement(label, 'MaterialCheckbox');
    return label;
  };
  MaterialDataTable.prototype.init = function() {
    'use strict';
    if (this.element_) {
      var firstHeader = this.element_.querySelector('th');
      var rows = this.element_.querySelector('tbody').querySelectorAll('tr');
      if (this.element_.classList.contains(this.CssClasses_.SELECTABLE)) {
        var th = document.createElement('th');
        var headerCheckbox = this.createCheckbox_(null, rows);
        th.appendChild(headerCheckbox);
        firstHeader.parentElement.insertBefore(th, firstHeader);
        for (var i = 0; i < rows.length; i++) {
          var firstCell = rows[i].querySelector('td');
          if (firstCell) {
            var td = document.createElement('td');
            var rowCheckbox = this.createCheckbox_(rows[i]);
            td.appendChild(rowCheckbox);
            rows[i].insertBefore(td, firstCell);
          }
        }
      }
      this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
    }
  };
  componentHandler.register({
    constructor: MaterialDataTable,
    classAsString: 'MaterialDataTable',
    cssClass: 'mdl-js-data-table'
  });
  function MaterialRipple(element) {
    'use strict';
    this.element_ = element;
    this.init();
  }
  MaterialRipple.prototype.Constant_ = {
    INITIAL_SCALE: 'scale(0.0001, 0.0001)',
    INITIAL_SIZE: '1px',
    INITIAL_OPACITY: '0.4',
    FINAL_OPACITY: '0',
    FINAL_SCALE: ''
  };
  MaterialRipple.prototype.CssClasses_ = {
    RIPPLE_CENTER: 'mdl-ripple--center',
    RIPPLE_EFFECT_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
    RIPPLE: 'mdl-ripple',
    IS_ANIMATING: 'is-animating',
    IS_VISIBLE: 'is-visible'
  };
  MaterialRipple.prototype.downHandler_ = function(event) {
    'use strict';
    if (!this.rippleElement_.style.width && !this.rippleElement_.style.height) {
      var rect = this.element_.getBoundingClientRect();
      this.boundHeight = rect.height;
      this.boundWidth = rect.width;
      this.rippleSize_ = Math.sqrt(rect.width * rect.width + rect.height * rect.height) * 2 + 2;
      this.rippleElement_.style.width = this.rippleSize_ + 'px';
      this.rippleElement_.style.height = this.rippleSize_ + 'px';
    }
    this.rippleElement_.classList.add(this.CssClasses_.IS_VISIBLE);
    if (event.type === 'mousedown' && this.ignoringMouseDown_) {
      this.ignoringMouseDown_ = false;
    } else {
      if (event.type === 'touchstart') {
        this.ignoringMouseDown_ = true;
      }
      var frameCount = this.getFrameCount();
      if (frameCount > 0) {
        return ;
      }
      this.setFrameCount(1);
      var bound = event.currentTarget.getBoundingClientRect();
      var x;
      var y;
      if (event.clientX === 0 && event.clientY === 0) {
        x = Math.round(bound.width / 2);
        y = Math.round(bound.height / 2);
      } else {
        var clientX = event.clientX ? event.clientX : event.touches[0].clientX;
        var clientY = event.clientY ? event.clientY : event.touches[0].clientY;
        x = Math.round(clientX - bound.left);
        y = Math.round(clientY - bound.top);
      }
      this.setRippleXY(x, y);
      this.setRippleStyles(true);
      window.requestAnimationFrame(this.animFrameHandler.bind(this));
    }
  };
  MaterialRipple.prototype.upHandler_ = function(event) {
    'use strict';
    if (event && event.detail !== 2) {
      this.rippleElement_.classList.remove(this.CssClasses_.IS_VISIBLE);
    }
  };
  MaterialRipple.prototype.init = function() {
    'use strict';
    if (this.element_) {
      var recentering = this.element_.classList.contains(this.CssClasses_.RIPPLE_CENTER);
      if (!this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT_IGNORE_EVENTS)) {
        this.rippleElement_ = this.element_.querySelector('.' + this.CssClasses_.RIPPLE);
        this.frameCount_ = 0;
        this.rippleSize_ = 0;
        this.x_ = 0;
        this.y_ = 0;
        this.ignoringMouseDown_ = false;
        this.boundDownHandler = this.downHandler_.bind(this);
        this.element_.addEventListener('mousedown', this.boundDownHandler);
        this.element_.addEventListener('touchstart', this.boundDownHandler);
        this.boundUpHandler = this.upHandler_.bind(this);
        this.element_.addEventListener('mouseup', this.boundUpHandler);
        this.element_.addEventListener('mouseleave', this.boundUpHandler);
        this.element_.addEventListener('touchend', this.boundUpHandler);
        this.element_.addEventListener('blur', this.boundUpHandler);
        this.getFrameCount = function() {
          return this.frameCount_;
        };
        this.setFrameCount = function(fC) {
          this.frameCount_ = fC;
        };
        this.getRippleElement = function() {
          return this.rippleElement_;
        };
        this.setRippleXY = function(newX, newY) {
          this.x_ = newX;
          this.y_ = newY;
        };
        this.setRippleStyles = function(start) {
          if (this.rippleElement_ !== null) {
            var transformString;
            var scale;
            var size;
            var offset = 'translate(' + this.x_ + 'px, ' + this.y_ + 'px)';
            if (start) {
              scale = this.Constant_.INITIAL_SCALE;
              size = this.Constant_.INITIAL_SIZE;
            } else {
              scale = this.Constant_.FINAL_SCALE;
              size = this.rippleSize_ + 'px';
              if (recentering) {
                offset = 'translate(' + this.boundWidth / 2 + 'px, ' + this.boundHeight / 2 + 'px)';
              }
            }
            transformString = 'translate(-50%, -50%) ' + offset + scale;
            this.rippleElement_.style.webkitTransform = transformString;
            this.rippleElement_.style.msTransform = transformString;
            this.rippleElement_.style.transform = transformString;
            if (start) {
              this.rippleElement_.classList.remove(this.CssClasses_.IS_ANIMATING);
            } else {
              this.rippleElement_.classList.add(this.CssClasses_.IS_ANIMATING);
            }
          }
        };
        this.animFrameHandler = function() {
          if (this.frameCount_-- > 0) {
            window.requestAnimationFrame(this.animFrameHandler.bind(this));
          } else {
            this.setRippleStyles(false);
          }
        };
      }
    }
  };
  MaterialRipple.prototype.mdlDowngrade_ = function() {
    'use strict';
    this.element_.removeEventListener('mousedown', this.boundDownHandler);
    this.element_.removeEventListener('touchstart', this.boundDownHandler);
    this.element_.removeEventListener('mouseup', this.boundUpHandler);
    this.element_.removeEventListener('mouseleave', this.boundUpHandler);
    this.element_.removeEventListener('touchend', this.boundUpHandler);
    this.element_.removeEventListener('blur', this.boundUpHandler);
  };
  componentHandler.register({
    constructor: MaterialRipple,
    classAsString: 'MaterialRipple',
    cssClass: 'mdl-js-ripple-effect',
    widget: false
  });
})(require("process"));
