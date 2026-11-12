import fs from 'node:fs';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { chromium } from 'playwright';
import { ContentError } from './content.js';
import { renderAppIcon, renderFavicon } from '../src/templates/favicon.js';
import {
  languages,
  pagePath,
  pdfPath,
  portraitPath,
  portraitWidths,
  screenshotPath,
  shareImagePath,
} from '../src/templates/paths.js';
import { renderShareImage } from '../src/templates/share-image.js';

const imagesDir = path.join(import.meta.dirname, '..', 'src', 'images');

// A screenshot is never shown bigger than half of this. The double size keeps
// it sharp on a phone and on a 4K screen.
const screenshotFit = { width: 960, height: 540 };

// Makes the files that need a real browser: the portrait, the screenshots,
// the cv PDFs, the share images and the icons. serverUrl is where the freshly
// built site is being served.
export async function makeBrowserFiles({ distDir, serverUrl, content }) {
  const { site, text, projects } = content;
  const browser = await chromium.launch();

  try {
    // The cv and the share image show the portrait, so it is made first.
    if (site.photo) await savePortraits(browser, distDir, site.photo);
    for (const project of projects) {
      if (project.image) await saveScreenshot(browser, distDir, project);
    }

    for (const lang of languages) {
      const pages = await savePdf(browser, {
        url: serverUrl + pagePath(lang, 'cv'),
        filePath: path.join(distDir, pdfPath(site, lang)),
        title: text[lang].meta.cvTitle,
        site,
        lang,
      });
      console.log(`cv ${lang}: ${pages} ${pages === 1 ? 'page' : 'pages'}`);
      if (pages > 1) {
        console.warn(`Warning: the ${lang} cv no longer fits on one page. Shorten its texts.`);
      }

      await saveShareImage(browser, { distDir, serverUrl, site, t: text[lang], lang });
    }
    await saveIcons(browser, distDir);
  } finally {
    await browser.close();
  }
}

// Opens a file from src/images in a new page, where it fills the whole
// window. Returns the page and the real size of the picture.
async function openImage(browser, file) {
  const page = await browser.newPage();
  // This address does not exist. The browser asks for it and gets the file.
  const address = 'http://image.test/file';
  await page.route(address, (route) => route.fulfill({ path: path.join(imagesDir, file) }));
  // When the picture is higher than the window, the cut keeps the part above
  // the middle, which is where a face usually is.
  await page.setContent(
    `<style>body { margin: 0 } img { display: block; width: 100vw; height: 100vh; object-fit: cover; object-position: 50% 25% }</style><img src="${address}">`,
  );

  const size = await page.evaluate(() => {
    const image = document.querySelector('img');
    return { width: image.naturalWidth, height: image.naturalHeight };
  });
  // A file that only has the name of a picture, such as a HEIC that was
  // renamed to .jpg, would end up on the site as a broken picture.
  if (size.width === 0) {
    throw new ContentError(
      `The browser cannot open src/images/${file}. Save it again as a JPG or PNG.`,
    );
  }
  return { page, ...size };
}

// Saves the portrait in the sizes the pages use, cut to 4 by 5. What is saved
// is a screenshot of the photo. A screenshot holds nothing but the picture, so
// what a phone stores inside a photo, like the place where it was taken, never
// reaches the site.
async function savePortraits(browser, distDir, photo) {
  const { page } = await openImage(browser, photo);
  for (const width of portraitWidths) {
    await page.setViewportSize({ width, height: width * 1.25 });
    await takeScreenshot(page, {
      path: path.join(distDir, portraitPath(width)),
      type: 'jpeg',
      quality: 85,
    });
  }
  await page.close();
}

// Saves a smaller copy of the screenshot of a project, in its own shape. It
// is made the same way as the portrait, so the file itself stays off the site.
async function saveScreenshot(browser, distDir, project) {
  const { page, width, height } = await openImage(browser, project.image);
  const scale = Math.min(1, screenshotFit.width / width, screenshotFit.height / height);
  await page.setViewportSize({
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  });
  await takeScreenshot(page, {
    path: path.join(distDir, screenshotPath(project)),
    type: 'jpeg',
    quality: 90,
  });
  await page.close();
}

// Prints a page to PDF the way the browser's own print dialog would: real
// text, with the fonts of the page embedded. Returns the number of pages.
export async function savePdf(browser, { url, filePath, title, site, lang }) {
  const page = await browser.newPage();
  await page.goto(url);
  await page.emulateMedia({ media: 'print' });
  await page.evaluate(() => document.fonts.ready);
  const printed = await page.pdf({ preferCSSPageSize: true, printBackground: true, tagged: true });
  await page.close();

  // The browser does not fill in who wrote the document, so that is added here.
  const pdf = await PDFDocument.load(printed, { updateMetadata: false });
  pdf.setTitle(title, { showInWindowTitleBar: true });
  pdf.setAuthor(site.name);
  pdf.setCreator(site.url);
  pdf.setLanguage(lang);
  fs.writeFileSync(filePath, await pdf.save());

  return pdf.getPageCount();
}

async function saveShareImage(browser, { distDir, serverUrl, site, t, lang }) {
  // The page has to be on the server for its stylesheet and fonts to load,
  // so it is written to dist for a moment and removed again.
  const temporaryPage = path.join(distDir, 'share-image.html');
  fs.writeFileSync(temporaryPage, renderShareImage({ site, t, lang }));

  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto(`${serverUrl}/share-image.html`);
  await page.evaluate(() => document.fonts.ready);
  await takeScreenshot(page, { path: path.join(distDir, shareImagePath(lang)) });
  await page.close();

  fs.rmSync(temporaryPage);
}

// Now and then the first screenshot after the browser starts fails with
// "Unable to capture screenshot", so a screenshot that fails is tried once more.
async function takeScreenshot(page, options) {
  try {
    return await page.screenshot(options);
  } catch {
    return page.screenshot(options);
  }
}

async function saveIcons(browser, distDir) {
  const page = await browser.newPage();

  async function drawPng(svg, size) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(
      `<style>body { margin: 0 } svg { display: block; width: 100vw; height: 100vh }</style>${svg}`,
    );
    return takeScreenshot(page, { omitBackground: true });
  }

  const sizes = [16, 32, 48];
  const pngs = [];
  for (const size of sizes) pngs.push(await drawPng(renderFavicon(), size));
  fs.writeFileSync(path.join(distDir, 'favicon.ico'), toIco(sizes, pngs));

  const iconsDir = path.join(distDir, 'assets', 'icons');
  fs.mkdirSync(iconsDir, { recursive: true });
  fs.writeFileSync(path.join(distDir, 'apple-touch-icon.png'), await drawPng(renderAppIcon(), 180));
  fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), await drawPng(renderAppIcon(), 192));
  fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), await drawPng(renderAppIcon(), 512));

  await page.close();
}

// An .ico file is a small table of contents followed by the PNG images.
// Each row of the table says how big an image is and where it starts.
function toIco(sizes, pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); // 1 means icon
  header.writeUInt16LE(pngs.length, 4);

  let start = header.length + 16 * pngs.length;
  const rows = pngs.map((png, i) => {
    const row = Buffer.alloc(16);
    row.writeUInt8(sizes[i], 0); // width
    row.writeUInt8(sizes[i], 1); // height
    row.writeUInt16LE(1, 4); // colour planes
    row.writeUInt16LE(32, 6); // bits per pixel
    row.writeUInt32LE(png.length, 8);
    row.writeUInt32LE(start, 12);
    start += png.length;
    return row;
  });

  return Buffer.concat([header, ...rows, ...pngs]);
}
