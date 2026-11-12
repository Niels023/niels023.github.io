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
//
// host is the address to listen on. With 127.0.0.1 only this computer can
// open the site, with 0.0.0.0 other devices on the same network can too.
export function startServer(folder, port = 0, host = '127.0.0.1') {
  const server = http.createServer((request, response) => {
    let urlPath;
    try {
      urlPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    } catch {
      // An address with a broken % code. Without this the server would stop.
      response.writeHead(400).end('Bad request');
      return;
    }
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

    let status = 200;
    let content = readFile(filePath);
    if (content === undefined) {
      status = 404;
      filePath = path.join(folder, '404.html');
      content = readFile(filePath) ?? 'Not found';
    }

    const contentType = contentTypes[path.extname(filePath)] ?? 'application/octet-stream';
    response.writeHead(status, { 'Content-Type': contentType }).end(content);
  });

  return new Promise((resolve) => {
    server.listen(port, host, () => {
      resolve({ url: `http://localhost:${server.address().port}`, close: () => server.close() });
    });
  });
}

// A rebuild empties the folder while the preview keeps serving it, so a file
// can be gone the moment after it was found. Asking first whether it exists
// is no use then. The file is simply read, and a file that cannot be read
// counts as not there.
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath);
  } catch {
    return undefined;
  }
}

function isFolder(filePath) {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch {
    return false;
  }
}
