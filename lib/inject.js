goog.provide('inject');

goog.require('inject.Binding');
goog.require('inject.Container');
goog.require('inject.InjectedFunctionBuilder');
goog.require('inject.util');


/**
 * @param {function} fn A function to inject dependencies into.
 * @param {...*} var_keys A variable length number of injection keys.
 * @return {function} The injected function.
 */
inject.$into = function(fn, var_keys) {
  var container = inject.getContainer_();
  var builder = new inject.InjectedFunctionBuilder(fn, container);

  var injectionKeys = inject.util.toArray(arguments);
  injectionKeys.shift();
  if (injectionKeys.length) {
    for (var i = 0; i < injectionKeys.length; i++) {
      builder.addInjectionKey(injectionKeys[i]);
    }
  } else {
    builder.injectFromAnnotations();
  }

  return builder.build();
};


/**
 * @param {*} key .
 * @return {*} The dependency at key or null if not set.
 */
inject.$locate = function(key) {
  var container = inject.getContainer_();
  var dep = null;
  try {
    dep = container.getDependency(key);
  } catch(e) {
    if (!(e instanceof inject.ContainerMissingDependencyError)) {
      throw e;
    };
  }
  return dep;
};


/**
 * @param {*} key .
 * @param {boolean=} opt_overwrite Whether to overwrite any values, defaults to
 *     false.
 * @return {!inject.Binding}
 */
inject.$bind = function(key, opt_overwrite) {
  var container = inject.getContainer_();
  var binding = new inject.Binding(container, key);
  if (!opt_overwrite) {
    binding.unlessProvided();
  }
  return binding;
};


/**
 * @type {inject.Container}
 * @private
 */
inject.container_ = null;


/**
 * @return {!inject.Container}
 * @private
 */
inject.getContainer_ = function() {
  if (!inject.container_) {
    inject.container_ = new inject.Container();
  }
  return inject.container_;
}
