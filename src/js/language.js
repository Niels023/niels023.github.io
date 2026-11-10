// The section the visitor is reading: the last one that starts above the
// middle of the screen. The first section is the top of the page.
function currentSection() {
  const sections = [...document.querySelectorAll('main section[id]')];
  const reading = sections.findLast(
    (section) => section.getBoundingClientRect().top < innerHeight / 2,
  );
  return reading === sections[0] ? undefined : reading;
}

for (const link of document.querySelectorAll('[data-language]')) {
  link.addEventListener('click', () => {
    try {
      localStorage.setItem('language', link.dataset.language);
    } catch {
      // Storage can be blocked. The link still works, it is just not remembered.
    }

    // Both languages use the same ids, so the other page opens at the same section.
    const section = currentSection();
    if (section) link.hash = section.id;
  });
}
