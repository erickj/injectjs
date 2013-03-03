goog.provide('inject.ObjectMapSpec');

goog.require('inject.ObjectMap');


describe('inject.ObjectMap', function() {
  var map;
  beforeEach(function() {
    map = new inject.ObjectMap();
  });

  describe('#put and #get', function() {
    it('should put primitive keys in the map', function() {
      map.put(1, 'a number');
      map.put('a', 'a string');
      map.put(true, 'a boolean');
      expect(map.get(1)).toBe('a number');
      expect(map.get('a')).toBe('a string');
      expect(map.get(true)).toBe('a boolean');
    });

    it('should put object keys in the map', function() {
      var obj1 = {};
      var obj2 = {};
      var arr1 = [];
      var arr2 = [];
      var regex = /abc/;

      map.put(obj1, 'first obj');
      map.put(obj2, 'second obj');
      map.put(arr1, 'first array');
      map.put(arr2, 'second array');
      map.put(regex, 'regex');

      expect(map.get(obj1)).toBe('first obj');
      expect(map.get(obj2)).toBe('second obj');
      expect(map.get(arr1)).toBe('first array');
      expect(map.get(arr2)).toBe('second array');
      expect(map.get(regex)).toBe('regex');
    });

    it('should overwrite values of existing keys', function() {
      var obj = {}
      map.put('key', 'first value');
      map.put('key', 'second value');
      expect(map.get('key')).toBe('second value');

      map.put(obj, 'first obj val');
      map.put(obj, 'second obj val');
      expect(map.get(obj)).toBe('second obj val');
    });
  });

  describe('#get', function() {
    it('should return null for if it does not have a key', function() {
      expect(map.get('foobar')).toBe(null);
    });
  });

  describe('#hasKey', function() {
    var obj;
    beforeEach(function() {
      obj = {};
      map.put('string', 'a string');
      map.put(obj, 'an object');
    });

    it('should have keys for which it has keys', function() {
      expect(map.hasKey('string')).toBe(true);
      expect(map.hasKey(obj)).toBe(true);
    });

    it('should not have keys for which it does not have keys', function() {
      expect(map.hasKey('no key')).toBe(false);
      expect(map.hasKey({})).toBe(false);
    });
  });
});
