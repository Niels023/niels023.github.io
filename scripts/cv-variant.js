// Makes a cv PDF for one job application: npm run cv -- name
//
// It reads cv-variants/name.yaml, lays those texts over the normal content
// and saves cv-variants/name.pdf. That folder is not in git, so a tailored
// cv never ends up on the site.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { build, distDir, renderCvPage, writeFile } from './build.js';
import { ContentError, loadContent, readYamlFile } from './content.js';
import { savePdf } from './render.js';
import { startServer } from './server.js';

const variantsDir = path.join(import.meta.dirname, '..', 'cv-variants');
const temporaryFolder = 'cv-variant';

// Lays the changes over the normal texts. A text or a list replaces the
// normal one as a whole. A name that the normal content does not have is a
// typing mistake, so that stops with a message.
function overlay(normal, changes, where) {
  const isGroup = changes !== null && typeof changes === 'object' && !Array.isArray(changes);
  if (!isGroup) return changes;

  const result = { ...normal };
  for (const [key, value] of Object.entries(changes)) {
    if (!(key in normal)) {
      throw new ContentError(`${where}${key} does not exist in the normal content.`);
    }
    result[key] = overlay(normal[key], value, `${where}${key}.`);
  }
  return result;
}

// Shows the listed projects on the cv, in the listed order.
function pickProjects(projects, ids) {
  return ids.map((id) => {
    const project = projects.find((candidate) => candidate.id === id);
    if (!project) throw new ContentError(`projects: there is no project with the id ${id}.`);
    return { ...project, onCv: true };
  });
}

async function makeVariant(name) {
  const variant = readYamlFile(path.join(variantsDir, `${name}.yaml`));
  const lang = variant.language ?? 'nl';
  if (lang !== 'nl' && lang !== 'en') {
    throw new ContentError('language has to be nl or en.');
  }

  await build();
  const content = loadContent();
  const text = {
    ...content.text,
    [lang]: overlay(content.text[lang], variant.text ?? {}, 'text.'),
  };
  const projects = variant.projects
    ? pickProjects(content.projects, variant.projects)
    : content.projects;

  writeFile(
    `${temporaryFolder}/index.html`,
    renderCvPage({ ...content, text, projects }, lang, new Date()),
  );

  const pdfFile = path.join(variantsDir, `${name}.pdf`);
  const server = await startServer(distDir);
  const browser = await chromium.launch();
  try {
    const pages = await savePdf(browser, {
      url: `${server.url}/${temporaryFolder}/`,
      filePath: pdfFile,
      title: text[lang].meta.cvTitle,
      site: content.site,
      lang,
    });
    console.log(
      `\nSaved ${path.relative(process.cwd(), pdfFile)} (${pages} ${pages === 1 ? 'page' : 'pages'})`,
    );
  } finally {
    await browser.close();
    server.close();
    fs.rmSync(path.join(distDir, temporaryFolder), { recursive: true });
  }
}

const name = process.argv[2];
if (!name) {
  console.error('Give the name of a file in cv-variants, for example: npm run cv -- example');
  process.exitCode = 1;
} else {
  try {
    await makeVariant(name);
  } catch (error) {
    if (!(error instanceof ContentError)) throw error;
    console.error(`\n${error.message}\n`);
    process.exitCode = 1;
  }
}
