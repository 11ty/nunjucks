'use strict';

// These tests began life as Mocha specs and still use two Mocha idioms that
// Vitest does not support natively:
//
//   1. A `done` callback parameter for asynchronous tests.
//   2. `this.skip()` / `this.timeout()` via a runnable's `this` context.
//
// Rather than rewrite ~180 async tests, we bridge both idioms here so the
// original test bodies keep working under Vitest.

// Mocha's suite-level hooks map directly to Vitest's *All hooks.
globalThis.before = globalThis.beforeAll;
globalThis.after = globalThis.afterAll;

function bridge(orig) {
  function wrapped(name, fn, timeout) {
    if (typeof fn !== 'function') {
      return orig(name, fn, timeout);
    }

    // Vitest passes the TestContext as the first argument; Mocha exposed it as
    // `this` (with `.skip()`, `.timeout()`, ...). Bind it to `this` so existing
    // `this.skip()` calls resolve to the Vitest context.
    if (fn.length >= 1) {
      // `done`-style async test.
      return orig(name, function (ctx) {
        return new Promise(function (resolve, reject) {
          function done(err) {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          }
          const ret = fn.call(ctx, done);
          // Allow a test to both accept `done` and return a promise.
          if (ret && typeof ret.then === 'function') {
            ret.then(function () { resolve(); }, reject);
          }
        });
      }, timeout);
    }

    // Synchronous (or promise-returning) test with no `done`.
    return orig(name, function (ctx) {
      return fn.call(ctx);
    }, timeout);
  }

  // Preserve modifiers like .skip/.only/.each/.todo.
  return Object.assign(wrapped, orig);
}

globalThis.it = bridge(globalThis.it);
globalThis.test = bridge(globalThis.test);
