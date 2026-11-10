for (const button of document.querySelectorAll('[data-copy]')) {
  const label = button.textContent;

  button.addEventListener('click', async () => {
    await navigator.clipboard.writeText(button.dataset.copy);
    button.textContent = button.dataset.copied;
    setTimeout(() => (button.textContent = label), 2000);
  });
}
