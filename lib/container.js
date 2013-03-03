goog.provide('inject.Container');
goog.provide('inject.ContainerMissingDependencyError');



inject.ContainerMissingDependencyError = function(message) {
  this.message = message;
};
goog.inherits(inject.ContainerMissingDependencyError, Error);


/**
 * A container for provided builders.
 */
inject.Container = function() {
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
inject.Container.prototype.provideDependency =
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
 * @throws {inject.ContainerMissingDependencyError}
 */
inject.Container.prototype.getDependency = function(key) {
  if (!this.dependencies_[key]) {
    throw new inject.ContainerMissingDependencyError(key);
  }
  return this.dependencies_;
};
