goog.provide('injectjs');


injectjs.$inject = function() {
};


injectjs.$provide = function() {
};


injectjs.$bind = function() {
};


injectjs.extend = function(child, parent) {
  var tmp = new Function();
  tmp.prototype = parent.prototype;
  child.prototype = new tmp();
  child.prototype.constructor = child;
};
