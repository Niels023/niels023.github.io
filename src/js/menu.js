const button = document.querySelector('[data-menu-button]');
const nav = document.getElementById('site-nav');

function isOpen() {
  return button.getAttribute('aria-expanded') === 'true';
}

function setOpen(open) {
  button.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
}

button.addEventListener('click', () => {
  setOpen(!isOpen());
  // The links come before the button in the page, so focus moves to them.
  if (isOpen()) nav.querySelector('a').focus();
});

nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) setOpen(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isOpen()) {
    setOpen(false);
    button.focus();
  }
});
