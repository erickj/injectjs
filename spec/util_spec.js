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

  describe('<static>.getPropertyPath', function() {
    var scope = {
      foo: {
        bar: 'baz'
      }
    }

    it('should return the property at the give path from inject.global',
       function() {
         var global = inject.global;
         inject.global = scope;
         expect(inject.util.getPropertyPath('foo.bar')).toBe('baz');
         inject.global = global;
       });

    it('should return the property at the given path from opt_scope',
       function() {
         expect(inject.util.getPropertyPath('foo.bar', scope)).toBe('baz');
       });

    it('should return null for an unknown path', function() {
      expect(inject.util.getPropertyPath('fiz.buz')).toBe(null);
    });
  });
});
