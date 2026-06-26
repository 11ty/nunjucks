// Browser project setup (slim build). Mirrors tests/browser/slim.html:
//  - load the full bundle and stash it as window.nunjucksFull
//  - load the slim bundle as window.nunjucks (no compiler/parser/lexer)
//  - load precompiled templates into window.nunjucksPrecompiled
// util.js detects window.nunjucksFull and switches into its `isSlim` path,
// precompiling template strings at runtime via the full build.
import fullUrl from './browser/nunjucks.js?url';
import slimUrl from './browser/nunjucks-slim.js?url';
import precompiledUrl from './browser/precompiled-templates.js?url';

function loadScript(src) {
  return new Promise(function (resolve, reject) {
    const s = document.createElement('script');
    s.src = src;
    s.onload = function () { resolve(); };
    s.onerror = function () { reject(new Error('Failed to load ' + src)); };
    document.head.appendChild(s);
  });
}

await loadScript(fullUrl);
window.nunjucksFull = window.nunjucks;
window.nunjucks = undefined;

await loadScript(slimUrl);
await loadScript(precompiledUrl);

window.nunjucks.testing = true;

// Reset window.nunjucksPrecompiled so runtime-precompiled templates don't leak
// between tests.
const precompiled = window.nunjucksPrecompiled;
beforeEach(function () { window.nunjucksPrecompiled = precompiled; });
afterEach(function () { window.nunjucksPrecompiled = precompiled; });
