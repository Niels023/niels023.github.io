const root = document.documentElement;
const button = document.querySelector('[data-theme-toggle]');
const systemDark = matchMedia('(prefers-color-scheme: dark)');

function currentTheme() {
  return root.dataset.theme ?? (systemDark.matches ? 'dark' : 'light');
}

function showTheme() {
  button.setAttribute('aria-pressed', String(currentTheme() === 'dark'));

  // The browser bar on phones takes the page colour of the theme in use.
  const pageColor = getComputedStyle(root).getPropertyValue('--page').trim();
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    meta.content = pageColor;
  }

  document.dispatchEvent(new Event('themechange'));
}

function switchTheme() {
  const theme = currentTheme() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = theme;
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // Storage can be blocked. The theme then lasts until the page reloads.
  }
  showTheme();
}

button.addEventListener('click', () => {
  const wantsCalm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (document.startViewTransition && !wantsCalm) {
    document.startViewTransition(switchTheme);
  } else {
    switchTheme();
  }
});

systemDark.addEventListener('change', showTheme);
showTheme();
