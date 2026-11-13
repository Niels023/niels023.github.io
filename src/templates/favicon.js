import { monogramBottom, monogramPath, monogramStrokes, monogramTop } from './monogram.js';

// The blue of the site. Keep it the same as --accent in src/css/tokens.css.
export const blue = '#1f4fd8';

// The animation in the tab shows the N being written in this many steps.
// With 24 steps a stroke grows one pixel per step in a tab icon of 16 pixels,
// so more steps would not look any smoother.
export const faviconFrames = 24;

// Boxes that cover the part of the N that is written so far. The strokes
// come one after the other and each gets the same share of the time.
function writtenBoxes(progress) {
  const fullHeight = monogramBottom - monogramTop;

  const boxes = monogramStrokes.map((stroke, index) => {
    const share = Math.min(Math.max(progress * monogramStrokes.length - index, 0), 1);
    const height = Math.round(fullHeight * share);
    const y = stroke.startsAt === 'bottom' ? monogramBottom - height : monogramTop;
    return `<rect x="${stroke.x}" y="${y}" width="${stroke.width}" height="${height}"/>`;
  });
  return boxes.join('');
}

// The tab icon: a white N on a blue square with round corners.
// progress runs from 0 (empty square) to 1 (the whole N).
export function renderFavicon(progress = 1) {
  const unfinished = progress < 1;
  const boxes = unfinished ? `\n  <clipPath id="written">${writtenBoxes(progress)}</clipPath>` : '';
  const showOnlyBoxes = unfinished ? ' clip-path="url(#written)"' : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${boxes}
  <rect width="64" height="64" rx="14" fill="${blue}"/>
  <path d="${monogramPath}" fill="#fff"${showOnlyBoxes}/>
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
