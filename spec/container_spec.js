goog.provide('inject.ContainerSpec');

goog.require('inject.Container');
goog.require('inject.ContainerMissingDependencyError');
goog.require('inject.ContainerOverwriteDependencyError');

describe('inject.Container', function() {
  var container;
  var key;
  beforeEach(function() {
    container = new inject.Container();
    key = {};
  });

  describe('#provideDependency', function() {
    it('should add a dependency', function() {
      container.provideDependency(key, function() {});
    });

    it('should throw an error if opt_throwIfExists is true and a key exists',
       function() {
         // Only passing true in this first call to ensure this does not throw
         // if true when a key is not set. It's just overkill for its own spec.
         container.provideDependency(
             key, function() {}, true /* opt_throwIfExists */);
         expect(function() {
           container.provideDependency(
               key, function() {}, true /* opt_throwIfExists */);
         }).toThrowInstanceOf(inject.ContainerOverwriteDependencyError);
       });
  });

  describe('#getDependency', function() {
    var providerFn;
    var providerFnWasCalled;
    var result = {};

    beforeEach(function() {
      providerFn = function() {
        providerFnWasCalled = true;
        return result;
      };
      providerFnWasCalled = false;
      container.provideDependency(key, providerFn);
    });

    it('should return a provided dependency', function() {
      expect(container.getDependency(key)).toBe(result);
      expect(providerFnWasCalled).toBe(true);
    });

    it('should throw a ContainerMissingDependencyError if there is no dep',
       function() {
         expect(function() {
           container.getDependency('missing key')
         }).toThrowInstanceOf(inject.ContainerMissingDependencyError);
       });
  });
});
