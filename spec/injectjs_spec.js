goog.provide('injectjsSpec');

describe('injectjs', function() {
  describe('<static>.$inject', function() {
    it('should return a provided dependency', function() {
      fail();
    });
  });

  describe('<static>.$provide', function() {
    it('should register a dependency', function() {
      fail();
    });
  });

  describe('<static>.$bind', function() {
    it('should bind an instance to a dependency', function() {
      fail();
    });
  });

  describe('<static>.extend', function() {
    var xVal = "x";
    var Parent = (
      function() {
        var Ctor = function() {
          this.x = xVal;
        };

        Ctor.prototype.getX = function() {
          return this.x;
        };

        return Ctor;
      }());

    it('should setup a prototype chain', function() {
      var Child = function() {
        this.y = "y";
      }
      injectjs.extend(Child, Parent);

      var c = new Child();
      expext(c.getX()).toBe(xVal);
      expect(c.y).toBe("y");
      expect(c.constructor).toBe(Child);
    });
  });
});