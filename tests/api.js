(function() {
  'use strict';

  var expect;
  var util;
  var Environment;
  var Loader;
  var templatesPath;
  var path;

  if (typeof require !== 'undefined') {
    expect = globalThis.expect;
    util = require('./util');
    Environment = require('../nunjucks/src/environment').Environment;
    Loader = require('../nunjucks/src/node-loaders').FileSystemLoader;
    templatesPath = 'tests/templates';
    path = require('path');
  } else {
    expect = globalThis.expect;
    Environment = nunjucks.Environment;
    Loader = nunjucks.WebLoader;
    templatesPath = '/test-templates';
  }

  describe('api', function() {
    it('should always force compilation of parent template', async function() {
      var env = new Environment(new Loader(templatesPath));

      var child = env.getTemplate('base-inherit.njk');
      expect(await child.render()).toBe('Foo*Bar*BazFizzle');
    });

    it('should only call the callback once when conditional import fails', function(done) {
      var env = new Environment(new Loader(templatesPath));
      var called = 0;
      env.render('broken-conditional-include.njk',
        function() {
          expect(++called).toBe(1);
        }
      );
      setTimeout(done, 0);
    });


    it('should handle correctly relative paths', async function() {
      var env;
      var child1;
      var child2;
      if (typeof path === 'undefined') {
        this.skip();
        return;
      }
      env = new Environment(new Loader(templatesPath));
      child1 = env.getTemplate('relative/test1.njk');
      child2 = env.getTemplate('relative/test2.njk');

      expect(await child1.render()).toBe('FooTest1BazFizzle');
      expect(await child2.render()).toBe('FooTest2BazFizzle');
    });

    it('should handle correctly cache for relative paths', async function() {
      var env;
      var test;
      if (typeof path === 'undefined') {
        this.skip();
        return;
      }
      env = new Environment(new Loader(templatesPath));
      test = env.getTemplate('relative/test-cache.njk');

      expect(util.normEOL(await test.render())).toBe('Test1\nTest2');
    });

    it('should handle correctly relative paths in renderString', async function() {
      var env;
      if (typeof path === 'undefined') {
        this.skip();
        return;
      }
      env = new Environment(new Loader(templatesPath));
      expect(await env.renderString('{% extends "./relative/test1.njk" %}{% block block1 %}Test3{% endblock %}', {}, {
        path: path.resolve(templatesPath, 'string.njk')
      })).toBe('FooTest3BazFizzle');
    });

    describe('error cause', function() {
      class CustomError extends Error {
        constructor(message) {
          super(message);
          this.name = 'CustomError';
        }
      }

      function createEnv(dev) {
        var env = new Environment(new Loader(templatesPath), { dev: dev });
        env.addFilter('boom', function() {
          throw new CustomError('sync boom');
        });
        env.addFilter('asyncBoom', function(val, cb) {
          setTimeout(function() {
            cb(new CustomError('async boom'));
          }, 0);
        }, true);
        return env;
      }

      async function catchError(env, src) {
        try {
          await env.renderString(src, {});
        } catch (e) {
          return e;
        }
        throw new Error('Expected render to throw');
      }

      [['filter', '{{ "x" | boom }}', 'sync boom'], ['async filter', '{{ "x" | asyncBoom }}', 'async boom']].forEach(function([label, src, message]) {
        it(`should keep the cause of an error thrown by a ${label} when dev is false`, async function() {
          var err = await catchError(createEnv(false), src);
          var devErr = await catchError(createEnv(true), src);

          expect(err.cause).toBeInstanceOf(CustomError);
          expect(err.cause.message).toBe(message);
          expect(err.name).toBe('Template render error');
          expect(err.message).toBe(devErr.message);
          expect(err.message).toContain(`CustomError: ${message}`);
        });

        it(`should keep the cause of an error thrown by a ${label} when dev is true`, async function() {
          var err = await catchError(createEnv(true), src);

          expect(err.name).toBe('Template render error');
          expect(err.cause).toBeInstanceOf(CustomError);
          expect(err.cause.message).toBe(message);
        });
      });

      it('should not add a cause when there is none', async function() {
        var err = await catchError(createEnv(false), '{% if %}');

        expect(err.name).toBe('Template render error');
        expect('cause' in err).toBe(false);
      });
    });

    it('should emit "load" event on Environment instance', function(done) {
      var env = new Environment(new Loader(templatesPath));
      env.on('load', function(name, source) {
        expect(name).toBe('item.njk');
        done();
      });
      env.render('item.njk', {});
    });
  });
}());
