// The part of the page that starts closest to the top of the screen: a section
// or a project. The other language opens at that part, so the visitor stays
// where they were reading.
function nearestPart() {
  const parts = [...document.querySelectorAll('main section[id], main article[id]')];
  let nearest = parts[0];
  for (const part of parts) {
    if (distanceFromTop(part) < distanceFromTop(nearest)) nearest = part;
  }
  // The first part is the top of the page, which needs no place to open at.
  return nearest === parts[0] ? undefined : nearest;
}

function distanceFromTop(part) {
  return Math.abs(part.getBoundingClientRect().top);
}

for (const link of document.querySelectorAll('[data-language]')) {
  link.addEventListener('click', () => {
    try {
      localStorage.setItem('language', link.dataset.language);
    } catch {
      // Storage can be blocked. The link still works, it is just not remembered.
    }

    // Both languages use the same ids, so the other page opens at the same part.
    const part = nearestPart();
    if (part) link.hash = part.id;
  });
}
