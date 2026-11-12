// Browsers only let a page copy when it comes over https or from this very
// computer. Opened another way, such as the preview on another device in the
// network, the button stays hidden.
if (navigator.clipboard) {
  const status = document.querySelector('[data-copy-status]');

  for (const button of document.querySelectorAll('[data-copy]')) {
    const label = button.textContent;
    button.classList.add('can-copy');

    button.addEventListener('click', async () => {
      await navigator.clipboard.writeText(button.dataset.copy);
      button.textContent = button.dataset.copied;
      // A screen reader does not always say that the text of a button changed.
      // It does read out what appears in the status element.
      status.textContent = button.dataset.copied;

      setTimeout(() => {
        button.textContent = label;
        status.textContent = '';
      }, 2000);
    });
  }
}
