import { plain, shortUrl, text } from './html.js';
import { portraitPath } from './paths.js';

// The picture that shows up when someone shares a link to the site. The
// build opens this page in a browser and takes a screenshot of 1200 by 630.
// It is never published itself, so its few styles can simply live here.
export function renderShareImage({ site, t, lang }) {
  const photo = site.photo ? `<img class="photo" src="${portraitPath(800)}" alt="">` : '';

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="/assets/site.css">
<style>
  body {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 56px;
    width: 1200px;
    height: 630px;
    padding: 0 88px;
    border-left: 28px solid var(--accent);
  }

  .words {
    display: grid;
    gap: 22px;
  }

  .name {
    font-family: var(--font-head);
    font-size: 104px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.035em;
  }

  /* Next to a photo there is less room, so the name is smaller. */
  .words:has(+ .photo) .name {
    font-size: 78px;
  }

  .line {
    font-size: 40px;
    line-height: 1.3;
  }

  .url {
    color: var(--ink-soft);
    font-size: 30px;
  }

  .photo {
    width: 320px;
    height: 400px;
    border-radius: 20px;
  }
</style>
</head>
<body>
  <div class="words">
    <p class="name">${plain(site.name)}</p>
    <p class="line">${text(t.meta.shareLine)}</p>
    <p class="url">${plain(shortUrl(site.url))}</p>
  </div>
  ${photo}
</body>
</html>
`;
}
