import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

const contentDir = path.join(import.meta.dirname, '..', 'content');
const imagesDir = path.join(import.meta.dirname, '..', 'src', 'images');
const sketchesDir = path.join(import.meta.dirname, '..', 'src', 'sketches');

// The kinds of photo a browser can open. The HEIC of an iPhone is not one.
const photoTypes = ['.jpg', '.jpeg', '.png', '.webp'];

// Thrown for mistakes in the content files, so the build can show the
// message without a stack trace.
export class ContentError extends Error {}

export function loadContent() {
  const warnings = [];
  const raw = {
    site: readYaml('site.yaml'),
    projects: readYaml('projects.yaml'),
    nl: readYaml('nl.yaml'),
    en: readYaml('en.yaml'),
  };

  for (const difference of findDifferences(raw.nl, raw.en)) {
    warnings.push(`nl.yaml and en.yaml differ at ${difference}`);
  }
  checkProjects(raw.projects, warnings);

  const placeholders = [];
  const site = withoutPlaceholders(raw.site, 'site.yaml: ', placeholders);
  const projects = raw.projects.map((project) =>
    withoutPlaceholders(withDefaults(project), `projects.yaml: ${project.id}.`, placeholders),
  );
  const nl = withoutPlaceholders(raw.nl, 'nl.yaml: ', placeholders);
  const en = withoutPlaceholders(raw.en, 'en.yaml: ', placeholders);
  for (const place of placeholders) {
    warnings.push(`placeholder left at ${place}`);
  }
  checkImages(site, projects);

  return {
    warnings,
    site: strict(site, 'site.yaml: '),
    projects: projects.map((project) => strict(project, `projects.yaml: ${project.id}.`)),
    text: {
      nl: strict(nl, 'nl.yaml: '),
      en: strict(en, 'en.yaml: '),
    },
  };
}

export function readYamlFile(filePath) {
  const name = path.relative(path.join(contentDir, '..'), filePath).replaceAll('\\', '/');
  let source;
  try {
    source = fs.readFileSync(filePath, 'utf8');
  } catch {
    throw new ContentError(`${name} does not exist.`);
  }
  try {
    return parse(source);
  } catch (error) {
    throw new ContentError(
      `${name} has a typing mistake.\n${error.message}\n` +
        'Tip: check the indentation, and put text that contains a colon between "quotes".',
    );
  }
}

function readYaml(fileName) {
  return readYamlFile(path.join(contentDir, fileName));
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// Lists every place where the Dutch and the English content do not have the
// same parts: a missing key or a list with a different number of items.
export function findDifferences(nl, en, where = '') {
  if (Array.isArray(nl) && Array.isArray(en)) {
    const differences = [];
    if (nl.length !== en.length) {
      differences.push(`${where}: ${nl.length} items in Dutch, ${en.length} in English`);
    }
    for (let i = 0; i < Math.min(nl.length, en.length); i++) {
      differences.push(...findDifferences(nl[i], en[i], `${where}[${i + 1}]`));
    }
    return differences;
  }

  if (isObject(nl) && isObject(en)) {
    const differences = [];
    for (const key of new Set([...Object.keys(nl), ...Object.keys(en)])) {
      const place = where ? `${where}.${key}` : key;
      if (!(key in nl)) differences.push(`${place}: missing in Dutch`);
      else if (!(key in en)) differences.push(`${place}: missing in English`);
      else differences.push(...findDifferences(nl[key], en[key], place));
    }
    return differences;
  }

  if (Array.isArray(nl) !== Array.isArray(en) || isObject(nl) !== isObject(en)) {
    return [`${where}: not the same kind of value in Dutch and English`];
  }
  return [];
}

function checkProjects(projects, warnings) {
  if (!Array.isArray(projects)) {
    throw new ContentError('projects.yaml has to be a list of projects.');
  }

  const problems = [];
  const seen = new Set();
  projects.forEach((project, index) => {
    const name = project?.id ?? `project ${index + 1}`;
    if (seen.has(project?.id)) problems.push(`${name}: this id is used twice`);
    seen.add(project?.id);

    for (const key of ['id', 'sketch', 'tech', 'nl', 'en']) {
      if (project?.[key] === undefined) problems.push(`${name}: ${key} is missing`);
    }
    if (project?.tech !== undefined && !Array.isArray(project.tech)) {
      problems.push(`${name}: tech has to be a list, also when it has one item`);
    }
    for (const lang of ['nl', 'en']) {
      for (const key of ['title', 'summary']) {
        if (isObject(project?.[lang]) && !project[lang][key]) {
          problems.push(`${name}: ${lang}.${key} is missing`);
        }
      }
    }
    for (const difference of findDifferences(project?.nl, project?.en)) {
      warnings.push(`projects.yaml: ${name} differs at ${difference}`);
    }
  });

  if (problems.length > 0) {
    throw new ContentError(`projects.yaml is not complete.\n- ${problems.join('\n- ')}`);
  }
}

// The photo and the screenshots that the content names have to be in
// src/images, the drawings in src/sketches.
function checkImages(site, projects) {
  const named = [
    ['site.yaml: photo', site.photo],
    ...projects.map((project) => [`projects.yaml: ${project.id}.image`, project.image]),
  ];

  const problems = [];
  for (const [where, file] of named) {
    if (file && !fs.existsSync(path.join(imagesDir, file))) {
      problems.push(`${where}: there is no file src/images/${file}`);
    }
  }
  for (const project of projects) {
    if (!fs.existsSync(path.join(sketchesDir, `${project.sketch}.svg`))) {
      problems.push(
        `projects.yaml: ${project.id}.sketch: there is no drawing src/sketches/${project.sketch}.svg`,
      );
    }
  }
  if (site.photo && !photoTypes.includes(path.extname(site.photo).toLowerCase())) {
    problems.push('site.yaml: photo has to be a JPG, PNG or WebP file');
  }

  if (problems.length > 0) {
    throw new ContentError(`An image is not right.\n- ${problems.join('\n- ')}`);
  }
}

// Optional fields get an empty value, so templates can simply test them.
function withDefaults(project) {
  const optionalTexts = { status: '', learned: '', note: '' };
  return {
    featured: false,
    onCv: false,
    image: '',
    links: [],
    ...project,
    nl: { ...optionalTexts, ...project.nl },
    en: { ...optionalTexts, ...project.en },
  };
}

// A value that starts with TODO is something that still has to be filled in.
// It is reported and left out of the site.
function withoutPlaceholders(value, where, found) {
  if (typeof value === 'string') {
    if (!value.startsWith('TODO')) return value;
    found.push(where.replace(/\.$/, ''));
    return '';
  }
  if (Array.isArray(value)) {
    return value.map((item, i) => withoutPlaceholders(item, `${where}${i + 1}.`, found));
  }
  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        withoutPlaceholders(child, `${where}${key}.`, found),
      ]),
    );
  }
  return value;
}

// Wraps the content so that asking for a text that is not in the files stops
// the build with a clear message, instead of printing "undefined" on a page.
function strict(value, where) {
  if (Array.isArray(value)) {
    return value.map((item, i) => strict(item, `${where}${i + 1}.`));
  }
  if (!isObject(value)) return value;

  const copy = {};
  for (const [key, child] of Object.entries(value)) {
    copy[key] = strict(child, `${where}${key}.`);
  }
  return new Proxy(copy, {
    get(target, key) {
      if (typeof key === 'string' && !(key in target)) {
        throw new ContentError(`${where}${key} is missing.`);
      }
      return target[key];
    },
  });
}
