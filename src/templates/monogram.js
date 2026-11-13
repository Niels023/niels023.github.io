// The N of the tab icon and the app icon: a shape in a box of 64 by 64.
export const monogramPath = 'M17 48V16h9.5L38 33V16h9v32h-9.5L26 31v17Z';

// The same N as the three strokes you write it with: up the left leg, down
// the diagonal, up the right leg. Each stroke is a column of the box, from
// x to x + width. The animation in the tab uses this.
export const monogramTop = 16;
export const monogramBottom = 48;
export const monogramStrokes = [
  { x: 17, width: 9, startsAt: 'bottom' },
  { x: 26, width: 12, startsAt: 'top' },
  { x: 38, width: 9, startsAt: 'bottom' },
];
