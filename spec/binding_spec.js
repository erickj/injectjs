goog.provide('inject.BindingSpec');

goog.require('inject.Binding');
goog.require('inject.Container');

describe('inject.Binding', function() {
  var container;
  var binding;
  var key;
  beforeEach(function() {
    container = new inject.Container();
    key = {};
    binding = new inject.Binding(container, key);
  });

  describe('#provideToContainer', function() {
    it('should throw if a provider function is not set', function() {
      expect(function() {
        binding.provideToContainer()
      }).toThrow();
    });

    it('should return true if a binding is provided', function() {
      binding.toInstance({});
      expect(binding.provideToContainer()).toBe(true);
    });
  });

  describe('#unlessProvided', function() {
    it('should return the current binding', function() {
      expect(binding.unlessProvided()).toBe(binding);
    });

    it('should cause a dependency to not be set, if one is set', function() {
      var inst = {};
      container.provideDependency(key, function() { return inst; });

      expect(binding.unlessProvided().toInstance({})).toBe(false);
      expect(container.getDependency(key)).toBe(inst);
    });
  });

  describe('#toInstance', function() {
    it('should bind a dependency to a single instance', function() {
      var inst = {};

      expect(binding.toInstance(inst)).toBe(true);
      expect(container.getDependency(key)).toBe(inst);
    });
  });

  describe('#asConstructor', function() {
    it('should bind a dependency to a constructor', function() {
      var Ctor = function() {
        this.x = "x";
      };

      expect(binding.asConstructor(Ctor)).toBe(true);

      var inst = container.getDependency(key);
      var inst2 = container.getDependency(key);
      expect(inst).toBeA(Ctor);
      expect(inst2).toBeA(Ctor);
      expect(inst2).toNotBe(inst);
    });
  });
});
