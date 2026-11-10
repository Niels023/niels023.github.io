// The font files the site uses, as paths inside node_modules. The build
// copies them to /assets/fonts. src/css/fonts.css names the same files.
export const fonts = {
  text: '@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2',
  head: '@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2',
  hand: '@fontsource/shantell-sans/files/shantell-sans-latin-500-normal.woff2',
};

export function fontUrl(name) {
  const fileName = fonts[name].split('/').pop();
  return `/assets/fonts/${fileName}`;
}
