# nielspijl.com

This is the source of my personal site and cv: [nielspijl.com](https://nielspijl.com).

The site is plain HTML, CSS and JavaScript, without a framework. A small Node script reads the text
from a few YAML files and writes the pages to `dist/`. The same build makes the cv as a PDF.

- Dutch and English
- A light and a dark theme
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

### On another device

To open the preview on a phone or on another computer in the same network, start it like this:

```
npm start -- --host
```

The terminal then also shows the address for other devices, for example
`http://192.168.2.123:3000`. Type that address in the browser on the other device. Without `--host`
only the computer that runs the preview can open it.

Does the page not load on the other device? Then the firewall of the computer that runs the
preview is the usual cause. On Windows the network has to be set to private, and port 3000 has to
be allowed on private networks. Run this once in PowerShell as administrator:

```
Get-NetConnectionProfile
Set-NetConnectionProfile -InterfaceAlias "WiFi" -NetworkCategory Private
New-NetFirewallRule -DisplayName "Site preview (port 3000)" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000 -Profile Private -RemoteAddress LocalSubnet
```

The first command shows the name to use after `-InterfaceAlias`. Only set a network to private
when it is your own, like the one at home. The rule only counts on private networks and only for
devices in the same network, so on a public network the preview stays closed.

The button that copies my email address is hidden when you open the site this way. Browsers only
allow copying on https and on localhost.

## Build

```
npm run build
```

The finished site ends up in `dist/`.

## Publishing

A push to `main` starts the workflow in `.github/workflows/deploy.yml`. It builds the site and
publishes the `dist/` folder to GitHub Pages.

## Changing the text

All text is in `content/`:

| File                 | What is in it                                                  |
| -------------------- | -------------------------------------------------------------- |
| `site.yaml`          | Facts that are the same in both languages: name, links, skills |
| `nl.yaml`, `en.yaml` | The Dutch and the English text of the site and the cv          |
| `projects.yaml`      | The projects, with their text in both languages                |

The build warns when the Dutch and the English file do not have the same parts, and when a value
still says `TODO`.

## The photo and the screenshots

Images go in `src/images/`. Their file names go in the content files:

- The portrait photo: `photo` in `content/site.yaml`. Use a JPG, PNG or WebP file. A photo straight
  from an iPhone is often a HEIC file, save that as JPG first.
- A screenshot of a project: `image` of that project in `content/projects.yaml`. It can have any
  shape: a wide web page, a square window or the tall screen of a phone. It is shown whole.

The build cuts the portrait to 4 wide by 5 high, saves it in two smaller sizes and puts it on the
home page, on the cv, in the cv PDF and in the share image. Of each screenshot it saves one smaller
copy. The files you put in `src/images/` are never published themselves, only those copies. They
hold nothing but the picture, so not the place where a photo was taken either.

While `photo` says `TODO` the site and the cv simply have no photo. A project without a screenshot
shows a drawing.

## A cv for one job application

```
npm run cv -- example
```

This reads `cv-variants/example.yaml`, lays those texts over the normal cv and saves
`cv-variants/example.pdf`. Copy the example to make your own. A variant can also leave the photo
off. Everything in that folder except the example stays out of git.

## Code style

```
npm run format
```

This formats all files with Prettier.

## License

MIT, see [LICENSE](LICENSE).
