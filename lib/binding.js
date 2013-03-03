goog.provide('inject.Binding');

goog.require('inject.ContainerOverwriteDependencyError');



/**
 * @param {!inject.Container} container .
 * @param {*} key .
 * @constructor
 */
inject.Binding = function(container, key) {
  /**
   * @type {!inject.Container}
   * @private
   */
  this.container_ = container;

  /**
   * @type {boolean}
   * @private
   */
  this.overwrite_ = true;

  /**
   * @type {*}
   * @private
   */
  this.key_ = key;

  /**
   * @type {?function}
   * @private
   */
  this.fn_ = null;
};


/**
 * @return {boolean} True indicates a value was provided.
 * @throws
 */
inject.Binding.prototype.provideToContainer = function() {
  if (!this.key_ || !this.fn_) {
    throw new Error('Unable to bind dependency to container');
  }

  var provided = true;
  var throwIfExists = !this.overwrite_;
  try {
    this.container_.provideDependency(this.key_, this.fn_, throwIfExists);
  } catch(e) {
    if (!(e instanceof inject.ContainerOverwriteDependencyError)) {
      throw e;
    }
    provided = false;
  }
  return provided;
};


/**
 * @return {!inject.Binding} This.
 */
inject.Binding.prototype.unlessProvided = function() {
  this.overwrite_ = false;
  return this;
};


/**
 * @param {*} val The value to bind the path to.
 * @return {!inject.Binding} This.
 */
inject.Binding.prototype.toInstance = function(val) {
  this.fn_ = function() {
    return val;
  };
  return this;
};


/**
 * @param {function} ctor Bind the key to a constructor and new up
 *     instances in on injection.
 * @return {!inject.Binding} This.
 */
inject.Binding.prototype.asConstructor = function(ctor) {
  this.fn_ = function() {
    return new ctor();
  };
  return this;
};


/**
 * @param {*} singleton Binds the path to an object that responds to
 *     the #getInstance method.
 * @return {!inject.Binding} This.
 * @throws
 */
inject.Binding.prototype.asSingleton = function(singleton) {
  if (!(typeof singleton.getInstance == 'function')) {
    throw new Error('Unable to locate singleton method');
  }
  this.fn_ = function() {
    return singleton.getInstance();
  };
  return this;
};
