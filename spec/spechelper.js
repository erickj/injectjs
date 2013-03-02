goog.provide('spechelper');

var fail = function() {
  expect('it').toFail();
};

beforeEach(function() {
  this.addMatchers({
    toFail: function() {
      return false;
    },
    toBeA: function(type) {
      return this.actual instanceof type;
    }
  });
});
