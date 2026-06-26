// Browser project setup (full build). Mirrors tests/browser/index.html: load
// the UMD browser bundle as a classic script so it attaches to `window.nunjucks`,
// which the test files (and util.js) read in their browser branch.
import nunjucksUrl from './browser/nunjucks.js?url';

function loadScript(src) {
  return new Promise(function (resolve, reject) {
    const s = document.createElement('script');
    s.src = src;
    s.onload = function () { resolve(); };
    s.onerror = function () { reject(new Error('Failed to load ' + src)); };
    document.head.appendChild(s);
  });
}

await loadScript(nunjucksUrl);

window.nunjucks.testing = true;
