import fs from 'node:fs';
import path from 'node:path';
import { escapeHtml, plain, sentenceList, shortUrl, text } from './html.js';
import { renderMonogram } from './monogram.js';
import { pagePath, pdfDownloadName, pdfPath } from './paths.js';

const sketchDir = path.join(import.meta.dirname, '..', 'sketches');

export function renderHome(page) {
  return [
    renderHero(page),
    renderProjects(page),
    renderSkills(page),
    renderAbout(page),
    renderContact(page),
  ].join('\n');
}

function renderHero({ site, t, lang }) {
  const board = t.hero.board;
  const colors = [1, 2, 3, 4].map(
    (number) =>
      `<button class="tray__color tray__color--${number}" type="button" aria-pressed="${number === 1}" data-board-color="${number}"><span class="visually-hidden">${text(board.color)} ${number}</span></button>`,
  );

  return `<section class="hero" id="top" aria-labelledby="hero-title">
  <div class="wrap">
    <div class="board hero__board" data-board>
      <canvas class="hero__canvas" aria-hidden="true"></canvas>
      <div class="hero__text">
        <h1 class="hero__title" id="hero-title">
          ${text(t.hero.title)}
          <svg class="hero__underline" viewBox="0 0 300 18" aria-hidden="true" focusable="false">
            <path pathLength="1" d="M3 11 C40 5 85 15 130 9 S215 5 297 10"/>
          </svg>
        </h1>
        <p class="hero__intro">${text(t.hero.intro)}</p>
        <p class="hero__facts">${text(t.hero.facts)}</p>
        <p class="hero__actions">
          <a class="button" href="#projects">${text(t.hero.showProjects)}</a>
          <a class="button button--outline" href="${pdfPath(site, lang)}" download="${pdfDownloadName(site, lang)}">${text(t.hero.downloadCv)}</a>
        </p>
      </div>
      <p class="hero__hint" aria-hidden="true">
        ${text(board.hint)}
        <svg viewBox="0 0 60 44" focusable="false"><path d="M6 6 C22 4 40 12 46 36 M36 28 L46 37 L53 25"/></svg>
      </p>
    </div>
    <div class="tray" data-board-tools>
      <button class="tray__draw" type="button" aria-pressed="false" data-board-draw>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 20l1.2-4.6L15.6 5a2.1 2.1 0 0 1 3 0l.4.4a2.1 2.1 0 0 1 0 3L8.6 18.8Z M13.8 6.8l3.4 3.4"/></svg>
        ${text(board.draw)}
      </button>
      <div class="tray__colors" role="group" aria-label="${plain(board.color)}">
        ${colors.join('\n        ')}
      </div>
      <button class="tray__clear" type="button" data-board-clear>${text(board.clear)}</button>
    </div>
  </div>
</section>`;
}

function renderProjects({ t, lang, projects }) {
  const featured = projects.filter((project) => project.featured);
  const smaller = projects.filter((project) => !project.featured);

  return `<section class="section" id="projects" aria-labelledby="projects-title">
  <div class="wrap">
    <header class="section__header">
      <h2 id="projects-title">${text(t.projects.title)}</h2>
      <p>${text(t.projects.intro)}</p>
    </header>
    <div class="projects">
      ${featured.map((project) => renderProject({ t, lang, project })).join('\n')}
    </div>
    <h3 class="smaller-projects__title">${text(t.projects.smaller)}</h3>
    <div class="smaller-projects">
      ${smaller.map((project) => renderSmallProject({ t, lang, project })).join('\n')}
    </div>
  </div>
</section>`;
}

function renderProject({ t, lang, project }) {
  const p = project[lang];
  return `<article class="project">
  <div class="board project__picture">
    ${renderPicture({ t, lang, project })}
    ${p.status ? `<p class="project__status">${text(p.status)}</p>` : ''}
  </div>
  <h3 class="project__title">${text(p.title)}</h3>
  <p>${text(p.summary)}</p>
  ${p.learned ? `<p class="project__learned"><strong>${text(t.projects.learned)}</strong> ${text(p.learned)}</p>` : ''}
  <p class="project__tech">${text(t.projects.madeWith)} ${plain(sentenceList(project.tech, lang))}</p>
  ${p.note ? `<p class="project__tech">${text(p.note)}</p>` : ''}
  ${renderLinks(project.links, lang)}
</article>`;
}

function renderSmallProject({ t, lang, project }) {
  const p = project[lang];
  return `<article class="small-project">
  <div class="board small-project__picture">${renderPicture({ t, lang, project })}</div>
  <div>
    <h4 class="small-project__title">${text(p.title)}</h4>
    <p>${text(p.summary)}</p>
    <p class="project__tech">${text(t.projects.madeWith)} ${plain(sentenceList(project.tech, lang))}</p>
    ${renderLinks(project.links, lang)}
  </div>
</article>`;
}

// A screenshot when there is one, otherwise the drawing.
function renderPicture({ t, lang, project }) {
  if (project.image) {
    const alt = `${plain(t.projects.screenshotOf)} ${plain(project[lang].title)}`;
    return `<img src="/assets/images/${escapeHtml(project.image)}" alt="${alt}" width="800" height="500" loading="lazy">`;
  }
  return fs.readFileSync(path.join(sketchDir, `${project.sketch}.svg`), 'utf8').trim();
}

function renderLinks(links, lang) {
  if (links.length === 0) return '';
  const items = links.map(
    (link) => `<li><a href="${escapeHtml(link.url)}">${text(link[lang])}</a></li>`,
  );
  return `<ul class="project__links" role="list">${items.join('')}</ul>`;
}

function renderSkills({ site, t }) {
  const words = (list) => list.map((item) => `<li>${plain(item)}</li>`).join('');
  const languages = t.languages.map(
    (language) => `<li><strong>${text(language.name)}</strong> ${text(language.level)}</li>`,
  );

  return `<section class="section" id="skills" aria-labelledby="skills-title">
  <div class="wrap">
    <header class="section__header">
      <h2 id="skills-title">${text(t.skills.title)}</h2>
    </header>
    <div class="board bento">
      <div class="bento__cell bento__cell--code">
        <h3>${text(t.skills.code)}</h3>
        <ul class="bento__words" role="list">${words(site.skills.code)}</ul>
      </div>
      <div class="bento__cell bento__cell--tools">
        <h3>${text(t.skills.tools)}</h3>
        <ul class="bento__list" role="list">${words(site.skills.tools)}</ul>
      </div>
      <div class="bento__cell bento__cell--languages">
        <h3>${text(t.skills.languages)}</h3>
        <ul class="bento__list" role="list">${languages.join('')}</ul>
      </div>
      <div class="bento__cell bento__cell--now">
        <h3>${text(t.skills.now)}</h3>
        <p>${text(t.skills.nowText)}</p>
      </div>
    </div>
  </div>
</section>`;
}

function renderAbout({ site, t, lang }) {
  const history = (items) =>
    items
      .map(
        (item) => `<li>
          <span class="history__period">${text(item.period)}</span>
          <strong>${text(item.title)}</strong>
          <span>${text(item.place)}</span>
        </li>`,
      )
      .join('\n');
  const portrait = site.photo
    ? `<img src="/assets/images/${escapeHtml(site.photo)}" alt="${plain(t.about.photoAlt)}" width="480" height="600" loading="lazy">`
    : renderMonogram('portrait__monogram');

  return `<section class="section" id="about" aria-labelledby="about-title">
  <div class="wrap about">
    <div class="portrait">${portrait}</div>
    <div class="about__text">
      <h2 id="about-title">${text(t.about.title)}</h2>
      ${t.about.paragraphs.map((paragraph) => `<p>${text(paragraph)}</p>`).join('\n      ')}
      <p><a class="button button--outline" href="${pagePath(lang, 'cv')}">${text(t.about.fullCv)}</a></p>
    </div>
    <div class="about__history">
      <h3>${text(t.about.experience)}</h3>
      <ol class="history" role="list">
        ${history(t.cv.experience)}
      </ol>
      <h3>${text(t.about.education)}</h3>
      <ol class="history" role="list">
        ${history(t.cv.education)}
      </ol>
    </div>
  </div>
</section>`;
}

function renderContact({ site, t }) {
  return `<section class="section" id="contact" aria-labelledby="contact-title">
  <div class="wrap">
    <header class="section__header">
      <h2 id="contact-title">${text(t.contact.title)}</h2>
      <p>${text(t.contact.intro)}</p>
    </header>
    <p class="contact__email">
      <a href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a>
      <button class="button button--outline button--small copy-button" type="button" data-copy="${escapeHtml(site.email)}" data-copied="${plain(t.contact.copied)}">${text(t.contact.copy)}</button>
    </p>
    <dl class="contact__list">
      <div><dt>GitHub</dt><dd><a href="${escapeHtml(site.github)}">${escapeHtml(shortUrl(site.github))}</a></dd></div>
      <div><dt>LinkedIn</dt><dd><a href="${escapeHtml(site.linkedin)}">${plain(site.name)}</a></dd></div>
      <div><dt>${text(t.contact.city)}</dt><dd>${plain(site.city)}</dd></div>
    </dl>
  </div>
</section>`;
}
