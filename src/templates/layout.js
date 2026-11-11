import crypto from 'node:crypto';
import { fonts, fontUrl } from './fonts.js';
import { escapeHtml, plain, text } from './html.js';
import {
  languages,
  otherLanguage,
  pagePath,
  pdfDownloadName,
  pdfPath,
  portraitPath,
  shareImagePath,
} from './paths.js';

// The page colour of both themes, for the browser bar on phones.
// Keep these the same as --page in src/css/tokens.css.
const pageColors = { light: '#ffffff', dark: '#1b1e24' };

// Runs before the page is drawn, so a saved theme is there from the first
// frame and the page never flashes in the wrong colours.
const themeScript = `(function () {
  var root = document.documentElement;
  root.classList.replace('no-js', 'js');
  try {
    var theme = localStorage.getItem('theme');
    if (theme === 'light' || theme === 'dark') root.dataset.theme = theme;
  } catch (error) {}
})();`;

// Only our own files may load. The one inline script is allowed by its hash.
export function securityPolicy(inlineScript) {
  const hash = crypto.createHash('sha256').update(inlineScript).digest('base64');
  return [
    "default-src 'self'",
    `script-src 'self' 'sha256-${hash}'`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
  ].join('; ');
}

// The part of <head> that every page shares.
export function renderHead({ title, description, inlineScript = themeScript, scripts = [] }) {
  // Every page shows all three fonts on its first screen, so they load early.
  const fontLinks = Object.keys(fonts).map(
    (name) =>
      `<link rel="preload" href="${fontUrl(name)}" as="font" type="font/woff2" crossorigin>`,
  );

  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${securityPolicy(inlineScript)}">
<script>${inlineScript}</script>
<title>${plain(title)}</title>
<meta name="description" content="${plain(description)}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="${pageColors.light}" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="${pageColors.dark}" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
${fontLinks.join('\n')}
<link rel="stylesheet" href="/assets/site.css">
${scripts.map((name) => `<script type="module" src="/assets/js/${name}.js"></script>`).join('\n')}`;
}

function renderSeo({ site, t, lang, page, title, description }) {
  const url = site.url + pagePath(lang, page);
  // The home page has / as its neutral address. The cv has no neutral
  // address, so there English is the fallback.
  const fallback = page === 'cv' ? site.url + pagePath('en', 'cv') : `${site.url}/`;
  const locales = { nl: 'nl_NL', en: 'en_GB' };

  return `<link rel="canonical" href="${url}">
${languages.map((l) => `<link rel="alternate" hreflang="${l}" href="${site.url}${pagePath(l, page)}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${fallback}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${plain(site.name)}">
<meta property="og:title" content="${plain(title)}">
<meta property="og:description" content="${plain(description)}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="${locales[lang]}">
<meta property="og:locale:alternate" content="${locales[otherLanguage(lang)]}">
<meta property="og:image" content="${site.url}${shareImagePath(lang)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${plain(t.meta.shareImageAlt)}">
<meta name="twitter:card" content="summary_large_image">`;
}

function renderPersonData(site) {
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    url: site.url,
    email: `mailto:${site.email}`,
    address: { '@type': 'PostalAddress', addressLocality: site.city, addressCountry: 'NL' },
    sameAs: [site.github, site.linkedin],
  };
  if (site.photo) person.image = site.url + portraitPath(800);

  const json = JSON.stringify(person, null, 2).replaceAll('<', '\\u003c');
  return `<script type="application/ld+json">\n${json}\n</script>`;
}

function renderHeader({ site, t, lang, page }) {
  const home = pagePath(lang, 'home');
  const sections = ['projects', 'skills', 'about'];
  const cvCurrent = page === 'cv' ? ' aria-current="page"' : '';

  return `<header class="site-header">
  <div class="wrap site-header__bar">
    <a class="site-name" href="${home}">${plain(site.name)}</a>
    <nav class="site-nav" id="site-nav" aria-label="${plain(t.a11y.mainMenu)}">
      <ul class="site-nav__list" role="list">
        ${sections.map((id) => `<li><a href="${home}#${id}">${text(t.nav[id])}</a></li>`).join('\n        ')}
        <li><a href="${pagePath(lang, 'cv')}"${cvCurrent}>${text(t.nav.cv)}</a></li>
        <li><a href="${home}#contact">${text(t.nav.contact)}</a></li>
        <li><a class="button button--small" href="${pdfPath(site, lang)}" download="${pdfDownloadName(site, lang)}">${text(t.nav.downloadCv)}</a></li>
      </ul>
    </nav>
    <div class="site-tools">
      ${renderLanguageSwitch({ t, lang, page })}
      <button class="icon-button theme-toggle" type="button" aria-pressed="false" data-theme-toggle>
        <svg class="theme-toggle__sun" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3 7 7M17 17l1.7 1.7M18.7 5.3 17 7M7 17l-1.7 1.7"/></svg>
        <svg class="theme-toggle__moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19.5 14.2A8 8 0 0 1 9.8 4.5a8 8 0 1 0 9.7 9.7Z"/></svg>
        <span class="visually-hidden">${text(t.a11y.darkTheme)}</span>
      </button>
      <button class="icon-button menu-button" type="button" aria-expanded="false" aria-controls="site-nav" data-menu-button>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        <span class="visually-hidden">${text(t.a11y.menuButton)}</span>
      </button>
    </div>
  </div>
</header>`;
}

export function renderLanguageSwitch({ t, lang, page }) {
  const names = { nl: 'Nederlands', en: 'English' };
  const links = languages.map((l) => {
    const current = l === lang ? ' aria-current="true"' : '';
    const label = `${l.toUpperCase()}, ${names[l]}`;
    return `<a href="${pagePath(l, page)}" lang="${l}" hreflang="${l}" aria-label="${label}" data-language="${l}"${current}>${l.toUpperCase()}</a>`;
  });
  return `<div class="language-switch" role="group" aria-label="${plain(t.a11y.languages)}">${links.join('')}</div>`;
}

function renderFooter({ site, t, year }) {
  return `<footer class="site-footer">
  <div class="wrap site-footer__bar">
    <p>&copy; ${year} ${plain(site.name)}</p>
    <p>${text(t.footer.built)} <a href="${escapeHtml(site.sourceCode)}">${text(t.footer.source)}</a></p>
  </div>
</footer>`;
}

export function renderPage({ site, t, lang, page, title, description, year, main, scripts }) {
  const sharedScripts = ['theme', 'menu', 'language', 'hello'];
  const hello = `data-hello="${plain(t.console.hello)} ${escapeHtml(site.sourceCode)}"`;

  return `<!doctype html>
<html lang="${lang}" class="no-js" ${hello}>
<head>
${renderHead({ title, description, scripts: [...sharedScripts, ...scripts] })}
${renderSeo({ site, t, lang, page, title, description })}
${page === 'home' ? renderPersonData(site) : ''}
</head>
<body class="page-${page}">
<a class="skip-link" href="#main">${text(t.a11y.skipLink)}</a>
${renderHeader({ site, t, lang, page })}
<main id="main">
${main}
</main>
${renderFooter({ site, t, year })}
</body>
</html>
`;
}
