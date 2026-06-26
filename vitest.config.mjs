import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { serveTestTemplates } from './tests/serve-templates-plugin.mjs';

// These tests carry a Mocha-era structure (UMD/IIFE bodies, `done` callbacks,
// `this.skip()`), bridged to Vitest by tests/vitest.setup.js. The same files run
// in two projects: against the source under Node, and against the prebuilt
// browser bundle under a real browser via Playwright.

// Node runs every spec. core/express/precompile are Node-only.
const NODE_FILES = [
  'tests/api.js',
  'tests/compiler.js',
  'tests/core.js',
  'tests/express.js',
  'tests/filters.js',
  'tests/globals.js',
  'tests/jinja-compat.js',
  'tests/lexer.js',
  'tests/loader.js',
  'tests/parser.js',
  'tests/precompile.js',
  'tests/runtime.js',
  'tests/tests.js',
];

// Mirrors tests/browser/index.html.
const BROWSER_FULL_FILES = [
  'tests/api.js',
  'tests/lexer.js',
  'tests/loader.js',
  'tests/parser.js',
  'tests/compiler.js',
  'tests/runtime.js',
  'tests/filters.js',
  'tests/globals.js',
  'tests/jinja-compat.js',
  'tests/tests.js',
];

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'node',
          globals: true,
          environment: 'node',
          include: NODE_FILES,
          setupFiles: ['./tests/vitest.setup.js', './tests/vitest.setup.node.js'],
        },
      },
      {
        plugins: [serveTestTemplates()],
        test: {
          name: 'browser',
          globals: true,
          include: BROWSER_FULL_FILES,
          setupFiles: [
            './tests/vitest.setup.js',
            './tests/vitest.setup.browser-full.js',
            './tests/util.js',
          ],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            screenshotFailures: false,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['nunjucks/src/**'],
      reporter: ['text', 'html', 'lcovonly'],
    },
  },
});
