// ── ToolPanel.js — Left brush / tool panel ────────────────────

const BRUSH_ICONS = {
  pencil:   'Pencil',
  nib:      'Nib',
  brush:    'Brush',
  rough:    'Rough',
  stipple:  'Stipple',
  sketchy:  'Sketchy',
  parallel: 'Parallel',
  outline:  'Outline',
};

export function createToolPanel(options = {}) {
  const { onChange } = options;

  let state = {
    tool:            'pen',
    brushStyle:      'pencil',
    brushSize:       10,
    smoothing:       5,
    opacity:         100,
    showGuides:      true,
    color:           '#0d0d0d',
    zoom:            100,
    templateStyle:   'sans',
    templateOpacity: 25,
  };

  const panel = document.createElement('div');
  panel.className = 'tool-panel';
  panel.style.cssText = `
    width: 195px;
    flex-shrink: 0;
    overflow-y: auto;
    border-right: var(--border);
    background: var(--white);
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    scrollbar-width: thin;
  `;

  function emit() { onChange?.(state); }

  function buildSection(title, content) {
    const wrap  = document.createElement('div');
    const label = document.createElement('div');
    label.style.cssText = `
      font-family: var(--font-doodle);
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--gray-400);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: var(--space-2);
    `;
    label.textContent = title;
    wrap.appendChild(label);
    wrap.appendChild(content);
    return wrap;
  }

  // ── Tool selector (pen / eraser) ──────────────────────────
  const toolGrid = document.createElement('div');
  toolGrid.style.cssText = `display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);`;
  toolGrid.innerHTML = `
    <button class="btn btn--sm tool-btn btn--primary" id="tool-pen"
      style="font-family:var(--font-doodle);font-size:0.78rem;">Draw</button>
    <button class="btn btn--sm tool-btn" id="tool-eraser"
      style="font-family:var(--font-doodle);font-size:0.78rem;">Erase</button>
  `;
  panel.appendChild(buildSection('Tool', toolGrid));

  // ── Brush preview + size ───────────────────────────────────
  const sizeSection = document.createElement('div');
  sizeSection.innerHTML = `
    <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-2);">
      <div id="brush-preview" style="
        border-radius:50%;
        background:var(--black);
        flex-shrink:0;
        transition: width 0.1s, height 0.1s;
        width:${state.brushSize}px;
        height:${state.brushSize}px;
        min-width:4px; min-height:4px;
        max-width:40px; max-height:40px;
      "></div>
      <span style="font-family:var(--font-doodle);font-size:0.82rem;" id="size-val">${state.brushSize}px</span>
    </div>
    <input type="range" class="slider" id="slider-size" min="2" max="40" step="1" value="${state.brushSize}" />
  `;
  panel.appendChild(buildSection('Brush Size', sizeSection));

  // ── Brush style grid ──────────────────────────────────────
  const styleGrid = document.createElement('div');
  styleGrid.style.cssText = `display:grid;grid-template-columns:1fr 1fr;gap:var(--space-1);`;
  Object.entries(BRUSH_ICONS).forEach(([name, label]) => {
    const btn = document.createElement('button');
    const isActive = name === state.brushStyle;
    btn.className  = `btn brush-style-btn ${isActive ? 'btn--primary' : ''}`;
    btn.dataset.style = name;
    btn.style.cssText = `font-family:var(--font-doodle);font-size:0.72rem;padding:4px 6px;`;
    btn.textContent   = label;
    styleGrid.appendChild(btn);
  });
  panel.appendChild(buildSection('Brush Style', styleGrid));

  // ── Stroke color ──────────────────────────────────────────
  const colorSection = document.createElement('div');
  colorSection.style.cssText = `display:flex;align-items:center;gap:var(--space-3);`;
  colorSection.innerHTML = `
    <input type="color" id="stroke-color" value="${state.color}"
      style="width:36px;height:36px;border:var(--border);cursor:pointer;background:none;flex-shrink:0;" />
    <input class="input" id="color-hex-input" value="${state.color}"
      style="font-family:var(--font-doodle);font-size:0.8rem;max-width:90px;padding:4px 8px;" />
  `;
  panel.appendChild(buildSection('Color', colorSection));

  // ── Smoothing ─────────────────────────────────────────────
  const smoothSection = document.createElement('div');
  smoothSection.innerHTML = `
    <div style="font-family:var(--font-doodle);font-size:0.82rem;margin-bottom:var(--space-2);" id="smooth-val">
      ${state.smoothing}
    </div>
    <input type="range" class="slider" id="slider-smooth" min="0" max="10" step="1" value="${state.smoothing}" />
  `;
  panel.appendChild(buildSection('Smoothing', smoothSection));

  // ── Opacity ───────────────────────────────────────────────
  const opacitySection = document.createElement('div');
  opacitySection.innerHTML = `
    <div style="font-family:var(--font-doodle);font-size:0.82rem;margin-bottom:var(--space-2);" id="opacity-val">
      ${state.opacity}%
    </div>
    <input type="range" class="slider" id="slider-opacity" min="10" max="100" step="5" value="${state.opacity}" />
  `;
  panel.appendChild(buildSection('Opacity', opacitySection));

  // ── Zoom ──────────────────────────────────────────────────
  const zoomSection = document.createElement('div');
  zoomSection.style.cssText = `display:flex;align-items:center;gap:var(--space-2);`;
  zoomSection.innerHTML = `
    <button class="btn btn--sm" id="zoom-out"
      style="font-family:var(--font-doodle);width:32px;flex-shrink:0;">-</button>
    <span style="font-family:var(--font-doodle);font-size:0.82rem;flex:1;text-align:center;" id="zoom-val">
      100%
    </span>
    <button class="btn btn--sm" id="zoom-in"
      style="font-family:var(--font-doodle);width:32px;flex-shrink:0;">+</button>
  `;
  panel.appendChild(buildSection('Zoom', zoomSection));

  // ── Guide lines toggle ─────────────────────────────────────
  const guidesSection = document.createElement('div');
  guidesSection.innerHTML = `
    <button class="btn btn--sm" id="guides-btn" style="width:100%;font-family:var(--font-doodle);font-size:0.78rem;">
      ${state.showGuides ? 'Hide' : 'Show'} Guides
    </button>
  `;
  panel.appendChild(buildSection('Guides', guidesSection));

  // ── Template Trace Overlay ─────────────────────────────────
  const traceSection = document.createElement('div');
  traceSection.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px;margin-bottom:var(--space-2);">
      <button class="btn btn--sm trace-style-btn btn--primary" data-tstyle="sans" style="font-family:var(--font-doodle);font-size:0.7rem;padding:3px;">Sans</button>
      <button class="btn btn--sm trace-style-btn" data-tstyle="serif" style="font-family:var(--font-doodle);font-size:0.7rem;padding:3px;">Serif</button>
      <button class="btn btn--sm trace-style-btn" data-tstyle="doodle" style="font-family:var(--font-doodle);font-size:0.7rem;padding:3px;">Doodle</button>
      <button class="btn btn--sm trace-style-btn" data-tstyle="off" style="font-family:var(--font-doodle);font-size:0.7rem;padding:3px;">Off</button>
    </div>
    <div style="font-family:var(--font-doodle);font-size:0.78rem;margin-bottom:2px;" id="trace-val">Trace Opacity: ${state.templateOpacity}%</div>
    <input type="range" class="slider" id="slider-trace" min="0" max="80" step="5" value="${state.templateOpacity}" />
  `;
  panel.appendChild(buildSection('Template Trace', traceSection));

  // ── Wire up events ────────────────────────────────────────

  // Tool toggle
  panel.querySelector('#tool-pen').addEventListener('click', () => {
    state.tool = 'pen';
    panel.querySelector('#tool-pen').classList.add('btn--primary');
    panel.querySelector('#tool-eraser').classList.remove('btn--primary');
    emit();
  });
  panel.querySelector('#tool-eraser').addEventListener('click', () => {
    state.tool = 'eraser';
    panel.querySelector('#tool-eraser').classList.add('btn--primary');
    panel.querySelector('#tool-pen').classList.remove('btn--primary');
    emit();
  });

  // Brush size
  panel.querySelector('#slider-size').addEventListener('input', (e) => {
    state.brushSize = parseInt(e.target.value);
    panel.querySelector('#size-val').textContent = `${state.brushSize}px`;
    const preview = panel.querySelector('#brush-preview');
    const clamped = Math.max(4, Math.min(40, state.brushSize));
    preview.style.width  = `${clamped}px`;
    preview.style.height = `${clamped}px`;
    emit();
  });

  // Brush style
  panel.querySelectorAll('.brush-style-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.brushStyle = btn.dataset.style;
      panel.querySelectorAll('.brush-style-btn').forEach(b => b.classList.remove('btn--primary'));
      btn.classList.add('btn--primary');
      emit();
    });
  });

  // Color
  const colorInput = panel.querySelector('#stroke-color');
  const hexInput   = panel.querySelector('#color-hex-input');
  colorInput.addEventListener('input', (e) => {
    state.color = e.target.value;
    hexInput.value = state.color;
    emit();
  });
  hexInput.addEventListener('input', (e) => {
    if (/^#[0-9a-f]{6}$/i.test(e.target.value)) {
      state.color = e.target.value;
      colorInput.value = state.color;
      emit();
    }
  });

  // Smoothing
  panel.querySelector('#slider-smooth').addEventListener('input', (e) => {
    state.smoothing = parseInt(e.target.value);
    panel.querySelector('#smooth-val').textContent = state.smoothing;
    emit();
  });

  // Opacity
  panel.querySelector('#slider-opacity').addEventListener('input', (e) => {
    state.opacity = parseInt(e.target.value);
    panel.querySelector('#opacity-val').textContent = `${state.opacity}%`;
    emit();
  });

  // Zoom
  panel.querySelector('#zoom-in').addEventListener('click', () => {
    state.zoom = Math.min(200, state.zoom + 25);
    panel.querySelector('#zoom-val').textContent = `${state.zoom}%`;
    emit();
  });
  panel.querySelector('#zoom-out').addEventListener('click', () => {
    state.zoom = Math.max(50, state.zoom - 25);
    panel.querySelector('#zoom-val').textContent = `${state.zoom}%`;
    emit();
  });

  // Guides
  panel.querySelector('#guides-btn').addEventListener('click', () => {
    state.showGuides = !state.showGuides;
    panel.querySelector('#guides-btn').textContent = `${state.showGuides ? 'Hide' : 'Show'} Guides`;
    emit();
  });

  // Template Trace Style
  panel.querySelectorAll('.trace-style-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.templateStyle = btn.dataset.tstyle;
      panel.querySelectorAll('.trace-style-btn').forEach(b => b.classList.remove('btn--primary'));
      btn.classList.add('btn--primary');
      emit();
    });
  });

  // Template Trace Opacity
  panel.querySelector('#slider-trace').addEventListener('input', (e) => {
    state.templateOpacity = parseInt(e.target.value);
    panel.querySelector('#trace-val').textContent = `Trace Opacity: ${state.templateOpacity}%`;
    emit();
  });

  return {
    element:  panel,
    getState: () => ({ ...state }),
  };
}
