(function() {
  /* eslint-disable vars-on-top */

  'use strict';

  var nunjucks,
    Environment,
    Template,
    Loader,
    templatesPath;

  // `expect` is provided globally by Vitest (config has `globals: true`).

  if (typeof window === 'undefined') {
    nunjucks = require('../nunjucks/index.js');
    Loader = nunjucks.FileSystemLoader;
    templatesPath = 'tests/templates';
  } else {
    nunjucks = window.nunjucks;
    Loader = nunjucks.WebLoader;
    templatesPath = '/test-templates';
  }
  Environment = nunjucks.Environment;
  Template = nunjucks.Template;

  var numAsyncs;
  var doneHandler;
  // Rendering is now Promise-based. equal() kicks off a render and records the
  // assertion promise here; afterEach awaits them all so the many synchronous
  // `equal(...)` call sites keep working without per-test changes.
  var pending;

  beforeEach(function() {
    numAsyncs = 0;
    doneHandler = null;
    pending = [];
  });

  afterEach(async function() {
    const ps = pending;
    pending = [];
    await Promise.all(ps);
  });

  function equal(str, ctx, opts, str2, env) {
    if (typeof ctx === 'string') {
      env = opts;
      str2 = ctx;
      ctx = null;
      opts = {};
    }
    if (typeof opts === 'string') {
      env = str2;
      str2 = opts;
      opts = {};
    }
    opts = opts || {};
    const p = Promise.resolve(render(str, ctx, opts, env)).then((res) => {
      expect(res).toBe(str2);
    });
    pending.push(p);
    return p;
  }

  function jinjaEqual(str, ctx, str2, env) {
    var jinjaUninstall = nunjucks.installJinjaCompat();
    // Delegate to equal (which pushes the assertion promise to pending), then
    // swap that entry for one that uninstalls jinja compat after it settles —
    // so cleanup is awaited and doesn't leak into the next test.
    const inner = equal(str, ctx, str2, env);
    pending.pop();
    const p = inner.finally(() => jinjaUninstall());
    pending.push(p);
    return p;
  }

  function finish(done) {
    if (numAsyncs > 0) {
      doneHandler = done;
    } else {
      done();
    }
  }

  function normEOL(str) {
    if (!str) {
      return str;
    }
    return str.replace(/\r\n|\r/g, '\n');
  }

  // eslint-disable-next-line consistent-return
  function render(str, ctx, opts, env, cb) {
    if (typeof ctx === 'function') {
      cb = ctx;
      ctx = null;
      opts = null;
      env = null;
    } else if (typeof opts === 'function') {
      cb = opts;
      opts = null;
      env = null;
    } else if (typeof env === 'function') {
      cb = env;
      env = null;
    }

    opts = opts || {};
    opts.dev = true;

    var loader = new Loader(templatesPath);
    var e = env || new Environment(loader, opts);

    var name;
    if (opts.filters) {
      for (name in opts.filters) {
        if (Object.prototype.hasOwnProperty.call(opts.filters, name)) {
          e.addFilter(name, opts.filters[name]);
        }
      }
    }

    if (opts.asyncFilters) {
      for (name in opts.asyncFilters) {
        if (Object.prototype.hasOwnProperty.call(opts.asyncFilters, name)) {
          e.addFilter(name, opts.asyncFilters[name], true);
        }
      }
    }

    if (opts.extensions) {
      for (name in opts.extensions) {
        if (Object.prototype.hasOwnProperty.call(opts.extensions, name)) {
          e.addExtension(name, opts.extensions[name]);
        }
      }
    }

    ctx = ctx || {};

    var t = new Template(str, e);

    if (!cb) {
      return t.render(ctx);
    } else {
      numAsyncs++;
      t.render(ctx, function(err, res) {
        if (err && !opts.noThrow) {
          throw err;
        }

        try {
          cb(err, normEOL(res));
        } catch (exc) {
          if (doneHandler) {
            doneHandler(exc);
            numAsyncs = 0;
            doneHandler = null;
          } else {
            throw exc;
          }
        }

        numAsyncs--;

        if (numAsyncs === 0 && doneHandler) {
          doneHandler();
        }
      });
    }
  }

  if (typeof window === 'undefined') {
    module.exports.render = render;
    module.exports.equal = equal;
    module.exports.jinjaEqual = jinjaEqual;
    module.exports.finish = finish;
    module.exports.normEOL = normEOL;
    module.exports.Loader = Loader;
  } else {
    window.util = {
      render: render,
      equal: equal,
      jinjaEqual: jinjaEqual,
      finish: finish,
      normEOL: normEOL,
      Loader: Loader,
    };
  }
}());
