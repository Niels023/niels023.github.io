import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { startServer } from './server.js';

const root = path.join(import.meta.dirname, '..');
const distDir = path.join(root, 'dist');
const port = 3000;

// Normally only this computer can open the preview. With npm start -- --host
// other devices on the same network can open it too.
const onNetwork = process.argv.includes('--host');

let building = false;
let changedWhileBuilding = false;

// Every build runs as a new Node process, because Node reads a script only
// once per process. Calling the build from here would keep using the
// templates as they were when the preview started.
function runBuild() {
  return new Promise((resolve) => {
    const buildScript = path.join(root, 'scripts', 'build.js');
    spawn(process.execPath, [buildScript], { stdio: 'inherit' }).on('exit', resolve);
  });
}

async function rebuild() {
  if (building) {
    changedWhileBuilding = true;
    return;
  }

  // A build that fails prints its own message and the preview keeps running.
  building = true;
  await runBuild();
  building = false;

  if (changedWhileBuilding) {
    changedWhileBuilding = false;
    rebuild();
  }
}

// The addresses other devices reach this computer on, such as 192.168.2.123.
function networkAddresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((address) => address.family === 'IPv4' && !address.internal)
    .map((address) => address.address);
}

await rebuild();
const server = await startServer(distDir, port, onNetwork ? '0.0.0.0' : '127.0.0.1');
console.log(`\nPreview on ${server.url}`);
if (onNetwork) {
  for (const address of networkAddresses()) {
    console.log(`On your network: http://${address}:${port}`);
  }
}
console.log('Watching content/ and src/ for changes. Press Ctrl+C to stop.');

// Saving one file can fire several events, so wait a moment and build once.
let timer;
for (const folder of ['content', 'src']) {
  fs.watch(path.join(root, folder), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 300);
  });
}
