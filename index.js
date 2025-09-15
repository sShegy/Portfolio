// Simple static file server for the portfolio site
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');

const contentTypes = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function safeJoin(base, target) {
  const targetPath = path.posix.normalize(target.replace(/\\/g, '/'));
  // Prevent path traversal
  if (targetPath.includes('..')) return null;
  return path.join(base, targetPath);
}

const server = http.createServer((req, res) => {
  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = safeJoin(publicDir, urlPath);

  if (!filePath) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=UTF-8' });
    return res.end('Bad Request');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Try adding .html for clean URLs like /about
      const htmlPath = safeJoin(publicDir, urlPath + '.html');
      if (htmlPath) {
        fs.stat(htmlPath, (err2, stats2) => {
          if (!err2 && stats2.isFile()) return streamFile(htmlPath, res);
          // Fallback to 404 page if exists
          const notFound = path.join(publicDir, '404.html');
          return fs.stat(notFound, (e3, s3) => {
            if (!e3 && s3.isFile()) return streamFile(notFound, res, 404);
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
            res.end('404 Not Found');
          });
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('404 Not Found');
      }
      return;
    }

    streamFile(filePath, res);
  });
});

function streamFile(filePath, res, code = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const type = contentTypes[ext] || 'application/octet-stream';
  res.writeHead(code, { 'Content-Type': type });
  fs.createReadStream(filePath).pipe(res);
}

server.listen(port, () => {
  console.log(`Portfolio server running at http://localhost:${port}`);
});
