goog.provide('inject.Container');
goog.provide('inject.ContainerMissingDependencyError');
goog.provide('inject.ContainerOverwriteDependencyError');

goog.require('inject.ObjectMap');
goog.require('inject.util');



/**
 * @constructor
 * @extends {Error}
 */
inject.ContainerMissingDependencyError = function() {};
goog.inherits(inject.ContainerMissingDependencyError, Error);



/**
 * @constructor
 * @extends {Error}
 */
inject.ContainerOverwriteDependencyError = function() {};
goog.inherits(inject.ContainerOverwriteDependencyError, Error);



/**
 * A container for provided builders.
 * @constructor
 */
inject.Container = function() {
  /**
   * @type {!Object.<string,function()>}
   * @private
   */
  this.dependencyMap_ = new inject.ObjectMap();
};


/**
 * @param {*} key .
 * @param {function()} dependency .
 * @param {boolean=} opt_throwIfExists Throws an error if the key is already
 *     set. Defaults to false.
 */
inject.Container.prototype.provideDependency =
    function(key, dependency, opt_throwIfExists) {
  if (opt_throwIfExists && this.dependencyMap_.hasKey(key)) {
    throw new inject.ContainerOverwriteDependencyError();
  }
  this.dependencyMap_.put(key, dependency);
};


/**
 * @param {*} key .
 * @return {*} The requested dependency or throws a
 *     ContainerMissingDependencyError if no dependency is found.
 * @throws {inject.ContainerMissingDependencyError}
 */
inject.Container.prototype.getDependency = function(key) {
  var result = this.dependencyMap_.get(key);
  if (goog.isNull(result) && typeof key == 'string') {
    // If the key is a string and the first lookup failed, try to resolve the
    // key as a property path.
    key = inject.util.getPropertyPath(key);
    if (key) {
      result = this.dependencyMap_.get(key);
    }
  }

  if (goog.isNull(result)) {
    throw new inject.ContainerMissingDependencyError();
  }

  return result();
};
