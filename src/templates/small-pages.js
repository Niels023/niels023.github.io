import { plain, text } from './html.js';
import { renderHead, renderSeo } from './layout.js';
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
//
// A program that makes a preview of a shared link does not follow the
// redirect either. It reads this page, so this page has the share tags too,
// in English.
export function renderLanguageChooser({ site, text: allText }) {
  const links = languages.map(
    (lang) =>
      `<a class="button" href="${pagePath(lang, 'home')}" lang="${lang}" hreflang="${lang}">${languageNames[lang]}</a>`,
  );
  const description = allText.en.meta.homeDescription;

  return `<!doctype html>
<html lang="en">
<head>
${renderHead({ title: site.name, description, inlineScript: redirectScript })}
${renderSeo({ site, t: allText.en, lang: 'en', page: 'home', url: `${site.url}/`, title: site.name, description })}
</head>
<body>
<main class="small-page">
  <div class="panel small-page__panel">
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
  <div class="panel small-page__panel">
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
