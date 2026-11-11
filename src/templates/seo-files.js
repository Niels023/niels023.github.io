import { languages, pagePath } from './paths.js';

// day is the build date as 2026-11-10.
export function renderSitemap(site, day) {
  const urls = [];
  for (const page of ['home', 'cv']) {
    for (const lang of languages) {
      const alternates = languages.map(
        (other) =>
          `    <xhtml:link rel="alternate" hreflang="${other}" href="${site.url}${pagePath(other, page)}"/>`,
      );
      urls.push(`  <url>
    <loc>${site.url}${pagePath(lang, page)}</loc>
    <lastmod>${day}</lastmod>
${alternates.join('\n')}
  </url>`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
}

export function renderRobots(site) {
  return `User-agent: *
Allow: /

Sitemap: ${site.url}/sitemap.xml
`;
}

export function renderManifest(site) {
  const manifest = {
    name: site.name,
    short_name: site.name.split(' ')[0],
    start_url: '/',
    display: 'browser',
    background_color: '#f1f3f2',
    theme_color: '#1d2b25',
    icons: [
      { src: '/assets/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/assets/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
  return `${JSON.stringify(manifest, null, 2)}\n`;
}
