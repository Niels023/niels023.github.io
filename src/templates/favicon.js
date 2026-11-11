import { monogramPath } from './monogram.js';

// The blue of the site. Keep it the same as --accent in src/css/tokens.css.
export const blue = '#1f4fd8';

// The tab icon: a white N on a blue square with round corners.
export function renderFavicon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${blue}"/>
  <path d="${monogramPath}" fill="#fff"/>
</svg>
`;
}

// The icon for a phone's home screen: no round corners (phones cut their own
// shape out of it) and the N a little smaller.
export function renderAppIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="${blue}"/>
  <path d="${monogramPath}" transform="translate(8 8) scale(0.75)" fill="#fff"/>
</svg>
`;
}
