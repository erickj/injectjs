goog.provide('inject.InjectedFunctionBuilderSpec');

goog.require('inject.Binding');
goog.require('inject.Container');
goog.require('inject.InjectedFunctionBuilder');

describe('inject.InjectedFunctionBuilder', function() {
  var isPhantomjs = navigator.userAgent.match(/phantomjs/i);

  describe('<static>.parseParams', function() {
    var regex = inject.InjectedFunctionBuilder.ParamsMatcher_;
    var functionExamples = {
      noParams: {
        fn: function() {},
        expect: []
      },
      oneParam: {
        fn: function(a) {},
        expect: ['a']
      },
      multiParam: {
        fn: function(a,b,c) {},
        expect: ['a','b','c']
      },
      spacerBeforeParen: {
        fn: function (a) {},
        expect: ['a']
      },
      namedFn1: {
        fn: function foo(a) {},
        expect: ['a']
      },
      namedFn2: {
        fn: function $fooZ(a) {},
        expect: ['a']
      },
      namedFn3: {
        fn: function _foo2 (aSpacerAfterFnNameToo) {},
        expect: ['aSpacerAfterFnNameToo']
      },
      multiLine1: {
        fn: function(a,
                     b) {},
        expect: ['a','b']
      },
      multiLine2: {
        fn: function(
          a,b) {},
        expect: ['a','b']
      },
      comments: {
        fn: function(/* comment */a,b) {},
        expect: ['/* comment */a','b']
      }
    };
    it('should match params in the function examples', function() {
      for (var desc in functionExamples) {
        if (isPhantomjs && desc == 'comments') {
          // PhantomJS strips comments from the fn... uh-oh.  Chrome and FF
          // leave the comment in.
          continue;
        }
        var params = inject.InjectedFunctionBuilder.parseParams(
          functionExamples[desc].fn);
        var expected = functionExamples[desc].expect;
        expect(params.length).toBe(expected.length);
        for (var i = 0; i < params.length; i++) {
          expect(params[i]).toBe(expected[i]);
        }
      };
    });
  });

  describe('<static>.parseInjectionTypes', function() {
    var params = [
      'baz',
      '/* @inject {foo.bar} */baz',
      '/*@inject {_foo2$bar}*/baz'
    ];
    var expected = [null, 'foo.bar', '_foo2$bar'];
    it('should parse injection annotations from parameter strings', function() {
      var actual = inject.InjectedFunctionBuilder.parseInjectionTypes(params);
      expect(actual).toEqual(expected);
    });
  });

  describe('#build', function() {
    var Ctor = function(
        /* @inject {foo.bar} */ foo,
        /* @inject {biz.baz} */ biz,
        buz) {
      this.foo = foo;
      this.biz = biz;
      this.buz = buz;
    };
    var container;
    var fooBarVal;
    var bizBazVal;
    var globalScope;

    beforeEach(function() {
      globalScope = {};

      var foo = { bar: 'foo-bar-key' };
      var biz = { baz: 'biz-baz-key' };
      fooBarVal = {};
      bizBazVal = {};

      window.foo = foo;
      window.biz = biz;

      container = new inject.Container();

      new inject.Binding(container, foo.bar).toInstance(fooBarVal);
      new inject.Binding(container, biz.baz).toInstance(bizBazVal);
    });

    describe('parameter currying', function() {
      it('should pass uncurried parameters correctly', function() {
        var InjectedCtor = new inject.InjectedFunctionBuilder(Ctor, container).
          addInjectionKey('foo.bar').
          addInjectionKey('biz.baz').
          build();
        var inst = new InjectedCtor('buz-val');

        expect(inst.buz).toBe('buz-val');
      });
    });

    describe('#setScope', function() {
      it('should be able to set function scope', function() {
        var scope = { x: 'me' };
        var getX = function() { return this.x; };
        var injectedFunction =
            new inject.InjectedFunctionBuilder(getX, container).
                setScope(scope).
                build();
        expect(injectedFunction()).toBe('me');
      });

      it('should ALWAYS use `this` as scope in constructors', function() {
        globalScope.foo = "not foo bar val";

        var InjectedCtor = new inject.InjectedFunctionBuilder(Ctor, container).
            setScope(globalScope). // expect this to be ignored
            addInjectionKey('foo.bar').
            addInjectionKey('biz.baz').
            build();
        var inst = new InjectedCtor();
        expect(inst.foo).toBe(fooBarVal);
      });
    });

    describe('#addInjectionKey', function() {
      it('should add injection keys as strings', function() {
        var InjectedCtor = new inject.InjectedFunctionBuilder(Ctor, container).
            addInjectionKey('foo.bar').
            addInjectionKey('biz.baz').
            build();
        var inst = new InjectedCtor();

        expect(inst.foo).toBe(fooBarVal);
        expect(inst.biz).toBe(bizBazVal);
      });

      it('should add injection keys as objects', function() {
        var InjectedCtor = new inject.InjectedFunctionBuilder(Ctor, container).
            addInjectionKey(foo.bar).
            addInjectionKey(biz.baz).
            build();
        var inst = new InjectedCtor();

        expect(inst.foo).toBe(fooBarVal);
        expect(inst.biz).toBe(bizBazVal);
      });
    });

    describe('#injectFromAnnotations', function() {

      it('should build an injected constructor', function() {
        if (isPhantomjs) {
          // Parameter parsing doesn't work in PhantomJS. see note above.
          return;
        }
        var InjectedCtor = new inject.InjectedFunctionBuilder(Ctor, container).
            injectFromAnnotations().
            build();
        var inst = new InjectedCtor('buz-val');

        expect(inst.foo).toBe(fooBarVal);
        expect(inst.biz).toBe(bizBazVal);
        expect(inst.buz).toBe('buz-val');
      });
    });
  });
});
