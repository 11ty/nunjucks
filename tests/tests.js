(function() {
  'use strict';

  var expect, util, render, equal, finish;

  if (typeof require !== 'undefined') {
    expect = globalThis.expect;
    util = require('./util');
  } else {
    expect = globalThis.expect;
    util = window.util;
  }

  render = util.render;
  equal = util.equal;
  finish = util.finish;

  describe('tests', function() {
    it('callable should detect callability', function() {
      var callable = render('{{ foo is callable }}', {
        foo: function() {
          return '!!!';
        }
      });
      var uncallable = render('{{ foo is not callable }}', {
        foo: '!!!'
      });
      expect(callable).toBe('true');
      expect(uncallable).toBe('true');
    });

    it('defined should detect definedness', function() {
      expect(render('{{ foo is defined }}')).toBe('false');
      expect(render('{{ foo is not defined }}')).toBe('true');
      expect(render('{{ foo is defined }}', {
        foo: null
      })).toBe('true');
      expect(render('{{ foo is not defined }}', {
        foo: null
      })).toBe('false');
    });

    it('should support "is defined" in {% if %} expressions', function() {
      expect(
        render('{% if foo is defined %}defined{% else %}undefined{% endif %}',
          {})
      ).toBe('undefined');
      expect(
        render('{% if foo is defined %}defined{% else %}undefined{% endif %}',
          {foo: null})
      ).toBe('defined');
    });

    it('should support "is not defined" in {% if %} expressions', function() {
      expect(
        render('{% if foo is not defined %}undefined{% else %}defined{% endif %}',
          {})
      ).toBe('undefined');
      expect(
        render('{% if foo is not defined %}undefined{% else %}defined{% endif %}',
          {foo: null})
      ).toBe('defined');
    });

    it('undefined should detect undefinedness', function() {
      expect(render('{{ foo is undefined }}')).toBe('true');
      expect(render('{{ foo is not undefined }}')).toBe('false');
      expect(render('{{ foo is undefined }}', {
        foo: null
      })).toBe('false');
      expect(render('{{ foo is not undefined }}', {
        foo: null
      })).toBe('true');
    });

    it('none/null should detect strictly null values', function() {
      // required a change in lexer.js @ 220
      expect(render('{{ null is null }}')).toBe('true');
      expect(render('{{ none is none }}')).toBe('true');
      expect(render('{{ none is null }}')).toBe('true');
      expect(render('{{ foo is null }}')).toBe('false');
      expect(render('{{ foo is not null }}', {
        foo: null
      })).toBe('false');
    });

    it('divisibleby should detect divisibility', function() {
      var divisible = render('{{ "6" is divisibleby(3) }}');
      var notDivisible = render('{{ 3 is not divisibleby(2) }}');
      expect(divisible).toBe('true');
      expect(notDivisible).toBe('true');
    });

    it('escaped should test whether or not something is escaped', function() {
      var escaped = render('{{ (foo | safe) is escaped }}', {
        foo: 'foobarbaz'
      });
      var notEscaped = render('{{ foo is escaped }}', {
        foo: 'foobarbaz'
      });
      expect(escaped).toBe('true');
      expect(notEscaped).toBe('false');
    });

    it('even should detect whether or not a number is even', function() {
      var fiveEven = render('{{ "5" is even }}');
      var fourNotEven = render('{{ 4 is not even }}');
      expect(fiveEven).toBe('false');
      expect(fourNotEven).toBe('false');
    });

    it('odd should detect whether or not a number is odd', function() {
      var fiveOdd = render('{{ "5" is odd }}');
      var fourNotOdd = render('{{ 4 is not odd }}');
      expect(fiveOdd).toBe('true');
      expect(fourNotOdd).toBe('true');
    });

    it('mapping should detect Maps or hashes', function() {
      /* global Map */
      var map1, map2, mapOneIsMapping, mapTwoIsMapping;
      if (typeof Map === 'undefined') {
        this.skip();
      } else {
        map1 = new Map();
        map2 = {};
        mapOneIsMapping = render('{{ map is mapping }}', {
          map: map1
        });
        mapTwoIsMapping = render('{{ map is mapping }}', {
          map: map2
        });
        expect(mapOneIsMapping).toBe('true');
        expect(mapTwoIsMapping).toBe('true');
      }
    });

    it('falsy should detect whether or not a value is falsy', function() {
      var zero = render('{{ 0 is falsy }}');
      var pancakes = render('{{ "pancakes" is not falsy }}');
      expect(zero).toBe('true');
      expect(pancakes).toBe('true');
    });

    it('truthy should detect whether or not a value is truthy', function() {
      var nullTruthy = render('{{ null is truthy }}');
      var pancakesNotTruthy = render('{{ "pancakes" is not truthy }}');
      expect(nullTruthy).toBe('false');
      expect(pancakesNotTruthy).toBe('false');
    });

    it('greaterthan than should detect whether or not a value is less than another', function() {
      var fiveGreaterThanFour = render('{{ "5" is greaterthan(4) }}');
      var fourNotGreaterThanTwo = render('{{ 4 is not greaterthan(2) }}');
      expect(fiveGreaterThanFour).toBe('true');
      expect(fourNotGreaterThanTwo).toBe('false');
    });

    it('ge should detect whether or not a value is greater than or equal to another', function() {
      var fiveGreaterThanEqualToFive = render('{{ "5" is ge(5) }}');
      var fourNotGreaterThanEqualToTwo = render('{{ 4 is not ge(2) }}');
      expect(fiveGreaterThanEqualToFive).toBe('true');
      expect(fourNotGreaterThanEqualToTwo).toBe('false');
    });

    it('lessthan than should detect whether or not a value is less than another', function() {
      var fiveLessThanFour = render('{{ "5" is lessthan(4) }}');
      var fourNotLessThanTwo = render('{{ 4 is not lessthan(2) }}');
      expect(fiveLessThanFour).toBe('false');
      expect(fourNotLessThanTwo).toBe('true');
    });

    it('le should detect whether or not a value is less than or equal to another', function() {
      var fiveLessThanEqualToFive = render('{{ "5" is le(5) }}');
      var fourNotLessThanEqualToTwo = render('{{ 4 is not le(2) }}');
      expect(fiveLessThanEqualToFive).toBe('true');
      expect(fourNotLessThanEqualToTwo).toBe('true');
    });

    it('ne should detect whether or not a value is not equal to another', function() {
      var five = render('{{ 5 is ne(5) }}');
      var four = render('{{ 4 is not ne(2) }}');
      expect(five).toBe('false');
      expect(four).toBe('false');
    });

    it('iterable should detect that a generator is iterable', function(done) {
      /* eslint-disable no-eval */
      var iterable;
      try {
        iterable = eval('(function* iterable() { yield true; })()');
      } catch (e) {
        return this.skip(); // Browser does not support generators
      }
      equal('{{ fn is iterable }}', { fn: iterable }, 'true');
      return done();
    });

    it('iterable should detect that an Array is not non-iterable', function() {
      equal('{{ arr is not iterable }}', { arr: [] }, 'false');
    });

    it('iterable should detect that a Map is iterable', function() {
      if (typeof Map === 'undefined') {
        this.skip();
      } else {
        equal('{{ map is iterable }}', { map: new Map() }, 'true');
      }
    });

    it('iterable should detect that a Set is not non-iterable', function() {
      /* global Set */
      if (typeof Set === 'undefined') {
        this.skip();
      } else {
        equal('{{ set is not iterable }}', { set: new Set() }, 'false');
      }
    });

    it('number should detect whether a value is numeric', function() {
      var num = render('{{ 5 is number }}');
      var str = render('{{ "42" is number }}');
      expect(num).toBe('true');
      expect(str).toBe('false');
    });

    it('string should detect whether a value is a string', function() {
      var num = render('{{ 5 is string }}');
      var str = render('{{ "42" is string }}');
      expect(num).toBe('false');
      expect(str).toBe('true');
    });

    it('equalto should detect value equality', function() {
      var same = render('{{ 1 is equalto(2) }}');
      var notSame = render('{{ 2 is not equalto(2) }}');
      expect(same).toBe('false');
      expect(notSame).toBe('false');
    });

    it('sameas should alias to equalto', function() {
      var obj = {};
      var same = render('{{ obj1 is sameas(obj2) }}', {
        obj1: obj,
        obj2: obj
      });
      expect(same).toBe('true');
    });

    it('lower should detect whether or not a string is lowercased', function() {
      expect(render('{{ "foobar" is lower }}')).toBe('true');
      expect(render('{{ "Foobar" is lower }}')).toBe('false');
    });

    it('upper should detect whether or not a string is uppercased', function() {
      expect(render('{{ "FOOBAR" is upper }}')).toBe('true');
      expect(render('{{ "Foobar" is upper }}')).toBe('false');
    });

    it('should render async extensions inside macro', function(done) {
      function AsyncExtension() {
        this.tags = ['asyncextension'];

        this.parse = function(parser, nodes, lexer) {
          var tok, args, body, errorBody;
          tok = parser.nextToken();
          args = parser.parseSignature(null, true);
          parser.advanceAfterBlockEnd(tok.value);
          body = parser.parseUntilBlocks('error', 'endasyncextension');
          errorBody = null;

          if (parser.skipSymbol('error')) {
            parser.skip(lexer.TOKEN_BLOCK_END);
            errorBody = parser.parseUntilBlocks('endasyncextension');
          }

          parser.advanceAfterBlockEnd();

          return new nodes.CallExtensionAsync(this, 'run', args, [body, errorBody]);
        };

        this.run = function(context, url, body, errorBody, callback) {
          callback(null, 'Foo async extension content');
        };
      }

      let contents = '{% macro wrap() %}{{ caller() }}{% endmacro %}' +
        '{% call wrap() %}{% asyncextension "foobar" %}1{% error %}2{% endasyncextension %}{% endcall %}';

      equal(contents, null,
        { extensions: { AsyncExtension: new AsyncExtension() } },
        'Foo async extension content');

      finish(done);
    });
  });
}());
