goog.provide('inject.Spec');

goog.require('inject');
goog.require('inject.Binding');

describe('inject', function() {
  var isPhantomjs = navigator.userAgent.match(/phantomjs/i);

  describe('<static>.$inject', function() {
    var Ctor = function(
        /* @inject {foo.bar} */ bar, /* @inject {foo.baz} */ baz) {
      this.bar = bar;
      this.baz = baz;
    };
    var fooBarVal;
    var fooBazVal;

    beforeEach(function() {
      var foo = {
        bar: 'bar-key',
        baz: 'baz-key'
      };
      fooBarVal = {};
      fooBazVal = {};
      window.foo = foo;

      inject.$bind(foo.bar, true /* opt_overwrite */).toInstance(fooBarVal);
      inject.$bind(foo.baz, true /* opt_overwrite */).toInstance(fooBazVal);
    });

    it('should inject dependencies into a function from provided keys', function() {
      var InjectedIntoCtor = inject.$into(Ctor, foo.bar, foo.baz);
      var inst = new InjectedIntoCtor();
      expect(inst.bar).toBe(fooBarVal);
      expect(inst.baz).toBe(fooBazVal);
    });

    it('should inject dependencies from annotations if no keys are provided',
       function() {
         if (isPhantomjs) {
           // Parameter parsing doesn't work in PhantomJS. see note above.
           return;
         }

         var InjectedIntoCtor = inject.$into(Ctor);
         var inst = new InjectedIntoCtor();
         expect(inst.bar).toBe(fooBarVal);
         expect(inst.baz).toBe(fooBazVal);
       });
  });

  describe('<static>.$bind and <static>.$locate', function() {
    it('should bind a provider function to a dependency', function() {
      var key = {};
      var val = {};
      var binding = inject.$bind(key);
      expect(binding).toBeA(inject.Binding);
      binding.toInstance(val);
      expect(inject.$locate(key)).toBe(val);
    });
  });
});
