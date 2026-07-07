// ── instagramExport.js — Canvas animation → Video/GIF export ──────────────
// Renders your hand-drawn Scribbleee font onto a 1080×1920 Instagram Story canvas
// with animated effects, then records it via MediaRecorder as a WebM video.

const STORY_W = 1080;
const STORY_H = 1920;

// ── Background + Decoration ───────────────────────────────────────────────────

function drawBackground(ctx, bgColor = '#fafafa') {
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, STORY_W, STORY_H);

  // Decorative neo-brutalist border
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 16;
  ctx.strokeRect(28, 28, STORY_W - 56, STORY_H - 56);
}

function drawDecoration(ctx, frame, totalFrames) {
  const stars     = ['★', '✦', '◆', '○', '✿', '♡'];
  const positions = [
    [110, 190], [940, 270], [190, 1720], [880, 1660],
    [55,  960], [1025, 940], [540, 260], [540, 1710],
  ];
  ctx.font      = '64px serif';
  ctx.fillStyle = 'rgba(0,0,0,0.18)';

  positions.forEach(([x, y], i) => {
    const spin = (frame / totalFrames) * Math.PI * 2 + i;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(spin);
    ctx.fillText(stars[i % stars.length], -24, 24);
    ctx.restore();
  });

  // Scribbleee watermark at bottom
  ctx.font      = 'bold 36px sans-serif';
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.textAlign = 'center';
  ctx.fillText('made with scribbleee.vercel.app', STORY_W / 2, STORY_H - 60);
}

// ── Text layout helper ────────────────────────────────────────────────────────

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  // Split on explicit newlines first, then wrap each line by word
  const paragraphs = text.split('\n');
  const lines = [];

  for (const para of paragraphs) {
    const words = para.split(' ');
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
  }

  const totalHeight = lines.length * lineHeight;
  const startY      = y - totalHeight / 2 + lineHeight / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, x, startY + i * lineHeight);
  });

  return lines.length;
}

// ── Animation Effects ─────────────────────────────────────────────────────────

function renderTypewriter(ctx, text, font, frame, totalFrames, opts) {
  const chars       = [...text]; // Unicode-safe split
  const charsToShow = Math.ceil((frame / totalFrames) * chars.length);
  const partial     = chars.slice(0, charsToShow).join('');

  drawBackground(ctx, opts.bgColor);
  drawDecoration(ctx, frame, totalFrames);

  // Blinking cursor
  const showCursor = Math.floor((frame / totalFrames) * chars.length) < chars.length
    || (Math.floor(frame / 6) % 2 === 0);

  ctx.font         = `bold ${opts.fontSize}px '${font}', serif`;
  ctx.fillStyle    = opts.textColor;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  wrapText(ctx, partial + (showCursor ? '|' : ''), STORY_W / 2, STORY_H / 2, STORY_W - 180, opts.fontSize * 1.45);
}

function renderBounce(ctx, text, font, frame, totalFrames, opts) {
  drawBackground(ctx, opts.bgColor);
  drawDecoration(ctx, frame, totalFrames);

  const chars    = [...text];
  const fontSize = opts.fontSize;
  ctx.font       = `bold ${fontSize}px '${font}', serif`;
  ctx.fillStyle  = opts.textColor;

  // Measure actual total width for centering
  const widths   = chars.map(c => ctx.measureText(c).width);
  const totalW   = widths.reduce((a, b) => a + b, 0) + (chars.length - 1) * 8;
  let curX       = (STORY_W - totalW) / 2;
  const baseY    = STORY_H / 2;

  ctx.textAlign    = 'left';
  ctx.textBaseline = 'middle';

  chars.forEach((char, i) => {
    const phase = (frame / totalFrames) * Math.PI * 2 + i * 0.55;
    const yOff  = Math.sin(phase) * 38;
    ctx.fillText(char, curX, baseY + yOff);
    curX += widths[i] + 8;
  });
}

function renderWave(ctx, text, font, frame, totalFrames, opts) {
  drawBackground(ctx, opts.bgColor);
  drawDecoration(ctx, frame, totalFrames);

  const chars    = [...text];
  const fontSize = opts.fontSize;
  ctx.font       = `bold ${fontSize}px '${font}', serif`;
  ctx.fillStyle  = opts.textColor;

  const widths = chars.map(c => ctx.measureText(c).width);
  const totalW = widths.reduce((a, b) => a + b, 0) + (chars.length - 1) * 8;
  let curX     = (STORY_W - totalW) / 2;
  const baseY  = STORY_H / 2;

  ctx.textAlign    = 'left';
  ctx.textBaseline = 'middle';

  chars.forEach((char, i) => {
    const phase = (frame / totalFrames) * Math.PI * 4 + i * 0.8;
    const yOff  = Math.sin(phase) * 48;
    const scale = 0.88 + Math.sin(phase + 1.2) * 0.12;
    ctx.save();
    ctx.translate(curX + widths[i] / 2, baseY + yOff);
    ctx.scale(scale, scale);
    ctx.fillText(char, -widths[i] / 2, 0);
    ctx.restore();
    curX += widths[i] + 8;
  });
}

function renderFade(ctx, text, font, frame, totalFrames, opts) {
  drawBackground(ctx, opts.bgColor);
  drawDecoration(ctx, frame, totalFrames);

  const alpha      = 0.15 + Math.abs(Math.sin((frame / totalFrames) * Math.PI * 2)) * 0.85;
  ctx.globalAlpha  = alpha;
  ctx.font         = `bold ${opts.fontSize}px '${font}', serif`;
  ctx.fillStyle    = opts.textColor;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  wrapText(ctx, text, STORY_W / 2, STORY_H / 2, STORY_W - 180, opts.fontSize * 1.45);
  ctx.globalAlpha  = 1;
}

function renderShake(ctx, text, font, frame, totalFrames, opts) {
  drawBackground(ctx, opts.bgColor);
  drawDecoration(ctx, frame, totalFrames);

  const shakeX = Math.sin((frame / totalFrames) * Math.PI * 10) * 12;
  const shakeY = Math.cos((frame / totalFrames) * Math.PI * 7)  *  6;

  ctx.save();
  ctx.translate(shakeX, shakeY);
  ctx.font         = `bold ${opts.fontSize}px '${font}', serif`;
  ctx.fillStyle    = opts.textColor;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  wrapText(ctx, text, STORY_W / 2, STORY_H / 2, STORY_W - 180, opts.fontSize * 1.45);
  ctx.restore();
}

function renderZoom(ctx, text, font, frame, totalFrames, opts) {
  drawBackground(ctx, opts.bgColor);
  drawDecoration(ctx, frame, totalFrames);

  const scale      = 0.65 + Math.abs(Math.sin((frame / totalFrames) * Math.PI * 2)) * 0.45;
  ctx.save();
  ctx.translate(STORY_W / 2, STORY_H / 2);
  ctx.scale(scale, scale);
  ctx.font         = `bold ${opts.fontSize}px '${font}', serif`;
  ctx.fillStyle    = opts.textColor;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  wrapText(ctx, text, 0, 0, (STORY_W - 180) / scale, opts.fontSize * 1.45);
  ctx.restore();
}

function renderGlitter(ctx, text, font, frame, totalFrames, opts) {
  drawBackground(ctx, opts.bgColor);
  drawDecoration(ctx, frame, totalFrames);

  // Draw text normally in center
  ctx.font         = `bold ${opts.fontSize}px '${font}', serif`;
  ctx.fillStyle    = opts.textColor;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  wrapText(ctx, text, STORY_W / 2, STORY_H / 2, STORY_W - 180, opts.fontSize * 1.45);

  // Overlay sparkles at random (seeded by frame) positions on the text
  const rng = (seed) => Math.abs(Math.sin(seed * 9301 + frame * 49297)) % 1;
  for (let i = 0; i < 18; i++) {
    const x     = 160 + rng(i * 1.1) * (STORY_W - 320);
    const y     = STORY_H / 2 - 200 + rng(i * 2.3) * 400;
    const size  = 8 + rng(i * 3.7) * 24;
    const alpha = 0.4 + rng(i * 5.1 + frame * 0.1) * 0.6;
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = '#fff700';
    ctx.font        = `${size}px serif`;
    ctx.textAlign   = 'center';
    ctx.fillText('✦', x, y);
  }
  ctx.globalAlpha = 1;
}

const EFFECTS = {
  bounce:     renderBounce,
  wave:       renderWave,
  typewriter: renderTypewriter,
  fade:       renderFade,
  shake:      renderShake,
  zoom:       renderZoom,
  glitter:    renderGlitter,
};

// ── Font loader — injects the hand-drawn font into the canvas context ─────────
// Canvas ignores CSS @font-face, so we must use FontFace API explicitly.

async function loadFontForCanvas(fontFamily, fontDataUrl) {
  if (!fontDataUrl) return fontFamily; // no custom font, use whatever CSS provides

  try {
    // Check if already loaded to avoid duplicate FontFace registrations
    const alreadyLoaded = [...document.fonts].some(f => f.family === fontFamily && f.status === 'loaded');
    if (alreadyLoaded) return fontFamily;

    const ff = new FontFace(fontFamily, `url(${fontDataUrl})`);
    const loaded = await ff.load();
    document.fonts.add(loaded);
    return fontFamily;
  } catch (err) {
    console.warn('[instagramExport] Could not load custom font for canvas:', err);
    return fontFamily; // fall back gracefully
  }
}

// ── Main export function ──────────────────────────────────────────────────────

export async function exportInstagramVideo(options) {
  const {
    text        = 'Scribbleee',
    fontFamily  = 'sans-serif',
    fontDataUrl = null,          // base64 data URL of the TTF — injected from studio
    effect      = 'bounce',
    textColor   = '#0d0d0d',
    bgColor     = '#fafafa',
    fontSize    = 140,
    duration    = 3,
    fps         = 24,
    onProgress,
    onStatus,
  } = options;

  // ── Step 1: Load the hand-drawn font ──────────────────────────────
  onStatus?.('Loading your font…');
  const resolvedFont = await loadFontForCanvas(fontFamily, fontDataUrl);

  // ── Step 2: Check MediaRecorder support ───────────────────────────
  const mimeTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  const supportedMime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m));
  if (!supportedMime) {
    throw new Error(
      'Your browser does not support video recording (MediaRecorder). ' +
      'Please use Chrome or Firefox on desktop to export videos.'
    );
  }

  // ── Step 3: Setup canvas + recorder ──────────────────────────────
  onStatus?.('Setting up canvas…');
  const canvas      = document.createElement('canvas');
  canvas.width      = STORY_W;
  canvas.height     = STORY_H;
  const ctx         = canvas.getContext('2d');
  const totalFrames = Math.ceil(duration * fps);
  const renderer    = EFFECTS[effect] || renderBounce;
  const renderOpts  = { textColor, bgColor, fontSize };

  const chunks  = [];
  const stream  = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType:          supportedMime,
    videoBitsPerSecond: 8_000_000,
  });

  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  // ── Step 4: Render frames ─────────────────────────────────────────
  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: supportedMime.split(';')[0] });
      resolve(blob);
    };
    recorder.onerror = (e) => reject(new Error('Recording failed: ' + e.message));

    recorder.start(100); // collect data every 100ms for smoother blob assembly
    onStatus?.('Rendering frames…');

    let frame = 0;

    const renderFrame = () => {
      if (frame >= totalFrames) {
        // Draw the final frame cleanly before stopping
        renderer(ctx, text, resolvedFont, totalFrames - 1, totalFrames, renderOpts);
        setTimeout(() => recorder.stop(), 200); // give MediaRecorder time to flush
        onProgress?.(1);
        return;
      }

      try {
        renderer(ctx, text, resolvedFont, frame, totalFrames, renderOpts);
      } catch (err) {
        recorder.stop();
        reject(err);
        return;
      }

      onProgress?.(frame / totalFrames);
      frame++;
      // Use requestAnimationFrame for smoother rendering when tab is active,
      // fall back to setTimeout for background tabs
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(renderFrame);
      } else {
        setTimeout(renderFrame, 1000 / fps);
      }
    };

    renderFrame();
  });
}

// ── Download helper ───────────────────────────────────────────────────────────

export function downloadVideoBlob(blob, filename = 'scribbleee-story.webm') {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

// ── Live preview helper (single frame render into a given canvas) ─────────────

export async function renderPreviewFrame(canvas, options) {
  const {
    text        = 'Aa Bb',
    fontFamily  = 'sans-serif',
    fontDataUrl = null,
    effect      = 'bounce',
    textColor   = '#0d0d0d',
    bgColor     = '#fafafa',
    fontSize    = 140,
    frameRatio  = 0.35,       // which moment in the animation to preview (0–1)
  } = options;

  canvas.width  = STORY_W;
  canvas.height = STORY_H;
  const ctx     = canvas.getContext('2d');

  const resolvedFont = await loadFontForCanvas(fontFamily, fontDataUrl);
  const renderer     = EFFECTS[effect] || renderBounce;
  const totalFrames  = 72;
  const frame        = Math.floor(frameRatio * totalFrames);

  renderer(ctx, text, resolvedFont, frame, totalFrames, { textColor, bgColor, fontSize });
}
