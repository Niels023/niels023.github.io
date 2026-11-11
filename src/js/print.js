for (const button of document.querySelectorAll('[data-print]')) {
  button.addEventListener('click', () => window.print());
}
