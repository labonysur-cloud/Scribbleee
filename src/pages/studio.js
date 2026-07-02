// ── studio.js — The main drawing editor ────────────────────
import { createNav }           from '../components/Nav.js';
import { createDrawingCanvas } from '../components/DrawingCanvas.js';
import { createToolPanel }     from '../components/ToolPanel.js';
import { createGlyphGrid }     from '../components/GlyphGrid.js';
import { showToast }           from '../components/Toast.js';
import {
  saveProject, getProject, createEmptyProject, publishFont,
} from '../lib/glyphStore.js';
import {
  downloadAsTTF, downloadAsOTF, downloadAsWOFF, downloadAsWOFF2,
  getFontDataURL, strokesToSVGPath,
} from '../lib/fontBuilder.js';
import { exportInstagramVideo, downloadVideoBlob } from '../lib/instagramExport.js';
import { getTemplate, getAllTemplates, TEMPLATE_STYLES, hasTemplate } from '../lib/templates.js';

export function renderStudio(container, navigate) {
  const page = document.createElement('div');
  page.className = 'page';
  page.style.cssText = 'display:flex;flex-direction:column;height:100vh;overflow:hidden;';

  page.appendChild(createNav(navigate, 'studio'));

  // ── Parse query params ───────────────────
  const hash     = window.location.hash;
  const params   = new URLSearchParams(hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '');
  const projectId   = params.get('project');
  const templateParam = params.get('template');

  // ── Project state ────────────────────────
  let project = createEmptyProject();

  // ── Selected glyph ───────────────────────
  let selectedChar = 'A';
  let language     = 'english';

  // ── Canvas / tool / grid refs ────────────
  let canvasApi    = null;
  let toolApi      = null;
  let glyphGridApi = null;
  let savedIndicatorTimeout = null;

  // ── Top toolbar ──────────────────────────
  const toolbar = document.createElement('div');
  toolbar.style.cssText = `
    display:flex;align-items:center;gap:var(--space-3);
    padding:var(--space-3) var(--space-5);
    border-bottom:var(--border);
    background:var(--cream);
    flex-shrink:0;
    flex-wrap:wrap;
  `;
  toolbar.innerHTML = `
    <input class="input" id="font-name-input" placeholder="My Cute Font" value="${project.name}"
      style="max-width:220px;font-family:var(--font-doodle);font-size:1.05rem;padding:var(--space-2) var(--space-3);" />

    <span id="save-dot" title="Saved" style="
      display:inline-block;width:9px;height:9px;border-radius:50%;
      background:var(--gray-300);border:2px solid var(--gray-300);
      transition:background 0.3s;flex-shrink:0;
    "></span>

    <div style="display:flex;gap:var(--space-2);margin-left:auto;flex-wrap:wrap;">
      <button class="btn btn--sm" id="lang-toggle" style="font-family:var(--font-doodle);">
        Language: <strong>English</strong>
      </button>
      <button class="btn btn--sm" id="btn-preview"  style="font-family:var(--font-doodle);">Preview Text</button>
      <button class="btn btn--sm" id="btn-animate"  style="font-family:var(--font-doodle);">Animate</button>
      <button class="btn btn--sm" id="btn-download-font" style="font-family:var(--font-doodle);">Download Font ▾</button>
      <button class="btn btn--sm btn--primary" id="btn-save" style="font-family:var(--font-doodle);">Save</button>
    </div>
  `;
  page.appendChild(toolbar);

  // ── Editor area ──────────────────────────
  const editor = document.createElement('div');
  editor.style.cssText = `display:flex;flex:1;overflow:hidden;`;

  // Tool panel (left)
  toolApi = createToolPanel({
    onChange(state) {
      if (!canvasApi) return;
      canvasApi.setBrushStyle(state.brushStyle);
      canvasApi.setBrushSize(state.brushSize);
      canvasApi.setOpacity(state.opacity / 100);
      canvasApi.setTool(state.tool);
      if (state.zoom !== undefined) {
        canvasWrapper.style.transform = `scale(${state.zoom / 100})`;
        canvasWrapper.style.transformOrigin = 'top center';
      }
      if (state.showGuides !== undefined) canvasApi.setShowGuides?.(state.showGuides);
      const alpha = state.templateStyle === 'off' ? 0 : (state.templateOpacity !== undefined ? state.templateOpacity / 100 : 0.25);
      canvasApi.setTemplateOverlay(selectedChar, state.templateStyle || 'sans', alpha);
    },
  });
  editor.appendChild(toolApi.element);

  // Center : canvas + controls
  const centerCol = document.createElement('div');
  centerCol.style.cssText = `
    flex:1;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:flex-start;
    overflow:auto;
    padding:var(--space-5);
    gap:var(--space-4);
    background:var(--cream-dark);
    border-right:var(--border);
  `;

  // Ghost letter overlay (hidden since DrawingCanvas now draws crisp template internally)
  const ghostLetter = document.createElement('div');
  ghostLetter.id = 'ghost-letter';
  ghostLetter.style.cssText = `display:none;`;
  ghostLetter.textContent = selectedChar;

  // Selected char display
  const charDisplay = document.createElement('div');
  charDisplay.style.cssText = `
    font-family:var(--font-display);
    font-size:1.1rem;
    font-style:italic;
    color:var(--gray-400);
    display:flex;align-items:center;gap:var(--space-3);
    width:100%;max-width:500px;
  `;
  charDisplay.innerHTML = `
    Drawing:
    <span id="current-char-label"
      style="font-size:2.2rem;color:var(--black);font-weight:700;font-style:normal;font-family:var(--font-doodle);">
      ${selectedChar}
    </span>
    <span style="font-family:var(--font-doodle);font-size:0.85rem;color:var(--gray-300);">
      (← → Arrow keys to navigate)
    </span>
  `;
  centerCol.appendChild(charDisplay);

  // Canvas wrapper (for zoom transform)
  const canvasWrapper = document.createElement('div');
  canvasWrapper.style.cssText = `position:relative;transition:transform 0.2s;`;
  canvasWrapper.appendChild(ghostLetter);

  canvasApi = createDrawingCanvas({
    showGuides: true,
    templateChar: selectedChar,
    templateStyle: 'sans',
    templateOpacity: 0.25,
    onStrokeComplete(strokes) {
      if (!project.glyphs[selectedChar]) project.glyphs[selectedChar] = {};
      project.glyphs[selectedChar].strokes = strokes;
      project.glyphs[selectedChar].svgPath = canvasApi.exportSVGPath();
      glyphGridApi?.refresh(project.glyphs, selectedChar);
      markUnsaved();
    },
  });
  canvasApi.element.style.maxWidth  = '100%';
  canvasApi.element.style.maxHeight = '70vh';
  canvasApi.element.style.position  = 'relative';
  canvasApi.element.style.zIndex    = '1';
  canvasWrapper.appendChild(canvasApi.element);
  centerCol.appendChild(canvasWrapper);

  // Canvas controls (undo/redo/clear + nav)
  const canvasControls = document.createElement('div');
  canvasControls.style.cssText = `display:flex;gap:var(--space-3);align-items:center;flex-wrap:wrap;justify-content:center;`;
  canvasControls.innerHTML = `
    <button class="btn btn--sm" id="btn-undo"  title="Undo (Ctrl+Z)" style="font-family:var(--font-doodle);">↩ Undo</button>
    <button class="btn btn--sm" id="btn-redo"  title="Redo (Ctrl+Y)" style="font-family:var(--font-doodle);">↪ Redo</button>
    <button class="btn btn--sm" id="btn-clear" style="font-family:var(--font-doodle);border-style:dashed;">✕ Clear</button>
    <span style="color:var(--gray-300);font-size:1.2rem;">|</span>
    <button class="btn btn--sm" id="btn-prev-char" style="font-family:var(--font-doodle);">← Prev</button>
    <button class="btn btn--sm" id="btn-next-char" style="font-family:var(--font-doodle);">Next →</button>
  `;
  centerCol.appendChild(canvasControls);

  // Preview strip (thumbnails of completed glyphs)
  const previewStripLabel = document.createElement('div');
  previewStripLabel.style.cssText = `font-family:var(--font-doodle);font-size:0.85rem;color:var(--gray-400);width:100%;max-width:500px;text-align:center;`;
  previewStripLabel.textContent = 'Completed glyphs';

  const previewStrip = document.createElement('div');
  previewStrip.id = 'preview-strip';
  previewStrip.style.cssText = `
    display:flex;gap:var(--space-2);flex-wrap:wrap;justify-content:center;
    max-width:500px;padding:var(--space-3);
    background:var(--white);border:var(--border);box-shadow:var(--shadow-sm);
  `;
  centerCol.appendChild(previewStripLabel);
  centerCol.appendChild(previewStrip);

  editor.appendChild(centerCol);

  // ── Right panel — Tabbed (Glyphs | Templates) ──
  const rightPanel = document.createElement('div');
  rightPanel.style.cssText = `
    width:285px;
    flex-shrink:0;
    display:flex;
    flex-direction:column;
    background:var(--white);
    overflow:hidden;
  `;

  // Tab bar
  const tabBar = document.createElement('div');
  tabBar.style.cssText = `
    display:flex;border-bottom:var(--border);flex-shrink:0;
  `;
  tabBar.innerHTML = `
    <button class="tab-btn active" data-tab="glyphs"
      style="flex:1;padding:var(--space-3);font-family:var(--font-doodle);font-size:0.82rem;
             border:none;border-right:var(--border);cursor:pointer;background:var(--white);
             font-weight:700;transition:background 0.1s;">
      Glyphs
    </button>
    <button class="tab-btn" data-tab="templates"
      style="flex:1;padding:var(--space-3);font-family:var(--font-doodle);font-size:0.82rem;
             border:none;cursor:pointer;background:var(--cream);transition:background 0.1s;">
      Templates
    </button>
  `;

  rightPanel.appendChild(tabBar);

  // Tab content area
  const tabContent = document.createElement('div');
  tabContent.style.cssText = `flex:1;overflow:hidden;display:flex;flex-direction:column;`;
  rightPanel.appendChild(tabContent);

  // ── GLYPHS TAB ────────────────────────────────
  const glyphsTabEl = document.createElement('div');
  glyphsTabEl.id = 'tab-glyphs';
  glyphsTabEl.style.cssText = `flex:1;overflow:hidden;display:flex;flex-direction:column;`;

  glyphGridApi = createGlyphGrid({
    language,
    glyphs: project.glyphs,
    selectedChar,
    onSelect(char) { switchToChar(char); },
  });
  glyphsTabEl.appendChild(glyphGridApi.element);
  tabContent.appendChild(glyphsTabEl);

  // ── TEMPLATES TAB ─────────────────────────────
  const templatesTabEl = document.createElement('div');
  templatesTabEl.id = 'tab-templates';
  templatesTabEl.style.cssText = `flex:1;overflow:auto;display:none;flex-direction:column;padding:var(--space-4);gap:var(--space-4);`;

  // Template header
  const tplHeader = document.createElement('div');
  tplHeader.innerHTML = `
    <div style="font-family:var(--font-doodle);font-size:0.72rem;color:var(--gray-400);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:var(--space-2);">
      Template Style
    </div>
    <div style="display:flex;flex-direction:column;gap:var(--space-2);" id="style-btns">
      ${TEMPLATE_STYLES.map((s, i) => `
        <button class="btn tpl-style-btn ${i === 0 ? 'btn--primary' : ''}" data-style="${s.id}"
          style="font-family:var(--font-doodle);font-size:0.82rem;text-align:left;padding:var(--space-2) var(--space-3);">
          <strong>${s.name}</strong>
          <span style="display:block;font-size:0.72rem;opacity:0.7;font-weight:400;margin-top:2px;">${s.desc}</span>
        </button>
      `).join('')}
    </div>
  `;
  templatesTabEl.appendChild(tplHeader);

  // Current char template info
  const tplCharInfo = document.createElement('div');
  tplCharInfo.style.cssText = `border-top:var(--border-sm);padding-top:var(--space-4);`;
  tplCharInfo.innerHTML = `
    <div style="font-family:var(--font-doodle);font-size:0.72rem;color:var(--gray-400);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:var(--space-2);">
      Current Letter
    </div>
    <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-4);">
      <div style="
        width:56px;height:56px;border:var(--border);background:var(--cream);
        display:flex;align-items:center;justify-content:center;
        font-family:var(--font-doodle);font-size:2.2rem;font-weight:700;">
        <span id="tpl-char-preview">${selectedChar}</span>
      </div>
      <div>
        <div id="tpl-avail-badge" style="font-family:var(--font-doodle);font-size:0.8rem;margin-bottom:4px;"></div>
        <button class="btn btn--primary" id="tpl-load-btn"
          style="font-family:var(--font-doodle);font-size:0.82rem;">
          Load Template
        </button>
      </div>
    </div>
  `;
  templatesTabEl.appendChild(tplCharInfo);

  // Divider + bulk apply
  const tplBulk = document.createElement('div');
  tplBulk.style.cssText = `border-top:var(--border-sm);padding-top:var(--space-4);`;
  tplBulk.innerHTML = `
    <div style="font-family:var(--font-doodle);font-size:0.72rem;color:var(--gray-400);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:var(--space-2);">
      Bulk Fill
    </div>
    <p style="font-family:var(--font-doodle);font-size:0.82rem;color:var(--gray-500);margin-bottom:var(--space-3);">
      Load the selected style into every letter that has a template (only fills empty glyphs).
    </p>
    <button class="btn" id="tpl-apply-all-btn"
      style="font-family:var(--font-doodle);font-size:0.82rem;width:100%;border-style:dashed;">
      Apply Templates to All Empty
    </button>
  `;
  templatesTabEl.appendChild(tplBulk);

  // Template mini-grid preview
  const tplGrid = document.createElement('div');
  tplGrid.style.cssText = `border-top:var(--border-sm);padding-top:var(--space-4);`;
  tplGrid.innerHTML = `
    <div style="font-family:var(--font-doodle);font-size:0.72rem;color:var(--gray-400);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:var(--space-2);">
      Available Characters
    </div>
    <div id="tpl-char-grid" style="
      display:flex;flex-wrap:wrap;gap:4px;font-family:var(--font-doodle);font-size:0.85rem;
    "></div>
  `;
  templatesTabEl.appendChild(tplGrid);

  tabContent.appendChild(templatesTabEl);
  editor.appendChild(rightPanel);
  page.appendChild(editor);

  // Modal area
  const modalArea = document.createElement('div');
  modalArea.id = 'modal-area';
  page.appendChild(modalArea);

  // ── Tab switching ─────────────────────────
  let activeTemplate = TEMPLATE_STYLES[0].id;

  function renderTemplateCharGrid() {
    const grid = templatesTabEl.querySelector('#tpl-char-grid');
    if (!grid) return;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    grid.innerHTML = '';
    for (const c of chars) {
      if (!hasTemplate(c)) continue;
      const pill = document.createElement('span');
      pill.textContent = c;
      pill.title = `Click to jump to "${c}"`;
      pill.style.cssText = `
        display:inline-flex;align-items:center;justify-content:center;
        width:26px;height:26px;
        border:1px solid var(--gray-200);background:var(--cream);
        cursor:pointer;font-size:0.85rem;
        ${c === selectedChar ? 'background:var(--black);color:var(--white);border-color:var(--black);' : ''}
        ${project.glyphs[c]?.svgPath ? 'border-color:var(--black);border-width:2px;' : ''}
        transition:background 0.1s;
      `;
      pill.addEventListener('click', () => switchToChar(c));
      pill.addEventListener('mouseenter', () => { if (c !== selectedChar) { pill.style.background = 'var(--cream-dark)'; } });
      pill.addEventListener('mouseleave', () => { if (c !== selectedChar) { pill.style.background = project.glyphs[c]?.svgPath ? 'var(--cream)' : 'var(--cream)'; } });
      grid.appendChild(pill);
    }
  }

  function updateTemplatePanel() {
    const charPreview = templatesTabEl.querySelector('#tpl-char-preview');
    const availBadge  = templatesTabEl.querySelector('#tpl-avail-badge');
    const loadBtn     = templatesTabEl.querySelector('#tpl-load-btn');
    if (charPreview) charPreview.textContent = selectedChar;
    const avail = hasTemplate(selectedChar);
    if (availBadge) {
      availBadge.textContent = avail ? 'Template available' : 'No template for this char';
      availBadge.style.color = avail ? 'var(--black)' : 'var(--gray-400)';
    }
    if (loadBtn) loadBtn.disabled = !avail;
    renderTemplateCharGrid();
  }

  tabBar.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      tabBar.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'var(--cream)';
        b.style.fontWeight = '400';
      });
      btn.classList.add('active');
      btn.style.background = 'var(--white)';
      btn.style.fontWeight = '700';
      if (btn.dataset.tab === 'glyphs') {
        glyphsTabEl.style.display = 'flex';
        templatesTabEl.style.display = 'none';
      } else {
        glyphsTabEl.style.display = 'none';
        templatesTabEl.style.display = 'flex';
        updateTemplatePanel();
      }
    });
  });

  // Template style buttons
  templatesTabEl.querySelectorAll('.tpl-style-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTemplate = btn.dataset.style;
      templatesTabEl.querySelectorAll('.tpl-style-btn').forEach(b => b.classList.remove('btn--primary'));
      btn.classList.add('btn--primary');
    });
  });

  // Load template for current char
  templatesTabEl.querySelector('#tpl-load-btn').addEventListener('click', () => {
    const strokes = getTemplate(activeTemplate, selectedChar);
    if (!strokes) { showToast(`No template for "${selectedChar}"`); return; }
    canvasApi.loadStrokes(strokes);
    if (!project.glyphs[selectedChar]) project.glyphs[selectedChar] = {};
    project.glyphs[selectedChar].strokes = strokes;
    project.glyphs[selectedChar].svgPath = canvasApi.exportSVGPath();
    glyphGridApi?.refresh(project.glyphs, selectedChar);
    showToast(`Loaded ${TEMPLATE_STYLES.find(s => s.id === activeTemplate)?.name} template for "${selectedChar}"`);
    markUnsaved();
  });

  // Apply templates to all empty glyphs
  templatesTabEl.querySelector('#tpl-apply-all-btn').addEventListener('click', () => {
    const charList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');
    const emptyChars = charList.filter(c => !project.glyphs[c]?.svgPath);
    const allTpls = getAllTemplates(activeTemplate, emptyChars);
    let count = 0;
    for (const [char, strokes] of Object.entries(allTpls)) {
      if (!project.glyphs[char]) project.glyphs[char] = {};
      project.glyphs[char].strokes = strokes;
      // For SVG path we use the stroke points directly
      project.glyphs[char].svgPath = strokes
        .filter(s => !s.eraser && s.points?.length >= 2)
        .map(s => {
          const pts = s.points;
          let d = `M ${pts[0][0]} ${pts[0][1]} `;
          for (let i = 1; i < pts.length; i++) d += `L ${pts[i][0]} ${pts[i][1]} `;
          return d + 'Z';
        })
        .join(' ');
      count++;
    }
    glyphGridApi?.refresh(project.glyphs, selectedChar);
    updatePreviewStrip();
    renderTemplateCharGrid();
    showToast(`Loaded ${count} templates. Review and refine each letter!`);
    markUnsaved();
  });

  // ── Canvas controls ────────────────────────
  page.querySelector('#btn-undo').addEventListener('click', () => canvasApi.undo());
  page.querySelector('#btn-redo').addEventListener('click', () => canvasApi.redo());
  page.querySelector('#btn-clear').addEventListener('click', () => {
    if (confirm(`Clear the drawing for "${selectedChar}"?`)) {
      canvasApi.clear();
      delete project.glyphs[selectedChar];
      glyphGridApi.refresh(project.glyphs, selectedChar);
      updatePreviewStrip();
      markUnsaved();
    }
  });

  // ── Character list & navigation ───────────
  const CHAR_LIST_EN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');
  const CHAR_LIST_BN = 'কখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহঅআইঈউঊঋএঐওঔ০১২৩৪৫৬৭৮৯'.split('');
  function charList() { return language === 'bangla' ? CHAR_LIST_BN : CHAR_LIST_EN; }

  page.querySelector('#btn-prev-char').addEventListener('click', () => {
    const list = charList();
    const idx  = list.indexOf(selectedChar);
    switchToChar(list[Math.max(0, idx - 1)]);
  });
  page.querySelector('#btn-next-char').addEventListener('click', () => {
    const list = charList();
    const idx  = list.indexOf(selectedChar);
    switchToChar(list[Math.min(list.length - 1, idx + 1)]);
  });

  function switchToChar(char) {
    // Save current before switching
    if (canvasApi) {
      if (!project.glyphs[selectedChar]) project.glyphs[selectedChar] = {};
      project.glyphs[selectedChar].strokes = canvasApi.getStrokes();
      project.glyphs[selectedChar].svgPath = canvasApi.exportSVGPath();
    }
    selectedChar = char;
    page.querySelector('#current-char-label').textContent = char;
    ghostLetter.textContent = char;

    const existing = project.glyphs[char];
    canvasApi.loadStrokes(existing?.strokes || []);
    glyphGridApi?.refresh(project.glyphs, selectedChar);
    updatePreviewStrip();
    updateTemplatePanel();
  }

  // ── Language toggle ───────────────────────
  page.querySelector('#lang-toggle').addEventListener('click', () => {
    language = language === 'english' ? 'bangla' : 'english';
    page.querySelector('#lang-toggle').innerHTML = `Language: <strong>${language === 'bangla' ? 'বাংলা' : 'English'}</strong>`;
    project.language = language;
    selectedChar = language === 'bangla' ? 'ক' : 'A';
    page.querySelector('#current-char-label').textContent = selectedChar;
    ghostLetter.textContent = selectedChar;
    canvasApi.loadStrokes([]);

    glyphGridApi = createGlyphGrid({
      language,
      glyphs: project.glyphs,
      selectedChar,
      onSelect(char) { switchToChar(char); },
    });
    const oldGrid = editor.querySelector('.glyph-grid-panel');
    if (oldGrid) glyphsTabEl.replaceChild(glyphGridApi.element, oldGrid);
    else glyphsTabEl.appendChild(glyphGridApi.element);
  });

  // ── Font name ──────────────────────────────
  page.querySelector('#font-name-input').addEventListener('input', (e) => {
    project.name = e.target.value || 'My Cute Font';
    markUnsaved();
  });

  // ── Save indicator ─────────────────────────
  function markUnsaved() {
    const dot = page.querySelector('#save-dot');
    if (dot) { dot.style.background = '#f59e0b'; dot.style.borderColor = '#f59e0b'; }
  }
  function markSaved() {
    const dot = page.querySelector('#save-dot');
    if (dot) { dot.style.background = '#22c55e'; dot.style.borderColor = '#22c55e'; }
    clearTimeout(savedIndicatorTimeout);
    savedIndicatorTimeout = setTimeout(() => {
      if (dot) { dot.style.background = 'var(--gray-300)'; dot.style.borderColor = 'var(--gray-300)'; }
    }, 3000);
  }

  // ── Save ───────────────────────────────────
  page.querySelector('#btn-save').addEventListener('click', async () => {
    if (canvasApi) {
      if (!project.glyphs[selectedChar]) project.glyphs[selectedChar] = {};
      project.glyphs[selectedChar].strokes = canvasApi.getStrokes();
      project.glyphs[selectedChar].svgPath = canvasApi.exportSVGPath();
      project.thumbnail = canvasApi.exportCanvasDataURL();
    }
    const saved = await saveProject(project);
    project.id = saved.id;
    markSaved();
    showToast('Font project saved!');
  });

  // ── Download modal ─────────────────────────
  page.querySelector('#btn-download-font').addEventListener('click', () => {
    showDownloadModal(project, modalArea);
  });

  // ── Preview modal ──────────────────────────
  page.querySelector('#btn-preview').addEventListener('click', () => {
    showPreviewModal(project, modalArea);
  });

  // ── Animate modal ──────────────────────────
  page.querySelector('#btn-animate').addEventListener('click', () => {
    showAnimateModal(project, modalArea);
  });

  // ── Keyboard shortcuts ─────────────────────
  document.addEventListener('keydown', handleKeyboard);
  page._cleanup = () => document.removeEventListener('keydown', handleKeyboard);

  function handleKeyboard(e) {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z') { e.preventDefault(); canvasApi.undo(); }
      if (e.key === 'y') { e.preventDefault(); canvasApi.redo(); }
      if (e.key === 's') { e.preventDefault(); page.querySelector('#btn-save').click(); }
    }
    if (e.key === 'ArrowRight') page.querySelector('#btn-next-char').click();
    if (e.key === 'ArrowLeft')  page.querySelector('#btn-prev-char').click();
  }

  // ── Load project if ID given ───────────────
  if (projectId) {
    getProject(projectId).then(p => {
      if (p) {
        Object.assign(project, p);
        page.querySelector('#font-name-input').value = project.name;
        language = project.language || 'english';
        glyphGridApi.refresh(project.glyphs, selectedChar);
        updatePreviewStrip();
        showToast(`Loaded "${project.name}"`);
      }
    });
  }

  // Auto-load template style from URL param
  if (templateParam) {
    const matching = TEMPLATE_STYLES.find(s => s.id === templateParam);
    if (matching) {
      activeTemplate = matching.id;
      showToast(`Using "${matching.name}" template style`);
    }
  }

  function updatePreviewStrip() {
    const strip = page.querySelector('#preview-strip');
    if (!strip) return;
    strip.innerHTML = '';
    charList().forEach(c => {
      const g = project.glyphs[c];
      if (!g?.svgPath) return;
      const span = document.createElement('div');
      span.style.cssText = `
        font-family:var(--font-doodle);
        font-size:1.1rem;
        padding:2px 4px;
        background:var(--cream);
        border:1px solid var(--gray-200);
        cursor:pointer;transition:background 0.1s;
      `;
      span.textContent = c;
      span.title = `Switch to "${c}"`;
      span.addEventListener('click', () => switchToChar(c));
      strip.appendChild(span);
    });
    if (!strip.children.length) {
      strip.innerHTML = '<span style="font-family:var(--font-doodle);color:var(--gray-400);font-size:0.9rem;">Draw a letter to see it here</span>';
    }
  }

  updatePreviewStrip();
  updateTemplatePanel();

  container.appendChild(page);
}

// ── Preview modal ────────────────────────────────────────────
function showPreviewModal(project, container) {
  const fontFamilyName = `preview-${project.id || Date.now()}`;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:620px;width:95%;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4);">
        <h2 style="font-family:var(--font-display);font-size:1.8rem;">Font Preview</h2>
        <button class="btn btn--sm btn--icon" id="modal-close">✕</button>
      </div>
      <div style="margin-bottom:var(--space-4);">
        <label class="label">Type some text</label>
        <textarea class="input" id="preview-text" rows="3" style="resize:vertical;" placeholder="Type something wonderful...">Hello Scribbleee!</textarea>
      </div>
      <div style="margin-bottom:var(--space-3);display:flex;gap:var(--space-4);align-items:flex-end;flex-wrap:wrap;">
        <div>
          <label class="label">Font size</label>
          <div style="display:flex;align-items:center;gap:var(--space-2);">
            <input type="range" class="slider" id="preview-size" min="24" max="120" value="60" style="width:140px;" />
            <span style="font-family:var(--font-doodle);font-size:0.82rem;" id="size-label">60px</span>
          </div>
        </div>
        <div>
          <label class="label">Text color</label>
          <input type="color" id="preview-color" value="#0d0d0d"
            style="width:40px;height:40px;border:var(--border);cursor:pointer;background:none;" />
        </div>
        <div>
          <label class="label">Background</label>
          <input type="color" id="preview-bg" value="#ffffff"
            style="width:40px;height:40px;border:var(--border);cursor:pointer;background:none;" />
        </div>
      </div>
      <div id="preview-output" style="
        min-height:140px;border:var(--border);background:#ffffff;
        padding:var(--space-5);font-size:60px;line-height:1.3;
        word-break:break-word;overflow-x:auto;transition:background 0.2s;
      "></div>
      <div id="font-status" style="font-family:var(--font-doodle);font-size:0.82rem;color:var(--gray-400);margin-top:var(--space-2);">
        Loading font...
      </div>
      <div style="margin-top:var(--space-5);display:flex;gap:var(--space-3);">
        <button class="btn btn--primary" id="modal-dl" style="font-family:var(--font-doodle);">Download TTF</button>
        <button class="btn" id="modal-close2" style="font-family:var(--font-doodle);">Close</button>
      </div>
    </div>
  `;

  const close = () => {
    overlay.remove();
    // Clean up injected @font-face style
    document.getElementById(`fontface-${fontFamilyName}`)?.remove();
  };
  overlay.querySelector('#modal-close').addEventListener('click', close);
  overlay.querySelector('#modal-close2').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  const output      = overlay.querySelector('#preview-output');
  const textInput   = overlay.querySelector('#preview-text');
  const sizeInput   = overlay.querySelector('#preview-size');
  const sizeLabel   = overlay.querySelector('#size-label');
  const colorInput  = overlay.querySelector('#preview-color');
  const bgInput     = overlay.querySelector('#preview-bg');
  const fontStatus  = overlay.querySelector('#font-status');

  // Try to inject @font-face with the actual custom font
  let activeFontFamily = `'Instrument Serif', serif`;
  const glyphCount = Object.keys(project.glyphs).filter(k => project.glyphs[k]?.svgPath).length;

  if (glyphCount > 0) {
    try {
      const dataURL = getFontDataURL(project);
      const styleEl = document.createElement('style');
      styleEl.id    = `fontface-${fontFamilyName}`;
      styleEl.textContent = `
        @font-face {
          font-family: '${fontFamilyName}';
          src: url('${dataURL}') format('truetype');
        }
      `;
      document.head.appendChild(styleEl);
      activeFontFamily = `'${fontFamilyName}', 'Instrument Serif', serif`;
      fontStatus.textContent = `Showing your custom font "${project.name}" (${glyphCount} glyphs)`;
      fontStatus.style.color = 'var(--black)';
    } catch (err) {
      fontStatus.textContent = 'Could not render custom font — using fallback.';
      fontStatus.style.color = 'var(--gray-400)';
    }
  } else {
    fontStatus.textContent = 'No glyphs drawn yet — showing fallback font.';
  }

  function updatePreview() {
    output.textContent   = textInput.value;
    output.style.fontSize   = `${sizeInput.value}px`;
    output.style.color      = colorInput.value;
    output.style.background = bgInput.value;
    output.style.fontFamily = activeFontFamily;
    sizeLabel.textContent   = `${sizeInput.value}px`;
  }

  textInput.addEventListener('input', updatePreview);
  sizeInput.addEventListener('input', updatePreview);
  colorInput.addEventListener('input', updatePreview);
  bgInput.addEventListener('input', updatePreview);
  updatePreview();

  overlay.querySelector('#modal-dl').addEventListener('click', () => {
    try {
      downloadAsTTF(project);
      showToast('Font downloaded! Install it to use everywhere.');
    } catch (e) {
      showToast('Need at least a few glyphs to generate a font.');
    }
  });

  container.appendChild(overlay);
}

// ── Download modal ───────────────────────────────────────────
function showDownloadModal(project, container) {
  const glyphCount = Object.keys(project.glyphs).filter(k => project.glyphs[k]?.svgPath).length;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4);">
        <h2 style="font-family:var(--font-display);font-size:1.8rem;">Download Font</h2>
        <button class="btn btn--sm btn--icon" id="dl-close">✕</button>
      </div>
      <p style="font-family:var(--font-doodle);font-size:1.1rem;margin-bottom:var(--space-5);">
        Your font <strong>"${project.name}"</strong> has <strong>${glyphCount}</strong> glyph${glyphCount !== 1 ? 's' : ''} drawn.
        ${glyphCount < 5 ? '<br><span style="color:var(--gray-400);">Tip: Draw more letters for a more complete font!</span>' : ''}
      </p>

      <div style="display:flex;flex-direction:column;gap:var(--space-3);margin-bottom:var(--space-5);">
        <button class="btn" id="dl-ttf"
          style="font-family:var(--font-doodle);font-size:1rem;justify-content:space-between;display:flex;align-items:center;">
          <span>TTF — TrueType Font</span>
          <span style="font-size:0.8rem;color:var(--gray-400);">Windows · macOS · Linux</span>
        </button>
        <button class="btn" id="dl-otf"
          style="font-family:var(--font-doodle);font-size:1rem;justify-content:space-between;display:flex;align-items:center;">
          <span>OTF — OpenType Font</span>
          <span style="font-size:0.8rem;color:var(--gray-400);">macOS · Adobe apps</span>
        </button>
        <button class="btn" id="dl-woff"
          style="font-family:var(--font-doodle);font-size:1rem;justify-content:space-between;display:flex;align-items:center;">
          <span>WOFF — Web Font</span>
          <span style="font-size:0.8rem;color:var(--gray-400);">Websites · CSS @font-face</span>
        </button>
        <button class="btn" id="dl-woff2"
          style="font-family:var(--font-doodle);font-size:1rem;justify-content:space-between;display:flex;align-items:center;">
          <span>WOFF2 — Compressed Web Font</span>
          <span style="font-size:0.8rem;color:var(--gray-400);">Smaller filesize · modern browsers</span>
        </button>
      </div>

      <div style="border-top:var(--border-sm);border-style:dashed;padding-top:var(--space-4);">
        <h3 style="font-family:var(--font-display);font-size:1.2rem;margin-bottom:var(--space-2);">Share to Community (Zero Database)</h3>
        <p style="font-family:var(--font-doodle);color:var(--gray-500);font-size:0.9rem;margin-bottom:var(--space-3);">
          Publish without login or backend servers via GitHub CDN or IPFS network!
        </p>
        <div style="display:flex;flex-direction:column;gap:var(--space-2);margin-bottom:var(--space-3);">
          <input class="input" id="share-author" placeholder="Your Artist Name (e.g. Labony Sur)" style="font-family:var(--font-doodle);font-size:0.9rem;" />
          <select class="input" id="share-method" style="font-family:var(--font-doodle);font-size:0.9rem;">
            <option value="github">Method 1: GitHub Archive (CDN & PR Auto-Merge)</option>
            <option value="ipfs">Method 2: IPFS P2P Network (Immutable CID)</option>
          </select>
        </div>
        <button class="btn btn--cute-pink" id="dl-share" style="font-family:var(--font-doodle);width:100%;font-weight:800;font-size:1.05rem;">Publish to Community</button>
      </div>
    </div>
  `;

  const close = () => overlay.remove();
  overlay.querySelector('#dl-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  function guardedDownload(fn, label) {
    return () => {
      try {
        if (glyphCount === 0) { showToast('Draw some glyphs first!'); return; }
        fn(project);
        showToast(`${label} downloaded!`);
      } catch (e) {
        showToast('Could not build font. Try drawing more glyphs.');
        console.error(e);
      }
    };
  }

  overlay.querySelector('#dl-ttf').addEventListener('click', guardedDownload(downloadAsTTF, 'TTF font'));
  overlay.querySelector('#dl-otf').addEventListener('click', guardedDownload(downloadAsOTF, 'OTF font'));
  overlay.querySelector('#dl-woff').addEventListener('click', guardedDownload(downloadAsWOFF, 'WOFF font'));
  overlay.querySelector('#dl-woff2').addEventListener('click', guardedDownload(downloadAsWOFF2, 'WOFF2 font'));

  overlay.querySelector('#dl-share').addEventListener('click', async () => {
    try {
      const author = overlay.querySelector('#share-author').value.trim() || 'Anonymous Artist';
      const storageMethod = overlay.querySelector('#share-method').value;

      let fontData = '';
      try { fontData = getFontDataURL(project); } catch (_) {}
      const res = await publishFont(project, fontData, { storageMethod, author });
      if (storageMethod === 'ipfs') {
        showToast(`Published to IPFS network! CID: ${res.cid.slice(0, 12)}...`);
      } else {
        showToast('Published via GitHub Archive! Available on global CDN.');
      }
      close();
    } catch (e) {
      showToast('Could not publish font.');
    }
  });

  container.appendChild(overlay);
}

// ── Animate modal ────────────────────────────────────────────
function showAnimateModal(project, container) {
  const EFFECTS = ['bounce', 'wave', 'typewriter', 'fade', 'shake', 'zoom'];

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:560px;width:95%;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4);">
        <h2 style="font-family:var(--font-display);font-size:1.8rem;">Instagram Animation</h2>
        <button class="btn btn--sm btn--icon" id="anim-close">✕</button>
      </div>

      <div style="margin-bottom:var(--space-4);">
        <label class="label">Text to animate</label>
        <input class="input" id="anim-text" value="${project.name}" style="font-family:var(--font-doodle);" />
      </div>

      <div style="margin-bottom:var(--space-4);">
        <label class="label">Animation effect</label>
        <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;" id="effect-btns">
          ${EFFECTS.map((e, i) => `
            <button class="btn btn--sm effect-btn ${i === 0 ? 'btn--primary' : ''}" data-effect="${e}" style="font-family:var(--font-doodle);">
              ${e.charAt(0).toUpperCase() + e.slice(1)}
            </button>
          `).join('')}
        </div>
      </div>

      <div style="display:flex;gap:var(--space-4);margin-bottom:var(--space-5);flex-wrap:wrap;">
        <div>
          <label class="label">Text color</label>
          <input type="color" id="anim-textcolor" value="#0d0d0d"
            style="width:48px;height:40px;border:var(--border);cursor:pointer;background:none;" />
        </div>
        <div>
          <label class="label">Background</label>
          <input type="color" id="anim-bgcolor" value="#fafafa"
            style="width:48px;height:40px;border:var(--border);cursor:pointer;background:none;" />
        </div>
        <div>
          <label class="label" for="anim-duration">Duration (sec)</label>
          <input type="number" class="input" id="anim-duration" value="3" min="1" max="15"
            style="width:80px;" />
        </div>
      </div>

      <div id="anim-progress" style="display:none;margin-bottom:var(--space-4);">
        <div style="font-family:var(--font-doodle);margin-bottom:var(--space-2);">Generating video...</div>
        <div style="height:8px;background:var(--gray-200);border:var(--border-sm);">
          <div id="anim-bar" style="height:100%;background:var(--black);width:0%;transition:width 0.2s;"></div>
        </div>
      </div>

      <div style="display:flex;gap:var(--space-3);">
        <button class="btn btn--primary" id="anim-export" style="font-family:var(--font-doodle);">Export for Instagram</button>
        <button class="btn" id="anim-close2" style="font-family:var(--font-doodle);">Cancel</button>
      </div>
      <p style="font-family:var(--font-doodle);font-size:0.8rem;color:var(--gray-400);margin-top:var(--space-3);">
        Exports a 1080x1920 WebM video. Save it and upload directly to Instagram Stories.
      </p>
    </div>
  `;

  let selectedEffect = 'bounce';
  const close = () => overlay.remove();
  overlay.querySelector('#anim-close').addEventListener('click', close);
  overlay.querySelector('#anim-close2').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  overlay.querySelectorAll('.effect-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.querySelectorAll('.effect-btn').forEach(b => b.classList.remove('btn--primary'));
      btn.classList.add('btn--primary');
      selectedEffect = btn.dataset.effect;
    });
  });

  overlay.querySelector('#anim-export').addEventListener('click', async () => {
    const text      = overlay.querySelector('#anim-text').value || project.name;
    const textColor = overlay.querySelector('#anim-textcolor').value;
    const bgColor   = overlay.querySelector('#anim-bgcolor').value;
    const duration  = parseInt(overlay.querySelector('#anim-duration').value) || 3;

    const progressEl = overlay.querySelector('#anim-progress');
    const barEl      = overlay.querySelector('#anim-bar');
    progressEl.style.display = 'block';

    try {
      const blob = await exportInstagramVideo({
        text,
        effect:    selectedEffect,
        textColor,
        bgColor,
        duration,
        onProgress: (p) => { barEl.style.width = `${(p * 100).toFixed(0)}%`; },
      });
      downloadVideoBlob(blob, `${project.name}-story.webm`);
      showToast('Video downloaded! Upload it to Instagram Stories.');
    } catch (e) {
      showToast('Could not export video. Try a different browser.');
      console.error(e);
    } finally {
      progressEl.style.display = 'none';
      barEl.style.width = '0%';
    }
  });
  container.appendChild(overlay);
}
