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
    it('callable should detect callability', async function() {
      var callable = await render('{{ foo is callable }}', {
        foo: function() {
          return '!!!';
        }
      });
      var uncallable = await render('{{ foo is not callable }}', {
        foo: '!!!'
      });
      expect(callable).toBe('true');
      expect(uncallable).toBe('true');
    });

    it('defined should detect definedness', async function() {
      equal('{{ foo is defined }}', 'false');
      equal('{{ foo is not defined }}', 'true');
      equal('{{ foo is defined }}', {
        foo: null
      }, 'true');
      equal('{{ foo is not defined }}', {
        foo: null
      }, 'false');
    });

    it('should support "is defined" in {% if %} expressions', async function() {
      equal('{% if foo is defined %}defined{% else %}undefined{% endif %}',
        {}, 'undefined');
      equal('{% if foo is defined %}defined{% else %}undefined{% endif %}',
        {foo: null}, 'defined');
    });

    it('should support "is not defined" in {% if %} expressions', async function() {
      equal('{% if foo is not defined %}undefined{% else %}defined{% endif %}',
        {}, 'undefined');
      equal('{% if foo is not defined %}undefined{% else %}defined{% endif %}',
        {foo: null}, 'defined');
    });

    it('undefined should detect undefinedness', async function() {
      equal('{{ foo is undefined }}', 'true');
      equal('{{ foo is not undefined }}', 'false');
      equal('{{ foo is undefined }}', {
        foo: null
      }, 'false');
      equal('{{ foo is not undefined }}', {
        foo: null
      }, 'true');
    });

    it('none/null should detect strictly null values', async function() {
      // required a change in lexer.js @ 220
      equal('{{ null is null }}', 'true');
      equal('{{ none is none }}', 'true');
      equal('{{ none is null }}', 'true');
      equal('{{ foo is null }}', 'false');
      equal('{{ foo is not null }}', {
        foo: null
      }, 'false');
    });

    it('divisibleby should detect divisibility', async function() {
      var divisible = await render('{{ "6" is divisibleby(3) }}');
      var notDivisible = await render('{{ 3 is not divisibleby(2) }}');
      expect(divisible).toBe('true');
      expect(notDivisible).toBe('true');
    });

    it('escaped should test whether or not something is escaped', async function() {
      var escaped = await render('{{ (foo | safe) is escaped }}', {
        foo: 'foobarbaz'
      });
      var notEscaped = await render('{{ foo is escaped }}', {
        foo: 'foobarbaz'
      });
      expect(escaped).toBe('true');
      expect(notEscaped).toBe('false');
    });

    it('even should detect whether or not a number is even', async function() {
      var fiveEven = await render('{{ "5" is even }}');
      var fourNotEven = await render('{{ 4 is not even }}');
      expect(fiveEven).toBe('false');
      expect(fourNotEven).toBe('false');
    });

    it('odd should detect whether or not a number is odd', async function() {
      var fiveOdd = await render('{{ "5" is odd }}');
      var fourNotOdd = await render('{{ 4 is not odd }}');
      expect(fiveOdd).toBe('true');
      expect(fourNotOdd).toBe('true');
    });

    it('mapping should detect Maps or hashes', async function() {
      /* global Map */
      var map1, map2, mapOneIsMapping, mapTwoIsMapping;
      if (typeof Map === 'undefined') {
        this.skip();
      } else {
        map1 = new Map();
        map2 = {};
        mapOneIsMapping = await render('{{ map is mapping }}', {
          map: map1
        });
        mapTwoIsMapping = await render('{{ map is mapping }}', {
          map: map2
        });
        expect(mapOneIsMapping).toBe('true');
        expect(mapTwoIsMapping).toBe('true');
      }
    });

    it('falsy should detect whether or not a value is falsy', async function() {
      var zero = await render('{{ 0 is falsy }}');
      var pancakes = await render('{{ "pancakes" is not falsy }}');
      expect(zero).toBe('true');
      expect(pancakes).toBe('true');
    });

    it('truthy should detect whether or not a value is truthy', async function() {
      var nullTruthy = await render('{{ null is truthy }}');
      var pancakesNotTruthy = await render('{{ "pancakes" is not truthy }}');
      expect(nullTruthy).toBe('false');
      expect(pancakesNotTruthy).toBe('false');
    });

    it('greaterthan than should detect whether or not a value is less than another', async function() {
      var fiveGreaterThanFour = await render('{{ "5" is greaterthan(4) }}');
      var fourNotGreaterThanTwo = await render('{{ 4 is not greaterthan(2) }}');
      expect(fiveGreaterThanFour).toBe('true');
      expect(fourNotGreaterThanTwo).toBe('false');
    });

    it('ge should detect whether or not a value is greater than or equal to another', async function() {
      var fiveGreaterThanEqualToFive = await render('{{ "5" is ge(5) }}');
      var fourNotGreaterThanEqualToTwo = await render('{{ 4 is not ge(2) }}');
      expect(fiveGreaterThanEqualToFive).toBe('true');
      expect(fourNotGreaterThanEqualToTwo).toBe('false');
    });

    it('lessthan than should detect whether or not a value is less than another', async function() {
      var fiveLessThanFour = await render('{{ "5" is lessthan(4) }}');
      var fourNotLessThanTwo = await render('{{ 4 is not lessthan(2) }}');
      expect(fiveLessThanFour).toBe('false');
      expect(fourNotLessThanTwo).toBe('true');
    });

    it('le should detect whether or not a value is less than or equal to another', async function() {
      var fiveLessThanEqualToFive = await render('{{ "5" is le(5) }}');
      var fourNotLessThanEqualToTwo = await render('{{ 4 is not le(2) }}');
      expect(fiveLessThanEqualToFive).toBe('true');
      expect(fourNotLessThanEqualToTwo).toBe('true');
    });

    it('ne should detect whether or not a value is not equal to another', async function() {
      var five = await render('{{ 5 is ne(5) }}');
      var four = await render('{{ 4 is not ne(2) }}');
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

    it('iterable should detect that an Array is not non-iterable', async function() {
      equal('{{ arr is not iterable }}', { arr: [] }, 'false');
    });

    it('iterable should detect that a Map is iterable', async function() {
      if (typeof Map === 'undefined') {
        this.skip();
      } else {
        equal('{{ map is iterable }}', { map: new Map() }, 'true');
      }
    });

    it('iterable should detect that a Set is not non-iterable', async function() {
      /* global Set */
      if (typeof Set === 'undefined') {
        this.skip();
      } else {
        equal('{{ set is not iterable }}', { set: new Set() }, 'false');
      }
    });

    it('number should detect whether a value is numeric', async function() {
      var num = await render('{{ 5 is number }}');
      var str = await render('{{ "42" is number }}');
      expect(num).toBe('true');
      expect(str).toBe('false');
    });

    it('string should detect whether a value is a string', async function() {
      var num = await render('{{ 5 is string }}');
      var str = await render('{{ "42" is string }}');
      expect(num).toBe('false');
      expect(str).toBe('true');
    });

    it('equalto should detect value equality', async function() {
      var same = await render('{{ 1 is equalto(2) }}');
      var notSame = await render('{{ 2 is not equalto(2) }}');
      expect(same).toBe('false');
      expect(notSame).toBe('false');
    });

    it('sameas should alias to equalto', async function() {
      var obj = {};
      var same = await render('{{ obj1 is sameas(obj2) }}', {
        obj1: obj,
        obj2: obj
      });
      expect(same).toBe('true');
    });

    it('lower should detect whether or not a string is lowercased', async function() {
      equal('{{ "foobar" is lower }}', 'true');
      equal('{{ "Foobar" is lower }}', 'false');
    });

    it('upper should detect whether or not a string is uppercased', async function() {
      equal('{{ "FOOBAR" is upper }}', 'true');
      equal('{{ "Foobar" is upper }}', 'false');
    });

    it('should render async extensions inside macro', function(done) {
      function AsyncExtension() {
        this.tags = ['asyncextension'];

        this.parse = function(parser, nodes, lexer) {
          var tok, args, body;
          tok = parser.nextToken();
          args = parser.parseSignature(null, true);
          parser.advanceAfterBlockEnd(tok.value);
          body = parser.parseUntilBlocks('endasyncextension');
          parser.advanceAfterBlockEnd();

          return new nodes.CallExtensionAsync(this, 'run', args, [body,]);
        };

        this.run = function(context, url, body, callback) {
          body(function (e, bodyContent) {
            // TODO this does not yet work due to macro use
            // setTimeout(() => {
              callback(null, 'Foo async extension content');
            // });
          });
        };
      }

      let contents = '{% macro wrap() %}{{ caller() }}{% endmacro %}' +
        '{% call wrap() %}{% asyncextension "foobar" %}1{% endasyncextension %}{% endcall %}';

      equal(contents, null,
        { extensions: { AsyncExtension: new AsyncExtension() } },
        'Foo async extension content');

      finish(done);
    });

    // Test graciously provided by https://github.com/mozilla/nunjucks/issues/1363
    it('should allow async custom tag within sync custom tag compilation', function(done) {
      function TestSyncExtension() {
        this.tags = ['testsync'];

        this.parse = function(parser, nodes) {
          var content;
          var tag;
          parser.advanceAfterBlockEnd();

          content = parser.parseUntilBlocks('endtestsync');
          tag = new nodes.CallExtension(this, 'run', null, [content]);
          parser.advanceAfterBlockEnd();

          return tag;
        };

        this.run = function(context, content) {
          // Reverse the string
          return content().split('').reverse().join('');
        };
      }

      function TestAsyncExtension() {
        this.tags = ['testasync'];

        this.parse = function(parser, nodes) {
          var content;
          var tag;
          parser.advanceAfterBlockEnd();

          content = parser.parseUntilBlocks('endtestasync');
          tag = new nodes.CallExtensionAsync(this, 'run', null, [content]);
          parser.advanceAfterBlockEnd();

          return tag;
        };

        this.run = function(context, body, callback) {
          body(function (e, bodyContent) {
            setTimeout(() => {
              // Uppercase the string
              callback(null, bodyContent.toUpperCase());
            })
          });
        };
      }

      render('{% testasync %}abcdefghi{% endtestasync %}', null,
        {
          extensions: { TestAsyncExtension: new TestAsyncExtension() }
        },
        function(err, res) {
          expect(res).toBe('ABCDEFGHI');
        });

      render('{% testsync %}start{% testasync %}abcdefghi{% endtestasync %}{% endtestsync %}', null,
        {
          extensions: { TestExtension: new TestAsyncExtension(), TestSyncExtension: new TestSyncExtension()  },
        },
        function(err, res) {
          expect(res).toBe('IHGFEDCBAtrats');
        });

      finish(done);
    });
  });
}());
