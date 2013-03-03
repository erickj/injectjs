goog.provide('inject.ObjectMap');



/**
 * @constructor
 */
inject.ObjectMap = function() {
  /**
   * @type {!Array.<*>}
   * @private
   */
  this.objects_ = [];

  /**
   * @type {!Object.<number, *>}
   * @private
   */
  this.valueMap_ = {};
};


/**
 * @param {*} key .
 * @param {*} value .
 */
inject.ObjectMap.prototype.put = function(key, value) {
  var keyIndex = this.getKeyIndex_(key);
  if (keyIndex == -1) {
    keyIndex = this.objects_.push(key) - 1;
  }
  this.valueMap_[keyIndex] = value;
};


/**
 * @param {*} key .
 * @return {*} The value at key.
 */
inject.ObjectMap.prototype.get = function(key) {
  var keyIndex = this.getKeyIndex_(key);
  if (keyIndex == -1) {
    return null;
  }
  return this.valueMap_[keyIndex];
};


/**
 * @param {*} key .
 * @return {boolean} Whether the key is in the map.
 */
inject.ObjectMap.prototype.hasKey = function(key) {
  return this.getKeyIndex_(key) > -1;
};


/**
 * O(n)
 * @param {*} key .
 * @return {number} The index of key or -1.
 * @private
 */
inject.ObjectMap.prototype.getKeyIndex_ = function(key) {
  return this.objects_.indexOf(key);
};
