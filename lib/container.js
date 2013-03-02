goog.provide('injectjs.Container');
goog.provide('injectjs.ContainerMissingDependencyError');



injectjs.ContainerMissingDependencyError = function(message) {
  this.message = message;
};
injects.extend(injectjs.ContainerMissingDependencyError, Error);


/**
 * A container for provided builders.
 */
injectjs.Container = function() {
  /**
   * @type {!Object.<string,function>}
   */
  this.dependencies_ = {};
};


/**
 * @param {string} key .
 * @param {function} provider .
 * @param {boolean} opt_throwIfExists Throws an error if the key is already
 *     set. Defaults to false.
 */
injectjs.Container.prototype.provideDependency =
    function(key, provider, opt_throwIfExists) {
  if (opt_throwIfExists && this.dependencies_[key]) {
    throw new Error('Unable to overwrite injection key: ' + key);
  }
  this.dependencies_[key] = provider;
};


/**
 * @param {string} key .
 * @return {*} The requested dependency or throws a
 *     ContainerMissingDependencyError if no dependency is found.
 * @throws {injectjs.ContainerMissingDependencyError}
 */
injectjs.Container.prototype.getDependency = function(key) {
  if (!this.dependencies_[key]) {
    throw new injectjs.ContainerMissingDependencyError(key);
  }
  return this.dependencies_;
};
