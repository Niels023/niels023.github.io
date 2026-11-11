import { plain, text } from './html.js';
import { renderHead } from './layout.js';
import { languages, pagePath } from './paths.js';

// GitHub Pages cannot redirect on the server, so the page at / does it in
// the browser: to the language the visitor chose before, otherwise to the
// language of the browser. Dutch stays Dutch, everything else gets English.
const redirectScript = `(function () {
  var language;
  try {
    language = localStorage.getItem('language');
  } catch (error) {}
  if (language !== 'nl' && language !== 'en') {
    language = /^nl\\b/i.test(navigator.language) ? 'nl' : 'en';
  }
  location.replace('/' + language + '/' + location.hash);
})();`;

const languageNames = { nl: 'Nederlands', en: 'English' };

// The page at /. Visitors without JavaScript get a link to each language.
export function renderLanguageChooser({ site, text: allText }) {
  const links = languages.map(
    (lang) =>
      `<a class="button" href="${pagePath(lang, 'home')}" lang="${lang}" hreflang="${lang}">${languageNames[lang]}</a>`,
  );

  return `<!doctype html>
<html lang="en">
<head>
${renderHead({
  title: site.name,
  description: allText.en.meta.homeDescription,
  inlineScript: redirectScript,
})}
<link rel="canonical" href="${site.url}/">
${languages.map((lang) => `<link rel="alternate" hreflang="${lang}" href="${site.url}${pagePath(lang, 'home')}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${site.url}/">
</head>
<body>
<main class="small-page">
  <div class="board small-page__board">
    <h1 class="small-page__title">${plain(site.name)}</h1>
    <p class="small-page__actions">${links.join('\n    ')}</p>
  </div>
</main>
</body>
</html>
`;
}

// GitHub Pages serves this page for every address that does not exist, in
// either language, so it shows both.
export function renderNotFound({ site, text: allText }) {
  const blocks = languages.map((lang) => {
    const t = allText[lang].notFound;
    return `<div lang="${lang}">
      <h2>${text(t.title)}</h2>
      <p>${text(t.text)}</p>
      <p><a class="button" href="${pagePath(lang, 'home')}">${text(t.home)}</a></p>
    </div>`;
  });

  return `<!doctype html>
<html lang="en" class="no-js">
<head>
${renderHead({
  title: `${allText.en.notFound.title} / ${allText.nl.notFound.title}`,
  description: allText.en.notFound.text,
})}
<meta name="robots" content="noindex">
</head>
<body>
<main class="small-page">
  <div class="board small-page__board">
    <h1 class="small-page__title">404</h1>
    <div class="small-page__columns">
    ${blocks.join('\n    ')}
    </div>
    <p class="small-page__name"><a href="/">${plain(site.name)}</a></p>
  </div>
</main>
</body>
</html>
`;
}
