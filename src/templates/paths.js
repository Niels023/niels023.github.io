export const languages = ['nl', 'en'];

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
