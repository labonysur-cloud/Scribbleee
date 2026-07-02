// ── DrawingCanvas.js — Perfect freehand drawing & ready-made symbols on canvas ──
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

// ── Ready-Made Shape Generator ──────────────────────────────────────────────
export function generateShapePoints(shapeType, cx, cy, radius) {
  const pts = [];

  if (shapeType === 'heart') {
    const n = 64;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * Math.PI * 2;
      const x = cx + radius * (16 * Math.pow(Math.sin(t), 3)) / 16;
      const y = cy - radius * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) / 16;
      pts.push([x, y, 0.5]);
    }
  } else if (shapeType === 'star') {
    const prongs = 5;
    for (let i = 0; i <= prongs * 2; i++) {
      const t = (i / (prongs * 2)) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? radius : radius * 0.42;
      pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t), 0.5]);
    }
  } else if (shapeType === 'sparkle') {
    const prongs = 4;
    for (let i = 0; i <= prongs * 2; i++) {
      const t = (i / (prongs * 2)) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? radius : radius * 0.18;
      pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t), 0.5]);
    }
  } else if (shapeType === 'circle') {
    const n = 50;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * Math.PI * 2;
      pts.push([cx + radius * Math.cos(t), cy + radius * Math.sin(t), 0.5]);
    }
  } else if (shapeType === 'flower') {
    const n = 64;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * Math.PI * 2;
      const r = radius * (0.65 + 0.35 * Math.cos(5 * t));
      pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t), 0.5]);
    }
  } else if (shapeType === 'cloud') {
    const n = 64;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * Math.PI * 2;
      const r = radius * (0.75 + 0.25 * Math.abs(Math.sin(3 * t)));
      pts.push([cx + r * 1.3 * Math.cos(t), cy + r * 0.8 * Math.sin(t), 0.5]);
    }
  } else if (shapeType === 'crown') {
    const w = radius * 1.1;
    const h = radius * 0.8;
    pts.push(
      [cx - w, cy + h * 0.6, 0.5],
      [cx - w * 0.9, cy - h * 0.5, 0.5],
      [cx - w * 0.4, cy + h * 0.1, 0.5],
      [cx, cy - h * 0.8, 0.5],
      [cx + w * 0.4, cy + h * 0.1, 0.5],
      [cx + w * 0.9, cy - h * 0.5, 0.5],
      [cx + w, cy + h * 0.6, 0.5],
      [cx - w, cy + h * 0.6, 0.5]
    );
  } else if (shapeType === 'bow') {
    const n = 64;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * Math.PI * 2;
      const denom = 1 + Math.sin(t) * Math.sin(t);
      const x = cx + radius * 1.3 * Math.cos(t) / denom;
      const y = cy + radius * 0.8 * Math.sin(t) * Math.cos(t) / denom;
      pts.push([x, y, 0.5]);
    }
  } else if (shapeType === 'moon') {
    const n = 30;
    for (let i = 0; i <= n; i++) {
      const t = -Math.PI/2 + (i / n) * Math.PI;
      pts.push([cx + radius * Math.cos(t), cy + radius * Math.sin(t), 0.5]);
    }
    for (let i = n; i >= 0; i--) {
      const t = Math.PI/2 - (i / n) * Math.PI;
      pts.push([cx + radius * 0.55 * Math.cos(t) + radius * 0.35, cy + radius * Math.sin(t), 0.5]);
    }
  } else if (shapeType === 'bolt') {
    const w = radius * 0.55;
    const h = radius * 1.05;
    pts.push(
      [cx + w * 0.2, cy - h, 0.5],
      [cx - w, cy + h * 0.1, 0.5],
      [cx - w * 0.1, cy + h * 0.1, 0.5],
      [cx - w * 0.3, cy + h, 0.5],
      [cx + w, cy - h * 0.1, 0.5],
      [cx + w * 0.1, cy - h * 0.1, 0.5],
      [cx + w * 0.2, cy - h, 0.5]
    );
  }
  return pts;
}

export function createDrawingCanvas(options = {}) {
  const {
    onStrokeComplete,
    initialStrokes = [],
    showGuides: showGuidesInit = true,
    templateChar: initialTemplateChar = 'A',
    templateStyle: initialTemplateStyle = 'sans',
    templateOpacity: initialTemplateOpacity = 0.25,
  } = options;

  let showGuides = showGuidesInit;
  let templateChar = initialTemplateChar;
  let templateStyle = initialTemplateStyle;
  let templateOpacity = initialTemplateOpacity;

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

  // Stamp mode
  let stampMode = false;
  let stampShapeType = 'heart';
  let stampOptions = { radius: 80, thickness: 8, fillMode: 'outline' };

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

  // Draw guide lines & template ghost character
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

    gCtx.lineWidth = 1;

    // Cap height line
    gCtx.beginPath();
    gCtx.strokeStyle = '#e0e0e0';
    gCtx.setLineDash([6, 6]);
    gCtx.moveTo(0, capheight);
    gCtx.lineTo(CANVAS_W, capheight);
    gCtx.stroke();

    // X-height line
    gCtx.beginPath();
    gCtx.strokeStyle = '#d0d0d0';
    gCtx.setLineDash([4, 4]);
    gCtx.moveTo(0, xheight);
    gCtx.lineTo(CANVAS_W, xheight);
    gCtx.stroke();

    // Baseline (heavy pink)
    gCtx.beginPath();
    gCtx.strokeStyle = '#ff69b4';
    gCtx.lineWidth = 2;
    gCtx.setLineDash([]);
    gCtx.moveTo(0, baseline);
    gCtx.lineTo(CANVAS_W, baseline);
    gCtx.stroke();

    // Descender line
    gCtx.beginPath();
    gCtx.strokeStyle = '#e0e0e0';
    gCtx.lineWidth = 1;
    gCtx.setLineDash([6, 6]);
    gCtx.moveTo(0, descender);
    gCtx.lineTo(CANVAS_W, descender);
    gCtx.stroke();

    // Labels
    gCtx.font = '11px var(--font-doodle)';
    gCtx.fillStyle = '#ff69b4';
    gCtx.fillText('baseline', 10, baseline - 6);
    gCtx.fillStyle = '#a0a0a0';
    gCtx.fillText('x-height', 10, xheight - 6);
    gCtx.fillText('cap-height', 10, capheight - 6);
    gCtx.fillText('descender', 10, descender - 6);

    // Render Crisp Centered Template Character
    if (templateChar && templateOpacity > 0) {
      gCtx.save();
      gCtx.globalAlpha = templateOpacity;
      gCtx.fillStyle = '#000000';
      gCtx.textAlign = 'center';
      gCtx.textBaseline = 'alphabetic';

      let fontStyleStr = 'bold 360px sans-serif';
      if (templateStyle === 'serif') fontStyleStr = 'bold 360px Georgia, serif';
      if (templateStyle === 'mono')  fontStyleStr = 'bold 360px monospace';
      if (templateStyle === 'cursive') fontStyleStr = 'italic bold 360px "Comic Sans MS", cursive';
      if (templateStyle === 'bubbly')  fontStyleStr = '900 370px "Fredoka One", cursive, sans-serif';

      gCtx.font = fontStyleStr;
      gCtx.fillText(templateChar, CANVAS_W / 2, baseline);
      gCtx.restore();
    }

    // Side margins
    gCtx.beginPath();
    gCtx.strokeStyle = '#f0f0f0';
    gCtx.setLineDash([]);
    gCtx.moveTo(40, 0);
    gCtx.lineTo(40, CANVAS_H);
    gCtx.moveTo(CANVAS_W - 40, 0);
    gCtx.lineTo(CANVAS_W - 40, CANVAS_H);
    gCtx.stroke();

    gCtx.font = '10px var(--font-doodle)';
    gCtx.fillStyle = '#c0c0c0';
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

      if (stroke.isPolygon && stroke.fillMode === 'solid') {
        let pathData = '';
        stroke.points.forEach(([x, y], i) => {
          pathData += (i === 0 ? `M ${x} ${y} ` : `L ${x} ${y} `);
        });
        pathData += 'Z';
        const path2d = new Path2D(pathData);
        dCtx.globalAlpha = stroke.opacity ?? 1;
        dCtx.fillStyle = stroke.eraser ? '#ffffff' : '#0d0d0d';
        dCtx.fill(path2d);
        dCtx.globalAlpha = 1;
      } else {
        const opts = { ...(BRUSH_STYLES[stroke.style] || BRUSH_STYLES.pencil), size: stroke.size };
        const outlined = getStroke(stroke.points, opts);
        const pathData = getSvgPathFromStroke(outlined);
        const path2d = new Path2D(pathData);

        dCtx.globalAlpha = stroke.opacity ?? 1;
        dCtx.fillStyle = stroke.eraser ? '#ffffff' : '#0d0d0d';
        dCtx.fill(path2d);
        dCtx.globalAlpha = 1;
      }
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
    if (stampMode) {
      const [x, y] = getPos(e);
      api.addShape(stampShapeType, { ...stampOptions, cx: x, cy: y });
      return;
    }
    isDrawing = true;
    currentPoints = [getPos(e)];
    render();
  }

  function continueStroke(e) {
    if (!isDrawing || stampMode) return;
    e.preventDefault();
    currentPoints.push(getPos(e));
    render();
  }

  function endStroke(e) {
    if (!isDrawing || stampMode) return;
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

    setBrushStyle(style) {
      brushStyle = style;
      stampMode = false;
      drawCanvas.style.cursor = tool === 'eraser' ? 'cell' : 'crosshair';
    },
    setBrushSize(size) { brushSize = size; },
    setOpacity(o) { opacity = o; },
    setTool(t) {
      tool = t;
      erasing = t === 'eraser';
      stampMode = false;
      drawCanvas.style.cursor = t === 'eraser' ? 'cell' : 'crosshair';
    },

    addShape(shapeType, options = {}) {
      const cx = options.cx ?? CANVAS_W / 2;
      const cy = options.cy ?? CANVAS_H / 2;
      const radius = options.radius ?? 80;
      const fillMode = options.fillMode ?? 'outline';
      const thickness = options.thickness ?? 8;

      const points = generateShapePoints(shapeType, cx, cy, radius);
      if (!points || points.length < 3) return;

      const newStroke = {
        points,
        style: 'pencil',
        size: thickness,
        opacity: 1,
        eraser: false,
        isPolygon: true,
        fillMode,
      };
      strokes.push(newStroke);
      history = history.slice(0, historyIndex + 1);
      history.push(JSON.parse(JSON.stringify(strokes)));
      historyIndex = history.length - 1;
      render();
      onStrokeComplete?.(strokes);
    },

    setStampMode(active, shapeType = 'heart', options = {}) {
      stampMode = !!active;
      if (stampMode) {
        stampShapeType = shapeType;
        stampOptions = options;
        drawCanvas.style.cursor = 'copy';
      } else {
        drawCanvas.style.cursor = tool === 'eraser' ? 'cell' : 'crosshair';
      }
    },

    isStampMode() { return stampMode; },

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
        if (!stroke.points || stroke.points.length < 2) return;
        if (stroke.eraser) {
          // Reversed point order for eraser strokes creates clean compound cutouts
          const pts = [...stroke.points].reverse();
          path += `M ${pts[0][0]} ${pts[0][1]} `;
          for (let i = 1; i < pts.length; i++) {
            path += `L ${pts[i][0]} ${pts[i][1]} `;
          }
          path += 'Z ';
        } else if (stroke.isPolygon && stroke.fillMode === 'solid') {
          const pts = stroke.points;
          path += `M ${pts[0][0]} ${pts[0][1]} `;
          for (let i = 1; i < pts.length; i++) {
            path += `L ${pts[i][0]} ${pts[i][1]} `;
          }
          path += 'Z ';
        } else {
          // Export exact brush outline contour
          const opts = { ...(BRUSH_STYLES[stroke.style] || BRUSH_STYLES.pencil), size: stroke.size };
          const outlined = getStroke(stroke.points, opts);
          if (outlined && outlined.length >= 2) {
            path += `M ${outlined[0][0]} ${outlined[0][1]} `;
            for (let i = 1; i < outlined.length; i++) {
              path += `L ${outlined[i][0]} ${outlined[i][1]} `;
            }
            path += 'Z ';
          }
        }
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

    setShowGuides(val) {
      showGuides = !!val;
      drawGuides();
      render();
    },

    setTemplateOverlay(char, style = 'sans', alpha = 0.25) {
      templateChar = char;
      templateStyle = style;
      templateOpacity = alpha;
      drawGuides();
      render();
    },

    hasContent() { return strokes.length > 0; },
  };

  return api;
}
