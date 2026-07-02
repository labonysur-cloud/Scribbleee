// ── templates.js — Pre-made letter stroke templates ──────────
// Canvas: 500×600 | Cap: y=82 | X-height: y=210 | Baseline: y=450 | Descender: y=530
//
// Each glyph is an array of "strokes". Each stroke is an array of [x,y] coordinate
// pairs tracing the path. The getTemplate() function converts these to DrawingCanvas
// stroke objects (adding pressure and style info from the chosen template style).

/**
 * Generate points along an elliptical arc (in screen coordinates, Y grows downward).
 *   angle=0      → rightmost point  (x = cx+rx, y = cy)
 *   angle=PI/2   → bottom point     (x = cx,    y = cy+ry)
 *   angle=PI     → leftmost point   (x = cx-rx, y = cy)
 *   angle=-PI/2  → top point        (x = cx,    y = cy-ry)
 *
 * Going from a1 to a2:
 *   • a2 > a1  → clockwise visually (positive sin = downward)
 *   • a2 < a1  → counter-clockwise visually
 */
function arc(cx, cy, rx, ry, a1, a2, n = 22) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = a1 + (a2 - a1) * (i / n);
    pts.push([Math.round(cx + rx * Math.cos(t)), Math.round(cy + ry * Math.sin(t))]);
  }
  return pts;
}

const P = Math.PI;

// ── UPPERCASE LETTERS ──────────────────────────────────────────
// Cap: y=82, Baseline: y=450, midY≈266

const UPPERCASE = {
  A: [
    [[250, 82], [150, 450]],
    [[250, 82], [350, 450]],
    [[191, 268], [309, 268]],
  ],
  B: [
    [[155, 82], [155, 450]],
    arc(155, 163, 110, 82, -P / 2, P / 2, 14),
    arc(155, 348, 125, 103, -P / 2, P / 2, 14),
  ],
  C: [arc(250, 268, 140, 188, -P * 0.25, -P * 1.75)],
  D: [
    [[155, 82], [155, 450]],
    arc(155, 268, 225, 188, -P / 2, P / 2),
  ],
  E: [
    [[155, 82], [155, 450]],
    [[155, 82], [350, 82]],
    [[155, 268], [300, 268]],
    [[155, 450], [345, 450]],
  ],
  F: [
    [[155, 82], [155, 450]],
    [[155, 82], [340, 82]],
    [[155, 255], [295, 255]],
  ],
  G: [
    arc(250, 268, 140, 188, -P * 0.17, -P * 2.0),
    [[390, 268], [260, 268]],
  ],
  H: [
    [[155, 82], [155, 450]],
    [[355, 82], [355, 450]],
    [[155, 268], [355, 268]],
  ],
  I: [[[250, 82], [250, 450]]],
  J: [
    [[155, 82], [355, 82]],
    [[305, 82], [305, 400]],
    arc(205, 400, 100, 58, 0, P, 12),
  ],
  K: [
    [[155, 82], [155, 450]],
    [[155, 258], [360, 82]],
    [[155, 258], [360, 450]],
  ],
  L: [
    [[165, 82], [165, 450]],
    [[165, 450], [360, 450]],
  ],
  M: [
    [[140, 82], [140, 450]],
    [[140, 82], [250, 295]],
    [[250, 295], [360, 82]],
    [[360, 82], [360, 450]],
  ],
  N: [
    [[155, 82], [155, 450]],
    [[155, 82], [355, 450]],
    [[355, 82], [355, 450]],
  ],
  O: [arc(250, 268, 148, 188, 0, 2 * P)],
  P: [
    [[155, 82], [155, 450]],
    arc(155, 178, 118, 97, -P / 2, P / 2, 14),
  ],
  Q: [
    arc(250, 268, 148, 188, 0, 2 * P),
    [[295, 388], [382, 462]],
  ],
  R: [
    [[155, 82], [155, 450]],
    arc(155, 178, 118, 97, -P / 2, P / 2, 14),
    [[248, 272], [365, 450]],
  ],
  S: [
    arc(250, 165, 110, 85, P * 0.9, P * 2.1),
    arc(250, 358, 110, 85, -P * 0.1, P * 1.1),
  ],
  T: [
    [[130, 82], [370, 82]],
    [[250, 82], [250, 450]],
  ],
  U: [
    [[155, 82], [155, 395]],
    arc(250, 395, 95, 58, P, 0),
    [[345, 395], [345, 82]],
  ],
  V: [
    [[150, 82], [250, 450]],
    [[250, 450], [350, 82]],
  ],
  W: [
    [[130, 82], [185, 450]],
    [[185, 450], [250, 270]],
    [[250, 270], [315, 450]],
    [[315, 450], [370, 82]],
  ],
  X: [
    [[150, 82], [350, 450]],
    [[350, 82], [150, 450]],
  ],
  Y: [
    [[150, 82], [250, 280]],
    [[350, 82], [250, 280]],
    [[250, 280], [250, 450]],
  ],
  Z: [
    [[155, 82], [355, 82]],
    [[355, 82], [155, 450]],
    [[155, 450], [355, 450]],
  ],
};

// ── LOWERCASE LETTERS ─────────────────────────────────────────
// X-height: y=210, Baseline: y=450, midY=330, Descender: y=530

const LOWERCASE = {
  a: [
    arc(250, 330, 95, 120, 0, P * 1.95),
    [[345, 210], [345, 450]],
  ],
  b: [
    [[165, 82], [165, 450]],
    arc(255, 330, 90, 120, 0, 2 * P),
  ],
  c: [arc(248, 330, 105, 120, -P * 0.25, -P * 1.75)],
  d: [
    [[355, 82], [355, 450]],
    arc(255, 330, 100, 120, 0, 2 * P),
  ],
  e: [
    arc(250, 330, 105, 120, P * 0.1, P * 1.9),
    [[145, 330], [355, 330]],
  ],
  f: [
    arc(170, 188, 85, 110, -P / 2, 0, 12),
    [[255, 82], [255, 450]],
    [[178, 295], [332, 295]],
  ],
  g: [
    arc(250, 330, 95, 120, 0, 2 * P),
    [[345, 210], [345, 490]],
    arc(250, 497, 95, 50, 0, P, 12),
  ],
  h: [
    [[165, 82], [165, 450]],
    arc(275, 270, 110, 65, -P, 0, 14),
    [[385, 270], [385, 450]],
  ],
  i: [
    [[250, 248], [250, 450]],
    [[246, 200], [254, 200]],
  ],
  j: [
    [[250, 248], [250, 490]],
    arc(185, 490, 65, 45, 0, P, 10),
    [[246, 200], [254, 200]],
  ],
  k: [
    [[165, 82], [165, 450]],
    [[165, 312], [360, 210]],
    [[165, 312], [360, 450]],
  ],
  l: [[[250, 82], [250, 450]]],
  m: [
    [[140, 210], [140, 450]],
    arc(215, 265, 75, 60, -P, 0, 10),
    [[290, 265], [290, 450]],
    arc(365, 265, 75, 60, -P, 0, 10),
    [[440, 265], [440, 450]],
  ],
  n: [
    [[165, 210], [165, 450]],
    arc(275, 270, 110, 65, -P, 0, 14),
    [[385, 270], [385, 450]],
  ],
  o: [arc(250, 330, 105, 120, 0, 2 * P)],
  p: [
    [[165, 210], [165, 530]],
    arc(255, 330, 90, 120, 0, 2 * P),
  ],
  q: [
    [[355, 210], [355, 530]],
    arc(255, 330, 100, 120, 0, 2 * P),
  ],
  r: [
    [[165, 210], [165, 450]],
    [[165, 263], [298, 218]],
  ],
  s: [
    arc(250, 272, 88, 65, P * 0.9, P * 2.1),
    arc(250, 400, 88, 55, -P * 0.1, P * 1.1),
  ],
  t: [
    [[250, 140], [250, 450]],
    [[178, 255], [322, 255]],
  ],
  u: [
    [[160, 210], [160, 390]],
    arc(250, 390, 90, 60, P, 0),
    [[340, 390], [340, 210]],
  ],
  v: [
    [[165, 210], [250, 450]],
    [[250, 450], [335, 210]],
  ],
  w: [
    [[140, 210], [190, 450]],
    [[190, 450], [250, 310]],
    [[250, 310], [310, 450]],
    [[310, 450], [360, 210]],
  ],
  x: [
    [[165, 210], [335, 450]],
    [[335, 210], [165, 450]],
  ],
  y: [
    [[165, 210], [250, 365]],
    [[335, 210], [250, 365]],
    [[250, 365], [185, 530]],
  ],
  z: [
    [[155, 210], [355, 210]],
    [[355, 210], [155, 450]],
    [[155, 450], [355, 450]],
  ],
};

// ── DIGITS ───────────────────────────────────────────────────
// Same vertical range as uppercase: y=82 to y=450

const DIGITS = {
  '0': [arc(250, 268, 148, 188, 0, 2 * P)],
  '1': [
    [[195, 140], [250, 82], [250, 450]],
    [[195, 450], [305, 450]],
  ],
  '2': [
    arc(280, 168, 108, 88, P * 1.25, P * 1.98),
    [[380, 168], [165, 450]],
    [[165, 450], [380, 450]],
  ],
  '3': [
    arc(245, 165, 115, 83, P * 0.85, P * 2.0),
    arc(248, 358, 115, 94, 0, P * 1.15),
  ],
  '4': [
    [[315, 82], [130, 320]],
    [[130, 320], [390, 320]],
    [[315, 82], [315, 450]],
  ],
  '5': [
    [[350, 82], [155, 82]],
    [[155, 82], [155, 268]],
    arc(248, 360, 115, 95, P * 1.05, P * 2.0),
  ],
  '6': [
    arc(250, 340, 125, 175, P * 0.2, P * 1.8),
    arc(250, 358, 108, 93, 0, 2 * P),
  ],
  '7': [
    [[145, 82], [360, 82]],
    [[360, 82], [200, 450]],
  ],
  '8': [
    arc(250, 178, 95, 98, 0, 2 * P),
    arc(250, 360, 105, 95, 0, 2 * P),
  ],
  '9': [
    arc(250, 180, 105, 100, 0, 2 * P),
    [[355, 180], [295, 450]],
  ],
};

// ── PUNCTUATION & SPECIAL ──────────────────────────────────────
const SPECIAL = {
  '!': [[[250, 82], [250, 360]], [[248, 420], [252, 420]]],
  '?': [arc(250, 162, 110, 82, P * 1.25, P * 2.0), [[250, 240], [250, 360]], [[248, 420], [252, 420]]],
  '.': [[[247, 425], [253, 425]]],
  ',': [[[250, 420], [235, 460]]],
  '-': [[[165, 268], [335, 268]]],
  '_': [[[130, 450], [370, 450]]],
  '(': [arc(280, 268, 130, 200, P * 0.55, P * 1.45)],
  ')': [arc(220, 268, 130, 200, -P * 0.45, P * 0.45)],
};

// ── ALL GLYPHS ───────────────────────────────────────────────
const GLYPH_DB = {
  ...UPPERCASE,
  ...LOWERCASE,
  ...DIGITS,
  ...SPECIAL,
};

// ── TEMPLATE STYLE DEFINITIONS ───────────────────────────────
export const TEMPLATE_STYLES = [
  {
    id:          'dainty',
    name:        'Dainty Script',
    desc:        'Thin, graceful letterforms with elegant curves',
    brushStyle:  'nib',
    brushSize:   7,
    opacity:     1,
    previewChars: 'Abc',
  },
  {
    id:          'bold',
    name:        'Bold Block',
    desc:        'Chunky, confident strokes with strong presence',
    brushStyle:  'brush',
    brushSize:   26,
    opacity:     1,
    previewChars: 'Xyz',
  },
  {
    id:          'sketchy',
    name:        'Sketchy Rough',
    desc:        'Loose hand-drawn energy with character',
    brushStyle:  'rough',
    brushSize:   10,
    opacity:     0.92,
    previewChars: 'Mnp',
  },
];

// ── PUBLIC API ────────────────────────────────────────────────

/**
 * Get template strokes for a character in the given style.
 * Returns an array of DrawingCanvas stroke objects, or null if no template exists.
 *
 * @param {string} styleId  - 'dainty' | 'bold' | 'sketchy'
 * @param {string} char     - The character to get a template for
 */
export function getTemplate(styleId, char) {
  const style = TEMPLATE_STYLES.find(s => s.id === styleId);
  if (!style) return null;
  const paths = GLYPH_DB[char];
  if (!paths) return null;

  return paths.map(pointArr => ({
    points:  pointArr.map(([x, y]) => [x, y, 0.5]),   // [x, y, pressure]
    style:   style.brushStyle,
    size:    style.brushSize,
    opacity: style.opacity,
    eraser:  false,
  }));
}

/**
 * Get templates for all characters in a character list.
 * Returns { char: strokes[] } map — only for chars that have templates.
 *
 * @param {string}   styleId   - Template style ID
 * @param {string[]} charList  - Characters to bulk-fill
 */
export function getAllTemplates(styleId, charList) {
  const result = {};
  for (const char of charList) {
    const t = getTemplate(styleId, char);
    if (t) result[char] = t;
  }
  return result;
}

/** Returns the set of characters that have templates defined. */
export function getTemplateChars() {
  return new Set(Object.keys(GLYPH_DB));
}

/** Returns true if a template exists for the given character. */
export function hasTemplate(char) {
  return char in GLYPH_DB;
}
