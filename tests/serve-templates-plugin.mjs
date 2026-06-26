import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const templatesDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'templates'
);

// The browser WebLoader tests fetch templates over HTTP (sync XHR with a
// `?s=<timestamp>` cache-buster). Serve tests/templates as raw text at
// /test-templates so the bundled WebLoader can resolve them, mirroring the old
// static-server harness.
export function serveTestTemplates() {
  return {
    name: 'serve-test-templates',
    configureServer(server) {
      server.middlewares.use('/test-templates', (req, res, next) => {
        const rel = decodeURIComponent((req.url || '').split('?')[0]);
        const filePath = path.join(templatesDir, rel);
        if (!filePath.startsWith(templatesDir)) {
          res.statusCode = 403;
          res.end('forbidden');
          return;
        }
        fs.readFile(filePath, 'utf-8', (err, data) => {
          if (err) {
            res.statusCode = 404;
            res.end('not found');
            return;
          }
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(data);
        });
      });
    },
  };
}
