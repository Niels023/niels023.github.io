# nielspijl.com

This is the source of my personal site and cv: [nielspijl.com](https://nielspijl.com).

The site is plain HTML, CSS and JavaScript, without a framework. A small Node script reads the text
from a few YAML files and writes the pages to `dist/`. The same build makes the cv as a PDF.

- Dutch and English
- A light theme (a whiteboard) and a dark theme (a chalkboard)
- A board at the top of the page that you can draw on
- Also works with JavaScript turned off
- The fonts are hosted on the site itself. No cookies and no analytics.

## Getting started

You need [Node.js](https://nodejs.org) 24.

```
npm install
npx playwright install chromium
```

The second command downloads the browser that the build uses to make the PDFs, the share images
and the icons.

## Preview

```
npm start
```

This builds the site and serves it on http://localhost:3000. When you change a file in `content/`
or `src/`, the site is built again. Refresh the page to see the change.

## Build

```
npm run build
```

The finished site ends up in `dist/`.

## Changing the text

All text is in `content/`:

| File                 | What is in it                                                  |
| -------------------- | -------------------------------------------------------------- |
| `site.yaml`          | Facts that are the same in both languages: name, links, skills |
| `nl.yaml`, `en.yaml` | The Dutch and the English text of the site and the cv          |
| `projects.yaml`      | The projects, with their text in both languages                |

The build warns when the Dutch and the English file do not have the same parts, and when a value
still says `TODO`.

## A cv for one job application

```
npm run cv -- example
```

This reads `cv-variants/example.yaml`, lays those texts over the normal cv and saves
`cv-variants/example.pdf`. Copy the example to make your own. Everything in that folder except the
example stays out of git.

## Code style

```
npm run format
```

This formats all files with Prettier.

## License

MIT, see [LICENSE](LICENSE).
