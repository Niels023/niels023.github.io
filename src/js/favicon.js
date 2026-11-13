// Writes the N in the tab icon stroke by stroke. It plays once when the page
// opens and once each time you come back to the tab: the moments you are
// looking at the tab. The rest of the time the icon stands still, so it
// costs no battery.
const icon = document.querySelector('link[rel="icon"][type="image/svg+xml"]');
const finished = icon.href;
const frames = [];
for (let number = 1; number <= Number(icon.dataset.frames); number++) {
  frames.push(`/assets/favicon/frame-${number}.svg`);
}
const wantsCalm = matchMedia('(prefers-reduced-motion: reduce)');
// With 24 frames the N takes a little over a second to write.
const millisecondsPerFrame = 45;
let timer;

function play() {
  if (wantsCalm.matches) return;

  clearInterval(timer);
  let next = 0;
  timer = setInterval(() => {
    icon.href = frames[next] ?? finished;
    if (next === frames.length) clearInterval(timer);
    next += 1;
  }, millisecondsPerFrame);
}

// Fetch the frames up front, so the first run does not stutter.
for (const frame of frames) new Image().src = frame;

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') play();
});
play();
