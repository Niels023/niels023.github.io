// The font files the site uses, as paths inside node_modules. The build
// copies them to /assets/fonts. src/css/fonts.css names the same files.
//
// These are fixed weights instead of variable fonts on purpose: the browser
// can only embed a fixed font as a real font in the cv PDF.
export const fonts = {
  text: '@fontsource/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-400-normal.woff2',
  textBold:
    '@fontsource/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-700-normal.woff2',
  head: '@fontsource/instrument-sans/files/instrument-sans-latin-700-normal.woff2',
  hand: '@fontsource/shantell-sans/files/shantell-sans-latin-500-normal.woff2',
};

export function fontUrl(name) {
  const fileName = fonts[name].split('/').pop();
  return `/assets/fonts/${fileName}`;
}
