var connect = require('connect');
var serveStatic = require('serve-static');
var getPort = require('get-port');
var http = require('http');
var path = require('path');

function getStaticServer() {
  var staticRoot = path.join(__dirname, '../..');

  return getPort().then((port) => {
    return new Promise((resolve, reject) => {
      try {
        const app = connect().use(serveStatic(staticRoot));
        const server = http.createServer(app);
        server.listen(port, () => {
          console.log('Test server listening on port ' + port); // eslint-disable-line no-console
          resolve([server, port]);
        });
      } catch (e) {
        reject(e);
      }
    });
  });
}

module.exports = getStaticServer;
