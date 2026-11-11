import fs from 'node:fs';
import path from 'node:path';
import { build, distDir } from './build.js';
import { ContentError } from './content.js';
import { startServer } from './server.js';

const root = path.join(import.meta.dirname, '..');
const port = 3000;

let building = false;
let changedWhileBuilding = false;

async function rebuild() {
  if (building) {
    changedWhileBuilding = true;
    return;
  }

  building = true;
  try {
    await build();
  } catch (error) {
    // A typing mistake in a content file should not stop the preview.
    console.error(error instanceof ContentError ? `\n${error.message}\n` : error);
  }
  building = false;

  if (changedWhileBuilding) {
    changedWhileBuilding = false;
    rebuild();
  }
}

await rebuild();
const server = await startServer(distDir, port);
console.log(`\nPreview on ${server.url}`);
console.log('Watching content/ and src/ for changes. Press Ctrl+C to stop.');

// Saving one file can fire several events, so wait a moment and build once.
let timer;
for (const folder of ['content', 'src']) {
  fs.watch(path.join(root, folder), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 300);
  });
}
