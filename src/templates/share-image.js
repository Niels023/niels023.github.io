import { plain, shortUrl, text } from './html.js';

// The picture that shows up when someone shares a link to the site. The
// build opens this page in a browser and takes a screenshot of 1200 by 630.
// It is never published itself, so its few styles can simply live here.
export function renderShareImage({ site, t, lang }) {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="/assets/site.css">
<style>
  body {
    display: grid;
    width: 1200px;
    height: 630px;
    padding: 44px;
  }

  .board {
    display: grid;
    align-content: center;
    gap: 22px;
    padding: 0 76px;
    border-width: 4px;
    border-radius: 20px;
  }

  .name {
    position: relative;
    width: fit-content;
    padding-bottom: 26px;
    font-family: var(--font-hand);
    font-size: 108px;
    font-weight: 500;
    line-height: 1;
  }

  .name svg {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    overflow: visible;
    fill: none;
    stroke: var(--accent);
    stroke-width: 3;
    stroke-linecap: round;
  }

  .line {
    font-size: 40px;
  }

  .url {
    color: var(--ink-soft);
    font-size: 30px;
  }
</style>
</head>
<body>
  <div class="board">
    <p class="name">
      ${plain(site.name)}
      <svg viewBox="0 0 300 18"><path d="M3 11 C40 5 85 15 130 9 S215 5 297 10"/></svg>
    </p>
    <p class="line">${text(t.meta.shareLine)}</p>
    <p class="url">${plain(shortUrl(site.url))}</p>
  </div>
</body>
</html>
`;
}
