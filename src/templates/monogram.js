// The N of the logo, written in one stroke the way you write it by hand:
// up, diagonally down, up again. Used for the favicon and the portrait.
export const monogramPath = 'M17 50 C16 38 17 26 18.5 14 C27 25 37 38 45.5 50 C45 38 46 26 47.5 13';

export function renderMonogram(className) {
  return `<svg class="${className}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <path d="${monogramPath}" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}
