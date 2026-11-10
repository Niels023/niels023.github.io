const board = document.querySelector('[data-board]');
const tray = document.querySelector('[data-board-tools]');
const canvas = board.querySelector('canvas');
const context = canvas.getContext('2d');
const drawButton = tray.querySelector('[data-board-draw]');
const colorButtons = [...tray.querySelectorAll('[data-board-color]')];

// A stroke keeps its colour number and its points as fractions of the board
// size. That way the drawing can be redrawn when the board changes size or
// the theme changes the colours.
let strokes = [];
let currentStroke = null;
let colorNumber = 1;

function isDrawing() {
  return drawButton.getAttribute('aria-pressed') === 'true';
}

function setDrawing(on) {
  drawButton.setAttribute('aria-pressed', String(on));
  board.classList.toggle('is-drawing', on);
  tray.classList.toggle('is-drawing', on);
}

function fitCanvas() {
  const scale = window.devicePixelRatio;
  canvas.width = canvas.clientWidth * scale;
  canvas.height = canvas.clientHeight * scale;
  context.scale(scale, scale);
  context.lineWidth = 5;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  redraw();
}

function redraw() {
  context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  for (const stroke of strokes) drawLine(stroke, 0);
}

// Draws a stroke from the point with the given number to its end.
function drawLine(stroke, from) {
  context.strokeStyle = getComputedStyle(board).getPropertyValue(`--marker-${stroke.color}`);
  context.beginPath();
  for (const [x, y] of stroke.points.slice(from)) {
    context.lineTo(x * canvas.clientWidth, y * canvas.clientHeight);
  }
  context.stroke();
}

function pointOf(event) {
  const box = canvas.getBoundingClientRect();
  return [(event.clientX - box.left) / box.width, (event.clientY - box.top) / box.height];
}

function endStroke() {
  currentStroke = null;
}

canvas.addEventListener('pointerdown', (event) => {
  // A finger also scrolls the page, so it only draws after the switch in the
  // tray is turned on. A mouse or a pen can always draw.
  if (event.pointerType === 'touch' && !isDrawing()) return;
  if (event.button !== 0) return;
  canvas.setPointerCapture(event.pointerId);
  currentStroke = { color: colorNumber, points: [pointOf(event)] };
  strokes.push(currentStroke);
  board.classList.add('has-drawing');
});

canvas.addEventListener('pointermove', (event) => {
  if (!currentStroke) return;
  currentStroke.points.push(pointOf(event));
  drawLine(currentStroke, currentStroke.points.length - 2);
});

canvas.addEventListener('pointerup', endStroke);
canvas.addEventListener('pointercancel', endStroke);

drawButton.addEventListener('click', () => setDrawing(!isDrawing()));

for (const button of colorButtons) {
  button.addEventListener('click', () => {
    colorNumber = Number(button.dataset.boardColor);
    for (const other of colorButtons) {
      other.setAttribute('aria-pressed', String(other === button));
    }
  });
}

tray.querySelector('[data-board-clear]').addEventListener('click', () => {
  strokes = [];
  board.classList.remove('has-drawing');
  redraw();
});

new ResizeObserver(fitCanvas).observe(canvas);
document.addEventListener('themechange', redraw);
