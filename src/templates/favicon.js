import { monogramPath } from './monogram.js';

// The animation in the tab shows the N being written in this many steps.
export const faviconFrames = 6;

// The tab icon: the N written on a small board. It follows the colour scheme
// of the browser, because that is what a tab is seen against. A light tab
// bar gets the dark chalkboard and a dark tab bar gets the whiteboard, so
// the icon stands out in both.
//
// progress runs from 0 (empty board) to 1 (the whole N).
export function renderFavicon(progress = 1) {
  const letter =
    progress === 0
      ? ''
      : `<path class="letter" d="${monogramPath}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${(1 - progress).toFixed(2)}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <style>
    .board { fill: #1d2b25; stroke: #1d2b25; stroke-width: 3; }
    .letter { fill: none; stroke: #f2d45c; stroke-width: 8; stroke-linecap: round; stroke-linejoin: round; }
    @media (prefers-color-scheme: dark) {
      .board { fill: #fff; stroke: #c4cbd0; }
      .letter { stroke: #1f4fd8; }
    }
  </style>
  <rect class="board" x="1.5" y="1.5" width="61" height="61" rx="13"/>
  ${letter}
</svg>
`;
}
