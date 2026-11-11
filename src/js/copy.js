// Browsers only let a page copy when it comes over https or from this very
// computer. Opened another way, such as the preview on another device in the
// network, the button stays hidden.
if (navigator.clipboard) {
  for (const button of document.querySelectorAll('[data-copy]')) {
    const label = button.textContent;
    button.classList.add('can-copy');

    button.addEventListener('click', async () => {
      await navigator.clipboard.writeText(button.dataset.copy);
      button.textContent = button.dataset.copied;
      setTimeout(() => (button.textContent = label), 2000);
    });
  }
}
