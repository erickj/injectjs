goog.provide('inject.InjectedFunctionBuilder');

goog.require('inject.util');



/**
 * @param {function()} fn The function to inject into.
 * @param {!inject.Container} container The injection container.
 * @constructor
 */
inject.InjectedFunctionBuilder = function(fn, container) {
  /**
   * @type {function()}
   * @private
   */
  this.functionToInject_ = fn;

  /**
   * @type {!inject.Container}
   * @private
   */
  this.container_ = container;

  /**
   * @type {!Array}
   * @private
   */
  this.injectionKeys_ = [];

  /**
   * @type {*}
   * @private
   */
  this.scope_ = null;
};


/**
 * @param {*} key A key to inject.
 * @return {!inject.InjectedFunctionBuilder} This.
 */
inject.InjectedFunctionBuilder.prototype.addInjectionKey = function(key) {
  this.injectionKeys_.push(key);
  return this;
};


/**
 * @param {*} scope Object to use as this in the injected function.
 * @return {!inject.InjectedFunctionBuilder} This.
 */
inject.InjectedFunctionBuilder.prototype.setScope = function(scope) {
  this.scope_ = scope;
  return this;
}


/**
 * EXPERIMENTAL, this may not work in all browsers.  Browsers implementations
 * with known problems:
 * - phantomjs (v1.6.0, v1.8.2)
 *
 * Known to work on:
 * - Chrome (v23)
 * - Firefox (v19)
 * @return {!inject.InjectedFunctionBuilder} This.
 */
inject.InjectedFunctionBuilder.prototype.injectFromAnnotations = function() {
  var rawParams =
      inject.InjectedFunctionBuilder.parseParams(this.functionToInject_);
  var keys = inject.InjectedFunctionBuilder.parseInjectionTypes(rawParams);
  for (var i = 0; i < keys.length; i++) {
    this.addInjectionKey(keys[i]);
  }
  return this;
};


/**
 * @return {function()} A new function that curries in the injections.
 */
inject.InjectedFunctionBuilder.prototype.build = function() {
  var fn = this.functionToInject_;
  var keys = this.injectionKeys_;
  var scope = this.scope_;
  var values = [];
  for (var i = 0; i < keys.length; i++) {
    values[i] = keys[i] ? this.container_.getDependency(keys[i]) : null;
  }

  return function() {
    var isCtor = this instanceof arguments.callee;
    scope = isCtor ? this : scope;
    var args = inject.util.toArray(arguments);
    var params = [];
    var i = 0;
    while (args.length || i < values.length) {
      params.push(values[i++] || args.shift());
    }
    return fn.apply(scope, params);
  };
};


/**
 * @param {function()} fn Function to parse for injection keys.
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
    /^\/\*\s*@inject\s{([^}]*)}\s*\*\//;
