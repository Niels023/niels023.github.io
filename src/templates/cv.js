import { escapeHtml, plain, sentenceList, shortUrl, text } from './html.js';
import { pagePath, pdfDownloadName, pdfPath, portraitPath } from './paths.js';

// updated is the month and year the cv was built, already in the right language.
export function renderCv({ site, t, lang, projects, updated }) {
  const cv = t.cv;
  const onCv = projects.filter((project) => project.onCv);
  const photo = site.photo
    ? `<img class="cv__photo" src="${portraitPath(400)}" alt="${plain(t.meta.photoAlt)}" width="400" height="500">`
    : '';

  return `<div class="wrap">
  <p class="cv-actions">
    <a class="cv-actions__back" href="${pagePath(lang, 'home')}">${text(cv.back)}</a>
    <button class="button button--outline button--small print-button" type="button" data-print>${text(cv.print)}</button>
    <a class="button button--small" href="${pdfPath(site, lang)}" download="${pdfDownloadName(site, lang)}">${text(cv.download)}</a>
  </p>
  <article class="cv">
    <header class="cv__header${photo ? ' cv__header--photo' : ''}">
      ${photo}
      <div>
        <h1 class="cv__name">${plain(site.name)}</h1>
        <p class="cv__role">${text(cv.role)}</p>
      </div>
      ${renderContact({ site, cv })}
    </header>
    <div class="cv__columns">
      <div>
        <section>
          <h2>${text(cv.profileTitle)}</h2>
          <p>${text(cv.profile)}</p>
        </section>
        <section>
          <h2>${text(cv.experienceTitle)}</h2>
          ${cv.experience.map(renderEntry).join('\n')}
        </section>
        <section>
          <h2>${text(cv.projectsTitle)}</h2>
          ${onCv.map((project) => renderProject({ t, lang, project })).join('\n')}
        </section>
      </div>
      <div>
        <section>
          <h2>${text(cv.educationTitle)}</h2>
          ${cv.education.map(renderEntry).join('\n')}
        </section>
        <section>
          <h2>${text(cv.skillsTitle)}</h2>
          <dl class="cv__skills">
            <dt>${text(t.skills.code)}</dt>
            <dd>${plain(site.skills.code.join(', '))}</dd>
            <dt>${text(t.skills.tools)}</dt>
            <dd>${plain(site.skills.tools.join(', '))}</dd>
          </dl>
        </section>
        <section>
          <h2>${text(cv.languagesTitle)}</h2>
          <ul class="cv__languages" role="list">
            ${t.languages.map((language) => `<li><strong>${text(language.name)}</strong> ${text(language.level)}</li>`).join('\n            ')}
          </ul>
        </section>
      </div>
    </div>
    <p class="cv__updated">${text(cv.updated)} ${escapeHtml(updated)}</p>
  </article>
</div>`;
}

function renderContact({ site, cv }) {
  const links = [
    [`mailto:${site.email}`, site.email],
    [site.url, shortUrl(site.url)],
    [site.github, shortUrl(site.github)],
    [site.linkedin, shortUrl(site.linkedin)],
  ];

  return `<address class="cv__contact" aria-label="${plain(cv.contactTitle)}">
        ${links.map(([url, label]) => `<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`).join('\n        ')}
        <span>${plain(site.city)}</span>
      </address>`;
}

// One job or one school.
function renderEntry(entry) {
  return `<div class="cv-entry">
            <div class="cv-entry__head">
              <h3>${text(entry.title)}</h3>
              <p class="cv-entry__period">${text(entry.period)}</p>
            </div>
            <p class="cv-entry__place">${text(entry.place)}</p>
            ${'note' in entry ? `<p class="cv-entry__note">${text(entry.note)}</p>` : ''}
            <ul>
              ${entry.points.map((point) => `<li>${text(point)}</li>`).join('\n              ')}
            </ul>
          </div>`;
}

function renderProject({ t, lang, project }) {
  const p = project[lang];
  const link = project.links[0];

  return `<div class="cv-entry">
            <div class="cv-entry__head">
              <h3>${text(p.title)}</h3>
              ${p.status ? `<p class="cv-entry__period">${text(p.status)}</p>` : ''}
            </div>
            <p>${text(p.summary)}</p>
            <p class="cv-entry__note">${text(t.projects.madeWith)} ${plain(sentenceList(project.tech, lang))}${link ? `, <a href="${escapeHtml(link.url)}">${escapeHtml(shortUrl(link.url).split('?')[0])}</a>` : ''}</p>
          </div>`;
}
