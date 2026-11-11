import fs from 'node:fs';
import path from 'node:path';
import { ContentError, loadContent } from './content.js';
import { makeBrowserFiles } from './render.js';
import { startServer } from './server.js';
import { renderCv } from '../src/templates/cv.js';
import { renderFavicon } from '../src/templates/favicon.js';
import { fonts } from '../src/templates/fonts.js';
import { renderHome } from '../src/templates/home.js';
import { renderPage } from '../src/templates/layout.js';
import { languages, pagePath } from '../src/templates/paths.js';
import { renderManifest, renderRobots, renderSitemap } from '../src/templates/seo-files.js';
import { renderLanguageChooser, renderNotFound } from '../src/templates/small-pages.js';

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
  'cv',
  'small-pages',
  'print',
];

// The server of GitHub Actions runs in UTC, so dates name their time zone.
const timeZone = 'Europe/Amsterdam';
const locales = { nl: 'nl-NL', en: 'en-GB' };

function yearOf(date) {
  return new Intl.DateTimeFormat('en-GB', { year: 'numeric', timeZone }).format(date);
}

// "november 2026" or "November 2026".
function monthAndYear(date, lang) {
  const format = new Intl.DateTimeFormat(locales[lang], {
    month: 'long',
    year: 'numeric',
    timeZone,
  });
  return format.format(date);
}

// Swedish writes dates as 2026-11-10, the form a sitemap asks for.
function dayOf(date) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone }).format(date);
}

export function writeFile(relativePath, content) {
  const filePath = path.join(distDir, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function copyFile(source, relativePath) {
  const target = path.join(distDir, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function copyAssets(projects) {
  for (const file of Object.values(fonts)) {
    copyFile(path.join(root, 'node_modules', file), `assets/fonts/${path.basename(file)}`);
  }

  fs.cpSync(path.join(srcDir, 'js'), path.join(distDir, 'assets', 'js'), { recursive: true });

  // Only the screenshots that a project names are copied. The portrait photo
  // is never copied as it is: render.js saves smaller copies of it.
  for (const project of projects) {
    if (project.image) {
      copyFile(path.join(srcDir, 'images', project.image), `assets/images/${project.image}`);
    }
  }
}

function writeStylesheet() {
  const css = cssFiles.map((name) =>
    fs.readFileSync(path.join(srcDir, 'css', `${name}.css`), 'utf8'),
  );
  writeFile('assets/site.css', css.join('\n'));
}

export function renderCvPage({ site, text, projects }, lang, now) {
  const t = text[lang];
  return renderPage({
    site,
    t,
    lang,
    year: yearOf(now),
    page: 'cv',
    title: t.meta.cvTitle,
    description: t.meta.cvDescription,
    main: renderCv({ site, t, lang, projects, updated: monthAndYear(now, lang) }),
    scripts: ['print'],
  });
}

function writePages(content, now) {
  const { site, text, projects } = content;

  for (const lang of languages) {
    const t = text[lang];
    writeFile(
      `${pagePath(lang, 'home')}index.html`,
      renderPage({
        site,
        t,
        lang,
        year: yearOf(now),
        page: 'home',
        title: t.meta.homeTitle,
        description: t.meta.homeDescription,
        main: renderHome({ site, t, lang, projects }),
        scripts: ['copy'],
      }),
    );
    writeFile(`${pagePath(lang, 'cv')}index.html`, renderCvPage(content, lang, now));
  }

  writeFile('index.html', renderLanguageChooser(content));
  writeFile('404.html', renderNotFound(content));
}

export async function build() {
  const now = new Date();
  const content = loadContent();
  for (const warning of content.warnings) {
    console.warn(`Warning: ${warning}`);
  }

  fs.rmSync(distDir, { recursive: true, force: true });
  copyAssets(content.projects);
  writeStylesheet();
  writeFile('favicon.svg', renderFavicon());
  writePages(content, now);
  writeFile('sitemap.xml', renderSitemap(content.site, dayOf(now)));
  writeFile('robots.txt', renderRobots(content.site));
  writeFile('site.webmanifest', renderManifest(content.site));

  // The PDFs and images are made from the pages above, so those are served first.
  const server = await startServer(distDir);
  try {
    await makeBrowserFiles({ distDir, serverUrl: server.url, content });
  } finally {
    server.close();
  }

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
