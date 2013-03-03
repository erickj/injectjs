goog.provide('inject.InjectedFunctionBuilder');

goog.require('inject.util');



/**
 * @param {function} fn The function to inject into
 * @param {!inject.Container} container The injection container.
 * @constructor
 */
inject.InjectedFunctionBuilder = function(fn, container) {
  /**
   * @type {function}
   * @private
   */
  this.functionToInject_ = fn;

  /**
   * @type {!inject.Container}
   */
  this.container_ = container;

  /**
   * @type {*}
   * @private
   */
  // Default to global scope for now.
  this.fnScope_ = null;

  /**
   * @type {boolean}
   * @private
   */
  this.isConstructor_ = true;
};


/**
 * @return {function} The injected function
 */
inject.InjectedFunctionBuilder.prototype.build = function() {
  var fn = this.functionToInject_;
  var fnScope = this.fnScope_;
  var isCtor = this.isConstructor_;
  var rawParams = inject.InjectedFunctionBuilder.parseParams(fn);
  var keys = inject.InjectedFunctionBuilder.parseInjectionTypes(rawParams);
  var values = [];
  for (var i = 0; i < keys.length; i++) {
    values[i] = keys[i] ? this.container_.getDependency(keys[i]) : null;
  }

  return function() {
    var args = inject.util.toArray(arguments);
    var params = [];
    for (var i = 0; i < values.length; i++) {
      params.push(values[i] || args.shift());
    }
    return isCtor ? fn.apply(this, params) : fn.apply(fnScope, params);
  };
};


/**
 * @param {function} fn Function to parse for injection keys.
 * @return {!Array.<string>} The parameter list.
 */
inject.InjectedFunctionBuilder.parseParams = function(fn) {
  var fnString = fn.toString();
  var matches =
      fnString.match(inject.InjectedFunctionBuilder.FnParamsRegex_);
  var params = matches[1].split(',');
  var trimmedParams = [];
  for (var i = 0; i < params.length; i++) {
    var param = params[i].trim();
    if (param) {
      trimmedParams.push(param);
    }
  }
  return trimmedParams;
};


/**
 * @param {!Array.<string>} params The list of function params.
 * @return {!Array.<string>} A sparse array of injected type strings.
 */
inject.InjectedFunctionBuilder.parseInjectionTypes = function(params) {
  var typeStrings = [];
  for (var i = 0; i < params.length; i++) {
    var matches =
        params[i].match(inject.InjectedFunctionBuilder.InjectAnnotationRegex_);
    typeStrings.push(matches ? matches[1] : null);
  }
  return typeStrings;
};


/**
 * @type {!RegExp}
 * @private
 */
inject.InjectedFunctionBuilder.FnParamsRegex_ =
    /^function\s*(?:[^\(\s]*)\s*\(([^\)]*)\)/;


/**
 * @type {!RegExp}
 * @private
 */
inject.InjectedFunctionBuilder.InjectAnnotationRegex_ =
    /^\/\*\s*@inject\s{([^}]*)}\s*\*\//
