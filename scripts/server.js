import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

// Serves a folder the way GitHub Pages does: /nl/ gives nl/index.html, /nl
// redirects to /nl/ and an unknown address gives 404.html.
export function startServer(folder, port = 0) {
  const server = http.createServer((request, response) => {
    const urlPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let filePath = path.join(folder, urlPath);

    if (!filePath.startsWith(folder)) {
      response.writeHead(403).end();
      return;
    }
    if (isFolder(filePath) && !urlPath.endsWith('/')) {
      response.writeHead(301, { Location: `${urlPath}/` }).end();
      return;
    }
    if (urlPath.endsWith('/')) filePath = path.join(filePath, 'index.html');

    const found = fs.existsSync(filePath) && !isFolder(filePath);
    if (!found) filePath = path.join(folder, '404.html');
    if (!fs.existsSync(filePath)) {
      response.writeHead(404).end('Not found');
      return;
    }

    const contentType = contentTypes[path.extname(filePath)] ?? 'application/octet-stream';
    response.writeHead(found ? 200 : 404, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(response);
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      resolve({ url: `http://localhost:${server.address().port}`, close: () => server.close() });
    });
  });
}

function isFolder(filePath) {
  return fs.existsSync(filePath) && fs.statSync(filePath).isDirectory();
}
