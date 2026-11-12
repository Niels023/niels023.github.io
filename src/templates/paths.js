export const languages = ['nl', 'en'];

// The kind of Dutch and English the site is written in. Dates and lists
// follow it: British English writes "PHP, MySQL and Git" without a comma
// before "and".
export const locales = { nl: 'nl-NL', en: 'en-GB' };

export function otherLanguage(lang) {
  return lang === 'nl' ? 'en' : 'nl';
}

// page is 'home' or 'cv'.
export function pagePath(lang, page) {
  return page === 'cv' ? `/${lang}/cv/` : `/${lang}/`;
}

export function pdfPath(site, lang) {
  const name = site.name.toLowerCase().replaceAll(' ', '-');
  return `/${lang}/cv/${name}-cv-${lang}.pdf`;
}

// The name a visitor gets when downloading: Niels-van-der-Pijl-CV-NL.pdf
export function pdfDownloadName(site, lang) {
  return `${site.name.replaceAll(' ', '-')}-CV-${lang.toUpperCase()}.pdf`;
}

export function shareImagePath(lang) {
  return `/assets/images/share-${lang}.png`;
}

// The portrait photo is saved in these widths, always 4 wide by 5 high.
export const portraitWidths = [400, 800];

export function portraitPath(width) {
  return `/assets/images/portrait-${width}.jpg`;
}
