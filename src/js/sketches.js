// Lets each project drawing draw itself when it scrolls into view.
// Without this script the drawings are simply there.
const wantsCalm = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!wantsCalm) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-drawn');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.35 },
  );

  for (const sketch of document.querySelectorAll('.sketch')) {
    // With a path length of 1, a dash of 1 covers a whole line, whatever
    // its real length. CSS then slides that dash into view.
    sketch.querySelectorAll('path, rect, circle, ellipse').forEach((shape, index) => {
      shape.setAttribute('pathLength', 1);
      shape.style.transitionDelay = `${index * 50}ms`;
    });
    sketch.classList.add('will-draw');
    observer.observe(sketch);
  }
}
