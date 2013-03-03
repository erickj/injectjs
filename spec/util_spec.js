goog.provide('inject.utilSpec');

goog.require('inject.util');

describe('inject.util', function() {
  describe('<static>.toArray', function() {
    it('should create a new array from an existin array', function() {
      var array = [1,2,3];
      expect(inject.util.toArray(array)).toEqual(array);
      expect(inject.util.toArray(array)).toNotBe(array);
    });

    it('should creaet a new array from fn arguments', function() {
      var array = (function(a, b, c) {
                     return inject.util.toArray(arguments);
                   }(1,2,3));
      expect(array).toEqual([1,2,3]);
    });
  });
});
