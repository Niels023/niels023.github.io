import fs from 'node:fs';
import path from 'node:path';
import { ContentError, loadContent } from './content.js';
import { faviconFrames, renderFavicon } from '../src/templates/favicon.js';
import { fonts } from '../src/templates/fonts.js';
import { renderHome } from '../src/templates/home.js';
import { renderPage } from '../src/templates/layout.js';
import { languages, pagePath } from '../src/templates/paths.js';

const root = path.join(import.meta.dirname, '..');
const srcDir = path.join(root, 'src');
export const distDir = path.join(root, 'dist');

// Joined into one stylesheet in this order.
const cssFiles = [
  'fonts',
  'tokens',
  'base',
  'header',
  'hero',
  'projects',
  'skills',
  'about',
  'contact',
];

// The server of GitHub Actions runs in UTC, so dates name their time zone.
const timeZone = 'Europe/Amsterdam';

function yearOf(date) {
  return new Intl.DateTimeFormat('en-GB', { year: 'numeric', timeZone }).format(date);
}

function writeFile(relativePath, content) {
  const filePath = path.join(distDir, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function copyAssets() {
  for (const file of Object.values(fonts)) {
    const target = path.join(distDir, 'assets', 'fonts', path.basename(file));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(root, 'node_modules', file), target);
  }

  fs.cpSync(path.join(srcDir, 'js'), path.join(distDir, 'assets', 'js'), { recursive: true });

  const imagesDir = path.join(srcDir, 'images');
  if (fs.existsSync(imagesDir)) {
    fs.cpSync(imagesDir, path.join(distDir, 'assets', 'images'), { recursive: true });
  }
}

// The finished icon plus the frames that show the N being written.
function writeFavicons() {
  writeFile('favicon.svg', renderFavicon());
  for (let frame = 0; frame < faviconFrames; frame++) {
    writeFile(`assets/favicon/frame-${frame + 1}.svg`, renderFavicon(frame / faviconFrames));
  }
}

function writeStylesheet() {
  const css = cssFiles.map((name) =>
    fs.readFileSync(path.join(srcDir, 'css', `${name}.css`), 'utf8'),
  );
  writeFile('assets/site.css', css.join('\n'));
}

function writePages({ site, text, projects }, now) {
  for (const lang of languages) {
    const t = text[lang];
    const shared = { site, t, lang, year: yearOf(now) };

    writeFile(
      `${pagePath(lang, 'home')}index.html`,
      renderPage({
        ...shared,
        page: 'home',
        title: t.meta.homeTitle,
        description: t.meta.homeDescription,
        main: renderHome({ site, t, lang, projects }),
        scripts: ['board', 'sketches', 'copy'],
      }),
    );
  }
}

export async function build() {
  const now = new Date();
  const content = loadContent();
  for (const warning of content.warnings) {
    console.warn(`Warning: ${warning}`);
  }

  fs.rmSync(distDir, { recursive: true, force: true });
  copyAssets();
  writeStylesheet();
  writeFavicons();
  writePages(content, now);

  console.log(`Built the site in ${path.relative(root, distDir)}/`);
}

if (import.meta.main) {
  try {
    await build();
  } catch (error) {
    if (!(error instanceof ContentError)) throw error;
    console.error(`\n${error.message}\n`);
    process.exitCode = 1;
  }
}
