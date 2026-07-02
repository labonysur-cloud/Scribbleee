// ── DrawingCanvas.js — Perfect freehand drawing on canvas ──
import { getStroke } from 'perfect-freehand';

const CANVAS_W = 500;
const CANVAS_H = 600;

const BRUSH_STYLES = {
  pencil:   { size: 4, thinning: 0.5, smoothing: 0.5, streamline: 0.5, simulatePressure: true },
  nib:      { size: 6, thinning: 0.7, smoothing: 0.8, streamline: 0.8, simulatePressure: true },
  brush:    { size: 12, thinning: 0.4, smoothing: 0.6, streamline: 0.4, simulatePressure: true },
  rough:    { size: 5, thinning: 0.2, smoothing: 0.1, streamline: 0.1, simulatePressure: true },
  stipple:  { size: 3, thinning: 0.8, smoothing: 0.2, streamline: 0.2, simulatePressure: true },
  sketchy:  { size: 4, thinning: 0.5, smoothing: 0.3, streamline: 0.3, simulatePressure: true },
  parallel: { size: 8, thinning: 0.9, smoothing: 0.7, streamline: 0.6, simulatePressure: false },
  outline:  { size: 10, thinning: 0.95, smoothing: 0.9, streamline: 0.8, simulatePressure: true },
};

function getSvgPathFromStroke(stroke) {
  if (!stroke.length) return '';
  const d = stroke.reduce((acc, [x0, y0], i, arr) => {
    const [x1, y1] = arr[(i + 1) % arr.length];
    acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
    return acc;
  }, ['M', ...stroke[0], 'Q']);
  d.push('Z');
  return d.join(' ');
}

export function createDrawingCanvas(options = {}) {
  const {
    onStrokeComplete,
    initialStrokes = [],
    showGuides: showGuidesInit = true,
  } = options;

  let showGuides = showGuidesInit;

  let strokes = [...initialStrokes];
  let currentPoints = [];
  let isDrawing = false;
  let brushStyle = 'pencil';
  let brushSize = 10;
  let opacity = 1;
  let erasing = false;
  let tool = 'pen'; // 'pen' | 'eraser'
  let history = [JSON.parse(JSON.stringify(strokes))];
  let historyIndex = 0;

  // DOM
  const wrapper = document.createElement('div');
  wrapper.className = 'canvas-wrapper';
  wrapper.style.cssText = `
    position: relative;
    width: ${CANVAS_W}px;
    height: ${CANVAS_H}px;
    border: var(--border-lg);
    background: #ffffff;
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    flex-shrink: 0;
  `;

  // Guide canvas (static)
  const guideCanvas = document.createElement('canvas');
  guideCanvas.width = CANVAS_W;
  guideCanvas.height = CANVAS_H;
  guideCanvas.style.cssText = `position:absolute;top:0;left:0;pointer-events:none;`;

  // Drawing canvas
  const drawCanvas = document.createElement('canvas');
  drawCanvas.width = CANVAS_W;
  drawCanvas.height = CANVAS_H;
  drawCanvas.style.cssText = `position:absolute;top:0;left:0;touch-action:none;cursor:crosshair;`;
  drawCanvas.id = 'draw-canvas';

  wrapper.appendChild(guideCanvas);
  wrapper.appendChild(drawCanvas);

  const gCtx = guideCanvas.getContext('2d');
  const dCtx = drawCanvas.getContext('2d');

  // Draw guide lines
  function drawGuides() {
    gCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    if (!showGuides) return;

    // Baseline — y=450
    const baseline = 450;
    // X-height — y=250
    const xheight = 200;
    // Cap height — y=130
    const capheight = 80;
    // Descender — y=530
    const descender = 530;

    const lines = [
      { y: capheight,  color: '#e0e0e0', label: 'Cap height', dashed: false },
      { y: xheight,    color: '#e8e8e8', label: 'x-height',   dashed: true },
      { y: baseline,   color: '#c0c0c0', label: 'Baseline',    dashed: false },
      { y: descender,  color: '#e8e8e8', label: 'Descender',   dashed: true },
    ];

    lines.forEach(({ y, color, label, dashed }) => {
      gCtx.beginPath();
      gCtx.strokeStyle = color;
      gCtx.lineWidth = 1;
      if (dashed) gCtx.setLineDash([6, 4]);
      else gCtx.setLineDash([]);
      gCtx.moveTo(0, y);
      gCtx.lineTo(CANVAS_W, y);
      gCtx.stroke();

      gCtx.font = '10px Space Grotesk, sans-serif';
      gCtx.fillStyle = '#bbb';
      gCtx.setLineDash([]);
      gCtx.fillText(label, 4, y - 3);
    });

    // Left / Right bearing markers
    gCtx.fillStyle = '#ccc';
    gCtx.font = 'bold 11px Space Grotesk, sans-serif';
    gCtx.fillText('L', 10, CANVAS_H / 2);
    gCtx.fillText('R', CANVAS_W - 20, CANVAS_H / 2);

    // Center vertical guide (light)
    gCtx.beginPath();
    gCtx.strokeStyle = '#f0f0f0';
    gCtx.setLineDash([4, 6]);
    gCtx.moveTo(CANVAS_W / 2, 0);
    gCtx.lineTo(CANVAS_W / 2, CANVAS_H);
    gCtx.stroke();
    gCtx.setLineDash([]);
  }

  // Render all strokes
  function render() {
    dCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    strokes.forEach((stroke) => {
      if (!stroke.points || stroke.points.length < 2) return;
      const opts = { ...(BRUSH_STYLES[stroke.style] || BRUSH_STYLES.pencil), size: stroke.size };
      const outlined = getStroke(stroke.points, opts);
      const pathData = getSvgPathFromStroke(outlined);
      const path2d = new Path2D(pathData);

      dCtx.globalAlpha = stroke.opacity ?? 1;
      dCtx.fillStyle = stroke.eraser ? '#ffffff' : '#0d0d0d';
      dCtx.fill(path2d);
      dCtx.globalAlpha = 1;
    });

    // Current stroke
    if (currentPoints.length >= 2) {
      const opts = { ...(BRUSH_STYLES[brushStyle] || BRUSH_STYLES.pencil), size: brushSize };
      const outlined = getStroke(currentPoints, opts);
      const pathData = getSvgPathFromStroke(outlined);
      const path2d = new Path2D(pathData);
      dCtx.globalAlpha = opacity;
      dCtx.fillStyle = erasing ? '#ffffff' : '#0d0d0d';
      dCtx.fill(path2d);
      dCtx.globalAlpha = 1;
    }
  }

  function getPos(e) {
    const rect = drawCanvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const touch = e.touches?.[0] || e;
    return [
      (touch.clientX - rect.left) * scaleX,
      (touch.clientY - rect.top) * scaleY,
      e.pressure || 0.5,
    ];
  }

  function startStroke(e) {
    e.preventDefault();
    isDrawing = true;
    currentPoints = [getPos(e)];
    render();
  }

  function continueStroke(e) {
    if (!isDrawing) return;
    e.preventDefault();
    currentPoints.push(getPos(e));
    render();
  }

  function endStroke(e) {
    if (!isDrawing) return;
    isDrawing = false;

    if (currentPoints.length >= 2) {
      const newStroke = {
        points: currentPoints,
        style: brushStyle,
        size: brushSize,
        opacity,
        eraser: tool === 'eraser',
      };
      strokes.push(newStroke);

      // History
      history = history.slice(0, historyIndex + 1);
      history.push(JSON.parse(JSON.stringify(strokes)));
      historyIndex = history.length - 1;

      onStrokeComplete?.(strokes);
    }

    currentPoints = [];
    render();
  }

  // Events
  drawCanvas.addEventListener('pointerdown', startStroke);
  drawCanvas.addEventListener('pointermove', continueStroke);
  drawCanvas.addEventListener('pointerup',   endStroke);
  drawCanvas.addEventListener('pointerout',  endStroke);

  // Touch
  drawCanvas.addEventListener('touchstart',  startStroke, { passive: false });
  drawCanvas.addEventListener('touchmove',   continueStroke, { passive: false });
  drawCanvas.addEventListener('touchend',    endStroke);

  // Init
  drawGuides();
  render();

  // Public API
  const api = {
    element: wrapper,

    setBrushStyle(style) { brushStyle = style; },
    setBrushSize(size) { brushSize = size; },
    setOpacity(o) { opacity = o; },
    setTool(t) {
      tool = t;
      erasing = t === 'eraser';
      drawCanvas.style.cursor = t === 'eraser' ? 'cell' : 'crosshair';
    },

    undo() {
      if (historyIndex > 0) {
        historyIndex--;
        strokes = JSON.parse(JSON.stringify(history[historyIndex]));
        render();
        onStrokeComplete?.(strokes);
      }
    },

    redo() {
      if (historyIndex < history.length - 1) {
        historyIndex++;
        strokes = JSON.parse(JSON.stringify(history[historyIndex]));
        render();
        onStrokeComplete?.(strokes);
      }
    },

    clear() {
      strokes = [];
      currentPoints = [];
      history.push([]);
      historyIndex = history.length - 1;
      render();
      onStrokeComplete?.([]);
    },

    loadStrokes(s) {
      strokes = s ? JSON.parse(JSON.stringify(s)) : [];
      history = [JSON.parse(JSON.stringify(strokes))];
      historyIndex = 0;
      render();
    },

    getStrokes() { return strokes; },

    exportSVGPath() {
      // Combine all strokes into a simplified SVG path string for font building
      let path = '';
      strokes.forEach((stroke) => {
        if (!stroke.points || stroke.points.length < 2 || stroke.eraser) return;
        const pts = stroke.points;
        path += `M ${pts[0][0]} ${pts[0][1]} `;
        for (let i = 1; i < pts.length; i++) {
          path += `L ${pts[i][0]} ${pts[i][1]} `;
        }
        path += 'Z ';
      });
      return path.trim();
    },

    exportCanvasDataURL() {
      // Composite guides + drawing for thumbnail
      const off = document.createElement('canvas');
      off.width = CANVAS_W; off.height = CANVAS_H;
      const ctx = off.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.drawImage(guideCanvas, 0, 0);
      ctx.drawImage(drawCanvas, 0, 0);
      return off.toDataURL('image/png');
    },

    toggleGuides() {
      showGuides = !showGuides;
      drawGuides();
    },

    hasContent() { return strokes.length > 0; },
  };

  return api;
}
