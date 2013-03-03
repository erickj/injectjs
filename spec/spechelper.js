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
    },
    toThrowInstanceOf: function(type) {
      var result = false;
      var actual = this.actual;
      if (typeof actual != 'function') {
        throw new Error('Actual is not a function');
      }
      try {
        actual();
      } catch(e) {
        result = e instanceof type;
      }

      return result;
    }
  });
});
