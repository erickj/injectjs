goog.provide('inject.util');
goog.provide('inject.global');


inject.global = window;


/**
 * @param {*} arrayLike An array or list.
 * @return {!Array} The new array.
 */
inject.util.toArray = function(arrayLike) {
  var length = arrayLike.length || 0;
  var array = [];
  for (var i = 0; i < length; i++) {
    array.push(arrayLike[i]);
  }
  return array;
};


/**
 * @param {string} path A property path.
 * @param {!Object=} opt_scope An optional object scope.
 * @return {*} The property at path or null.
 */
inject.util.getPropertyPath = function(path, opt_scope) {
  var current = opt_scope || inject.global;
  var parts = path.split('.');
  for (var i = 0; i < parts.length; i++) {
    if (!current) {
      return null;
    }
    current = current[parts[i]];
  };
  return current;
};
