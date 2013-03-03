goog.provide('inject.util');


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
