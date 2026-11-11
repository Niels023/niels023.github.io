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
    align-content: center;
    gap: 22px;
    width: 1200px;
    height: 630px;
    padding: 0 88px;
    border-left: 28px solid var(--accent);
  }

  .name {
    font-family: var(--font-head);
    font-size: 104px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.035em;
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
  <p class="name">${plain(site.name)}</p>
  <p class="line">${text(t.meta.shareLine)}</p>
  <p class="url">${plain(shortUrl(site.url))}</p>
</body>
</html>
`;
}
