// ── fontBuilder.js — Real font generation via opentype.js ──────
import opentype from 'opentype.js';

const UNITS_PER_EM = 1000;
const ASCENDER     = 800;
const DESCENDER    = -200;
const X_HEIGHT     = 500;
const CAP_HEIGHT   = 700;
const DEFAULT_ADV  = 600;

// ── SVG path utilities ─────────────────────────────────────────

// Convert SVG path string to an opentype Path, flipping Y for font coordinates
function svgPathToOTPath(svgD, canvasW, canvasH, scale) {
  const path = new opentype.Path();
  if (!svgD) return path;

  const flipY = (y) => (canvasH - y) * scale - DESCENDER;
  const scaleX = (x) => x * scale;

  const cmds = svgD.matchAll(/([MLQCZ])\s*([^MLQCZ]*)/gi);
  for (const match of cmds) {
    const cmd = match[1].toUpperCase();
    const nums = (match[2] || '').trim().split(/[\s,]+/).filter(Boolean).map(Number);

    switch (cmd) {
      case 'M': path.moveTo(scaleX(nums[0]), flipY(nums[1])); break;
      case 'L': path.lineTo(scaleX(nums[0]), flipY(nums[1])); break;
      case 'Q':
        path.quadraticCurveTo(scaleX(nums[0]), flipY(nums[1]), scaleX(nums[2]), flipY(nums[3]));
        break;
      case 'C':
        path.curveTo(
          scaleX(nums[0]), flipY(nums[1]),
          scaleX(nums[2]), flipY(nums[3]),
          scaleX(nums[4]), flipY(nums[5])
        );
        break;
      case 'Z': path.close(); break;
    }
  }
  return path;
}

// Convert canvas strokes array → SVG path string (used internally)
export function strokesToSVGPath(strokes, smooth = true) {
  if (!strokes || strokes.length === 0) return '';

  let d = '';
  for (const stroke of strokes) {
    if (!stroke || stroke.length < 2) continue;
    d += `M ${stroke[0][0]} ${stroke[0][1]} `;
    if (smooth && stroke.length > 2) {
      for (let i = 1; i < stroke.length - 1; i++) {
        const cpX = (stroke[i][0] + stroke[i - 1][0]) / 2;
        const cpY = (stroke[i][1] + stroke[i - 1][1]) / 2;
        d += `Q ${cpX} ${cpY} ${stroke[i][0]} ${stroke[i][1]} `;
      }
    } else {
      for (let i = 1; i < stroke.length; i++) {
        d += `L ${stroke[i][0]} ${stroke[i][1]} `;
      }
    }
    d += 'Z ';
  }
  return d.trim();
}

// ── Core font builder ──────────────────────────────────────────

// Build a real opentype Font object from a project
export function buildFont(project) {
  const { name, glyphs } = project;
  const canvasW = 500;
  const canvasH = 600;
  const scale   = UNITS_PER_EM / canvasH;

  // .notdef glyph (question-mark box)
  const notdefPath = new opentype.Path();
  notdefPath.moveTo(50, DESCENDER);
  notdefPath.lineTo(50, ASCENDER);
  notdefPath.lineTo(450, ASCENDER);
  notdefPath.lineTo(450, DESCENDER);
  notdefPath.close();

  const otGlyphs = [
    new opentype.Glyph({ name: '.notdef', unicode: 0,  advanceWidth: DEFAULT_ADV, path: notdefPath }),
    new opentype.Glyph({ name: 'space',   unicode: 32, advanceWidth: 300,         path: new opentype.Path() }),
  ];

  for (const [char, glyphData] of Object.entries(glyphs)) {
    if (!glyphData?.svgPath) continue;
    const code  = char.codePointAt(0);
    const otPath = svgPathToOTPath(glyphData.svgPath, canvasW, canvasH, scale);
    const adv   = glyphData.width ? glyphData.width * scale : DEFAULT_ADV;

    otGlyphs.push(new opentype.Glyph({
      name:         `glyph_${code}`,
      unicode:      code,
      advanceWidth: Math.round(adv),
      path:         otPath,
    }));
  }

  return new opentype.Font({
    familyName: name || 'Scribbleee Font',
    styleName:  'Regular',
    unitsPerEm:  UNITS_PER_EM,
    ascender:    ASCENDER,
    descender:   DESCENDER,
    xHeight:     X_HEIGHT,
    capHeight:   CAP_HEIGHT,
    glyphs:      otGlyphs,
  });
}

// ── WOFF1 binary converter ─────────────────────────────────────
// Implements the WOFF1 specification (W3C) with uncompressed tables
// (compLength == origLength, which is valid per §5 of the WOFF1 spec).

function ttfToWOFF(ttfBuffer) {
  const src   = new DataView(ttfBuffer);
  const numTables = src.getUint16(4);

  // Read TTF table directory (each entry is 16 bytes, starts at offset 12)
  const tables = [];
  for (let i = 0; i < numTables; i++) {
    const base = 12 + i * 16;
    const tag = String.fromCharCode(
      src.getUint8(base), src.getUint8(base + 1),
      src.getUint8(base + 2), src.getUint8(base + 3)
    );
    tables.push({
      tag,
      checkSum: src.getUint32(base + 4),
      offset:   src.getUint32(base + 8),
      length:   src.getUint32(base + 12),
    });
  }

  // Pad each table length to 4-byte boundary (WOFF requirement)
  const paddedTables = tables.map(t => ({
    ...t,
    paddedLen: (t.length + 3) & ~3,
  }));

  const woffHeaderSize   = 44;
  const woffTableDirSize = numTables * 20;
  const woffDataSize     = paddedTables.reduce((sum, t) => sum + t.paddedLen, 0);
  const woffTotalSize    = woffHeaderSize + woffTableDirSize + woffDataSize;

  const woffBuf   = new ArrayBuffer(woffTotalSize);
  const woff      = new DataView(woffBuf);
  const woffBytes = new Uint8Array(woffBuf);
  const ttfBytes  = new Uint8Array(ttfBuffer);

  // WOFF Header (44 bytes)
  woff.setUint32(0,  0x774F4646);          // signature: 'wOFF'
  woff.setUint32(4,  0x00010000);          // flavor: TrueType
  woff.setUint32(8,  woffTotalSize);       // length
  woff.setUint16(12, numTables);           // numTables
  woff.setUint16(14, 0);                   // reserved = 0
  woff.setUint32(16, ttfBuffer.byteLength); // totalSfntSize
  woff.setUint16(20, 1);                   // majorVersion
  woff.setUint16(22, 0);                   // minorVersion
  woff.setUint32(24, 0);                   // metaOffset
  woff.setUint32(28, 0);                   // metaLength
  woff.setUint32(32, 0);                   // metaOrigLength
  woff.setUint32(36, 0);                   // privOffset
  woff.setUint32(40, 0);                   // privLength

  // WOFF Table Directory (20 bytes per table)
  let tableDataOffset = woffHeaderSize + woffTableDirSize;
  let dirPos = woffHeaderSize;

  for (const t of paddedTables) {
    for (let i = 0; i < 4; i++) woff.setUint8(dirPos + i, t.tag.charCodeAt(i));
    woff.setUint32(dirPos + 4,  tableDataOffset); // offset in WOFF file
    woff.setUint32(dirPos + 8,  t.length);        // compLength (= origLength, not compressed)
    woff.setUint32(dirPos + 12, t.length);        // origLength
    woff.setUint32(dirPos + 16, t.checkSum);      // origCheckSum
    dirPos          += 20;
    tableDataOffset += t.paddedLen;
  }

  // Copy table data from TTF → WOFF (with 4-byte alignment padding)
  tableDataOffset = woffHeaderSize + woffTableDirSize;
  for (const t of paddedTables) {
    woffBytes.set(ttfBytes.subarray(t.offset, t.offset + t.length), tableDataOffset);
    tableDataOffset += t.paddedLen;
  }

  return woffBuf;
}

// ── Generic download helper ────────────────────────────────────

function triggerDownload(buf, filename, mimeType) {
  const blob = new Blob([buf], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ── Public download functions ─────────────────────────────────

/** Download as TrueType Font (.ttf) */
export function downloadAsTTF(project) {
  const font   = buildFont(project);
  const buf    = font.toArrayBuffer();
  const fname  = (project.name || 'scribbleee-font').replace(/[^a-z0-9_-]/gi, '_');
  triggerDownload(buf, `${fname}.ttf`, 'font/truetype');
}

/** Download as OpenType Font (.otf) — same binary as TTF for simple outline fonts */
export function downloadAsOTF(project) {
  const font  = buildFont(project);
  const buf   = font.toArrayBuffer();
  const fname = (project.name || 'scribbleee-font').replace(/[^a-z0-9_-]/gi, '_');
  triggerDownload(buf, `${fname}.otf`, 'font/otf');
}

/** Download as WOFF Web Font (.woff) — proper WOFF1 binary wrapper */
export function downloadAsWOFF(project) {
  const font    = buildFont(project);
  const ttfBuf  = font.toArrayBuffer();
  const woffBuf = ttfToWOFF(ttfBuf);
  const fname   = (project.name || 'scribbleee-font').replace(/[^a-z0-9_-]/gi, '_');
  triggerDownload(woffBuf, `${fname}.woff`, 'font/woff');
}

/**
 * Download as WOFF2 (.woff2).
 * True WOFF2 requires Brotli compression (not available in pure browser JS).
 * We output a valid WOFF1 file saved with the .woff2 extension.
 * Most modern browsers and CSS bundlers accept this for local development.
 */
export function downloadAsWOFF2(project) {
  const font    = buildFont(project);
  const ttfBuf  = font.toArrayBuffer();
  const woffBuf = ttfToWOFF(ttfBuf);
  const fname   = (project.name || 'scribbleee-font').replace(/[^a-z0-9_-]/gi, '_');
  triggerDownload(woffBuf, `${fname}.woff2`, 'font/woff2');
}

// ── Utility helpers ───────────────────────────────────────────

/** Get font ArrayBuffer (TTF) for embedding / @font-face */
export function getFontArrayBuffer(project) {
  return buildFont(project).toArrayBuffer();
}

/** Get base64 data URL for @font-face injection */
export function getFontDataURL(project) {
  const buf    = getFontArrayBuffer(project);
  const bytes  = new Uint8Array(buf);
  let binary   = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return `data:font/truetype;base64,${btoa(binary)}`;
}
