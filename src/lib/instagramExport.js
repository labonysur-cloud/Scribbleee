// ── instagramExport.js — Canvas animation → MP4 export ────

const STORY_W = 1080;
const STORY_H = 1920;

// Animation effect renderers
const EFFECTS = {
  typewriter: renderTypewriter,
  bounce:     renderBounce,
  wave:       renderWave,
  fade:       renderFade,
  shake:      renderShake,
  zoom:       renderZoom,
};

function setupCanvas(canvas) {
  canvas.width  = STORY_W;
  canvas.height = STORY_H;
  const ctx = canvas.getContext('2d');
  return ctx;
}

function drawBackground(ctx, bgColor = '#fafafa') {
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, STORY_W, STORY_H);

  // Decorative border
  ctx.strokeStyle = '#0d0d0d';
  ctx.lineWidth = 12;
  ctx.strokeRect(24, 24, STORY_W - 48, STORY_H - 48);
}

function drawDecoration(ctx, frame, totalFrames) {
  // Animated doodle stars
  const stars = ['★', '✦', '◆', '○', '✿'];
  const positions = [
    [120, 200], [900, 280], [200, 1700], [850, 1650],
    [60, 960], [1020, 940], [540, 280], [540, 1700],
  ];
  ctx.font = '60px serif';
  ctx.fillStyle = '#0d0d0d';
  positions.forEach(([x, y], i) => {
    const spin = (frame / totalFrames) * Math.PI * 2 + i;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(spin);
    ctx.fillText(stars[i % stars.length], -20, 20);
    ctx.restore();
  });
}

async function renderTypewriter(ctx, text, font, frame, totalFrames, options) {
  const chars = text.split('');
  const charsToShow = Math.ceil((frame / totalFrames) * chars.length);
  const partial = chars.slice(0, charsToShow).join('');

  drawBackground(ctx, options.bgColor);
  drawDecoration(ctx, frame, totalFrames);

  ctx.font = `bold ${options.fontSize}px '${font}', sans-serif`;
  ctx.fillStyle = options.textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  wrapText(ctx, partial, STORY_W / 2, STORY_H / 2, STORY_W - 160, options.fontSize * 1.4);
}

async function renderBounce(ctx, text, font, frame, totalFrames, options) {
  drawBackground(ctx, options.bgColor);
  drawDecoration(ctx, frame, totalFrames);

  const chars = text.split('');
  const fontSize = options.fontSize;
  const totalWidth = chars.length * fontSize * 0.7;
  const startX = (STORY_W - totalWidth) / 2;
  const baseY = STORY_H / 2;

  ctx.font = `bold ${fontSize}px '${font}', sans-serif`;
  ctx.fillStyle = options.textColor;
  ctx.textAlign  = 'center';
  ctx.textBaseline = 'middle';

  chars.forEach((char, i) => {
    const phase = (frame / totalFrames) * Math.PI * 2 + i * 0.5;
    const yOff = Math.sin(phase) * 30;
    const x = startX + i * fontSize * 0.7 + fontSize * 0.35;
    ctx.fillText(char, x, baseY + yOff);
  });
}

async function renderWave(ctx, text, font, frame, totalFrames, options) {
  drawBackground(ctx, options.bgColor);
  drawDecoration(ctx, frame, totalFrames);

  const chars = text.split('');
  const fontSize = options.fontSize;
  const totalWidth = chars.length * fontSize * 0.7;
  const startX = (STORY_W - totalWidth) / 2;
  const baseY = STORY_H / 2;

  ctx.font = `bold ${fontSize}px '${font}', sans-serif`;
  ctx.fillStyle = options.textColor;
  ctx.textAlign  = 'center';
  ctx.textBaseline = 'middle';

  chars.forEach((char, i) => {
    const phase = (frame / totalFrames) * Math.PI * 4 + i * 0.8;
    const yOff  = Math.sin(phase) * 40;
    const scale = 0.85 + Math.sin(phase + 1) * 0.15;
    const x = startX + i * fontSize * 0.7 + fontSize * 0.35;

    ctx.save();
    ctx.translate(x, baseY + yOff);
    ctx.scale(scale, scale);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });
}

async function renderFade(ctx, text, font, frame, totalFrames, options) {
  drawBackground(ctx, options.bgColor);
  drawDecoration(ctx, frame, totalFrames);

  const alpha = 0.5 + Math.sin((frame / totalFrames) * Math.PI * 2) * 0.5;

  ctx.globalAlpha = alpha;
  ctx.font = `bold ${options.fontSize}px '${font}', sans-serif`;
  ctx.fillStyle = options.textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  wrapText(ctx, text, STORY_W / 2, STORY_H / 2, STORY_W - 160, options.fontSize * 1.4);
  ctx.globalAlpha = 1;
}

async function renderShake(ctx, text, font, frame, totalFrames, options) {
  drawBackground(ctx, options.bgColor);
  drawDecoration(ctx, frame, totalFrames);

  const shake = Math.sin((frame / totalFrames) * Math.PI * 8) * 8;

  ctx.save();
  ctx.translate(shake, 0);
  ctx.font = `bold ${options.fontSize}px '${font}', sans-serif`;
  ctx.fillStyle = options.textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  wrapText(ctx, text, STORY_W / 2, STORY_H / 2, STORY_W - 160, options.fontSize * 1.4);
  ctx.restore();
}

async function renderZoom(ctx, text, font, frame, totalFrames, options) {
  drawBackground(ctx, options.bgColor);
  drawDecoration(ctx, frame, totalFrames);

  const scale = 0.7 + Math.sin((frame / totalFrames) * Math.PI * 2) * 0.3;

  ctx.save();
  ctx.translate(STORY_W / 2, STORY_H / 2);
  ctx.scale(scale, scale);
  ctx.font = `bold ${options.fontSize}px '${font}', sans-serif`;
  ctx.fillStyle = options.textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  const lines = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  const totalHeight = lines.length * lineHeight;
  const startY = y - totalHeight / 2 + lineHeight / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, x, startY + i * lineHeight);
  });
}

// Main export function
export async function exportInstagramVideo(options) {
  const {
    text = 'Scribbleee',
    fontFamily = 'Space Grotesk',
    effect = 'bounce',
    textColor = '#0d0d0d',
    bgColor = '#fafafa',
    fontSize = 160,
    duration = 3,          // seconds
    fps = 24,
    onProgress,
  } = options;

  const canvas = document.createElement('canvas');
  const ctx = setupCanvas(canvas);
  const totalFrames = duration * fps;
  const renderer = EFFECTS[effect] || renderBounce;

  const chunks = [];
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9' : 'video/webm',
    videoBitsPerSecond: 8_000_000,
  });

  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };

    recorder.onerror = reject;
    recorder.start();

    let frame = 0;
    const renderFrame = async () => {
      if (frame >= totalFrames) {
        recorder.stop();
        return;
      }

      await renderer(ctx, text, fontFamily, frame, totalFrames, {
        textColor, bgColor, fontSize,
      });

      onProgress?.(frame / totalFrames);
      frame++;
      setTimeout(renderFrame, 1000 / fps);
    };

    renderFrame();
  });
}

export function downloadVideoBlob(blob, filename = 'scribbleee-story.webm') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
