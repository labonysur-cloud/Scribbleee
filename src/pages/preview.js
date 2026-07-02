// ── preview.js — Font preview & multi-format download ────────────────────
import { createNav }          from '../components/Nav.js';
import { getAllProjects }      from '../lib/glyphStore.js';
import {
  downloadAsTTF, downloadAsOTF, downloadAsWOFF, downloadAsWOFF2,
  getFontDataURL,
} from '../lib/fontBuilder.js';
import { showToast }          from '../components/Toast.js';

const SAMPLE_TEXTS = [
  'Hello Scribbleee!',
  'The quick brown fox jumps over the lazy dog',
  'Typography is the art of arranging type',
  'আমার সোনার বাংলা',
  'সুন্দর ফন্ট তৈরি করুন',
  'Aa Bb Cc Dd Ee Ff Gg',
  '0123456789 !@#$%^&*',
  'cute, pretty, whimsical & unique',
];

export function renderPreview(container, navigate) {
  const page = document.createElement('div');
  page.className = 'page';

  page.appendChild(createNav(navigate, 'preview'));

  const style = document.createElement('style');
  style.textContent = `
    .preview-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      min-height: calc(100vh - 65px);
      border-top: var(--border);
    }

    @media (max-width: 768px) {
      .preview-layout { grid-template-columns: 1fr; }
    }

    .preview-sidebar {
      border-right: var(--border);
      padding: var(--space-5);
      background: var(--white);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .preview-main {
      padding: var(--space-5);
      background: var(--cream);
      overflow-y: auto;
    }

    .preview-font-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .preview-font-item {
      padding: var(--space-3);
      border: var(--border-sm);
      background: var(--cream);
      cursor: pointer;
      transition: background 0.1s, box-shadow 0.2s;
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .preview-font-item.active,
    .preview-font-item:hover {
      background: var(--black);
      color: var(--white);
    }

    .preview-font-item__name {
      font-family: var(--font-display);
      font-style: italic;
      font-size: 1.15rem;
    }

    .preview-font-item__meta {
      font-family: var(--font-doodle);
      font-size: 0.8rem;
      opacity: 0.65;
    }

    .preview-text-area {
      background: var(--white);
      border: var(--border);
      padding: var(--space-6);
      min-height: 320px;
      box-shadow: var(--shadow);
      margin-bottom: var(--space-5);
      transition: background 0.2s;
    }

    .waterfall-row {
      padding: var(--space-3) 0;
      border-bottom: 1px dashed var(--gray-200);
    }

    .waterfall-row:last-child { border-bottom: none; }

    .waterfall-size {
      font-family: var(--font-doodle);
      font-size: 0.75rem;
      color: var(--gray-400);
      margin-bottom: var(--space-1);
    }

    .ig-mockup {
      width: 280px;
      height: 497px;
      background: var(--white);
      border: var(--border-lg);
      box-shadow: var(--shadow-xl);
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .ig-mockup__text {
      font-family: var(--font-display);
      font-style: italic;
      font-size: 2.5rem;
      text-align: center;
      padding: var(--space-4);
      line-height: 1.2;
    }
  `;
  page.appendChild(style);

  const layout = document.createElement('div');
  layout.className = 'preview-layout';

  // Sidebar
  const sidebar = document.createElement('div');
  sidebar.className = 'preview-sidebar';
  sidebar.innerHTML = `
    <div>
      <span class="label">Your Fonts</span>
      <div class="preview-font-list" id="font-list">
        <div style="font-family:var(--font-doodle);color:var(--gray-400);padding:var(--space-3);">Loading...</div>
      </div>
      <button class="btn btn--sm btn--dashed" id="preview-draw-btn" style="font-family:var(--font-doodle);margin-top:var(--space-3);width:100%;">
        + Draw a new font
      </button>
    </div>

    <hr class="divider" />

    <div>
      <span class="label">Preview Text</span>
      <textarea class="input" id="preview-input" rows="3" style="resize:vertical;font-family:var(--font-doodle);" placeholder="Type to preview...">Hello Scribbleee!</textarea>
    </div>

    <div>
      <span class="label">Font Size</span>
      <div style="display:flex;align-items:center;gap:var(--space-3);">
        <input type="range" class="slider" id="preview-size" min="16" max="200" value="72" />
        <span style="font-family:var(--font-doodle);font-size:0.9rem;white-space:nowrap;" id="size-label">72px</span>
      </div>
    </div>

    <div>
      <span class="label">Colors</span>
      <div style="display:flex;gap:var(--space-3);align-items:center;">
        <div>
          <div style="font-size:0.75rem;font-family:var(--font-doodle);color:var(--gray-400);">Text</div>
          <input type="color" id="preview-color" value="#0d0d0d" style="width:52px;height:38px;border:var(--border);cursor:pointer;background:none;" />
        </div>
        <div>
          <div style="font-size:0.75rem;font-family:var(--font-doodle);color:var(--gray-400);">Background</div>
          <input type="color" id="preview-bg" value="#ffffff" style="width:52px;height:38px;border:var(--border);cursor:pointer;background:none;" />
        </div>
      </div>
    </div>

    <div>
      <span class="label">View Mode</span>
      <div style="display:flex;gap:var(--space-2);">
        <button class="btn btn--sm view-mode-btn btn--primary" data-mode="preview" style="font-family:var(--font-doodle);">Preview</button>
        <button class="btn btn--sm view-mode-btn" data-mode="waterfall" style="font-family:var(--font-doodle);">Waterfall</button>
        <button class="btn btn--sm view-mode-btn" data-mode="instagram" style="font-family:var(--font-doodle);">Instagram</button>
      </div>
    </div>

    <div id="download-section" style="display:none;">
      <hr class="divider" />
      <span class="label">Download Formats</span>
      <div style="display:flex;flex-direction:column;gap:var(--space-2);margin-bottom:var(--space-3);">
        <button class="btn btn--primary" id="sidebar-dl-ttf" style="font-family:var(--font-doodle);width:100%;justify-content:space-between;">
          <span>TTF Font</span><span style="font-size:0.75rem;opacity:0.8;">Desktop / Universal</span>
        </button>
        <button class="btn" id="sidebar-dl-otf" style="font-family:var(--font-doodle);width:100%;justify-content:space-between;">
          <span>OTF Font</span><span style="font-size:0.75rem;opacity:0.8;">Design Apps / Mac</span>
        </button>
        <button class="btn" id="sidebar-dl-woff2" style="font-family:var(--font-doodle);width:100%;justify-content:space-between;">
          <span>WOFF2 Font</span><span style="font-size:0.75rem;opacity:0.8;">Websites</span>
        </button>
      </div>
      <button class="btn btn--dashed" id="sidebar-dl-png" style="font-family:var(--font-doodle);width:100%;margin-bottom:var(--space-2);">
        Export Specimen PNG
      </button>
      <button class="btn" id="sidebar-edit-btn" style="font-family:var(--font-doodle);width:100%;">
        ✏️ Edit in Studio
      </button>
    </div>
  `;

  // Main
  const main = document.createElement('div');
  main.className = 'preview-main';
  main.innerHTML = `
    <div style="max-width:840px;margin:0 auto;">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:var(--space-5);flex-wrap:wrap;gap:var(--space-3);">
        <div>
          <span class="label">Live Type Tester</span>
          <h1 class="section-title" id="preview-heading">Select a font</h1>
        </div>
        <div id="font-badge" style="font-family:var(--font-doodle);font-size:0.85rem;padding:var(--space-2) var(--space-3);background:var(--white);border:var(--border);">
          Select font from sidebar
        </div>
      </div>

      <div class="preview-text-area" id="preview-area">
        <div style="font-family:var(--font-doodle);color:var(--gray-300);font-size:1.2rem;text-align:center;padding:var(--space-8);">
          Select a font from the sidebar to test your live typography
        </div>
      </div>

      <div style="margin-bottom:var(--space-5);">
        <span class="label">Sample texts</span>
        <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;" id="sample-texts"></div>
      </div>
    </div>
  `;

  layout.appendChild(sidebar);
  layout.appendChild(main);
  page.appendChild(layout);

  // State
  let currentProject = null;
  let viewMode = 'preview';
  let fontSize = 72;
  let textColor = '#0d0d0d';
  let bgColor   = '#ffffff';
  let previewText = 'Hello Scribbleee!';
  let activeFontFamily = `'Instrument Serif', serif`;

  // Sample texts
  const sampleContainer = main.querySelector('#sample-texts');
  SAMPLE_TEXTS.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'btn btn--sm';
    btn.textContent = t;
    btn.style.fontFamily = 'var(--font-doodle)';
    btn.addEventListener('click', () => {
      sidebar.querySelector('#preview-input').value = t;
      previewText = t;
      updatePreviewArea();
    });
    sampleContainer.appendChild(btn);
  });

  // Load projects
  getAllProjects().then(projects => {
    const fontList = sidebar.querySelector('#font-list');
    fontList.innerHTML = '';

    if (projects.length === 0) {
      fontList.innerHTML = `
        <div style="font-family:var(--font-doodle);color:var(--gray-400);padding:var(--space-3);text-align:center;">
          No saved fonts yet.<br>Go draw one!
        </div>`;
      return;
    }

    projects.forEach((p, i) => {
      const glyphCount = Object.keys(p.glyphs).filter(k => p.glyphs[k]?.svgPath).length;
      const item = document.createElement('div');
      item.className = 'preview-font-item';
      item.innerHTML = `
        <div class="preview-font-item__name">${p.name}</div>
        <div class="preview-font-item__meta">${glyphCount} glyphs · ${p.language || 'english'}</div>
      `;
      item.addEventListener('click', () => {
        sidebar.querySelectorAll('.preview-font-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        currentProject = p;
        main.querySelector('#preview-heading').textContent = p.name;
        main.querySelector('#font-badge').textContent = `${glyphCount} glyphs · ${p.language || 'english'}`;
        sidebar.querySelector('#download-section').style.display = 'block';

        // Inject live @font-face
        const styleId = `preview-fontface-${p.id}`;
        document.querySelectorAll('style[id^="preview-fontface-"]').forEach(el => el.remove());

        if (glyphCount > 0) {
          try {
            const dataURL = getFontDataURL(p);
            const styleEl = document.createElement('style');
            styleEl.id = styleId;
            const fontName = `live-font-${p.id}`;
            styleEl.textContent = `
              @font-face {
                font-family: '${fontName}';
                src: url('${dataURL}') format('truetype');
              }
            `;
            document.head.appendChild(styleEl);
            activeFontFamily = `'${fontName}', 'Instrument Serif', serif`;
          } catch (err) {
            activeFontFamily = `'Instrument Serif', serif`;
          }
        } else {
          activeFontFamily = `'Instrument Serif', serif`;
        }

        updatePreviewArea();
      });
      fontList.appendChild(item);

      if (i === 0) item.click();
    });
  });

  // Controls
  sidebar.querySelector('#preview-draw-btn').addEventListener('click', () => navigate('studio'));

  sidebar.querySelector('#preview-input').addEventListener('input', (e) => {
    previewText = e.target.value;
    updatePreviewArea();
  });

  sidebar.querySelector('#preview-size').addEventListener('input', (e) => {
    fontSize = parseInt(e.target.value);
    sidebar.querySelector('#size-label').textContent = `${fontSize}px`;
    updatePreviewArea();
  });

  sidebar.querySelector('#preview-color').addEventListener('input', (e) => {
    textColor = e.target.value;
    updatePreviewArea();
  });

  sidebar.querySelector('#preview-bg').addEventListener('input', (e) => {
    bgColor = e.target.value;
    updatePreviewArea();
  });

  sidebar.querySelectorAll('.view-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sidebar.querySelectorAll('.view-mode-btn').forEach(b => b.classList.remove('btn--primary'));
      btn.classList.add('btn--primary');
      viewMode = btn.dataset.mode;
      updatePreviewArea();
    });
  });

  // Downloads
  function guardDl(fn, label) {
    return () => {
      if (!currentProject) return;
      try {
        fn(currentProject);
        showToast(`${label} downloaded!`);
      } catch (e) {
        showToast('Draw at least a few glyphs first.');
      }
    };
  }
  sidebar.querySelector('#sidebar-dl-ttf').addEventListener('click', guardDl(downloadAsTTF, 'TTF'));
  sidebar.querySelector('#sidebar-dl-otf').addEventListener('click', guardDl(downloadAsOTF, 'OTF'));
  sidebar.querySelector('#sidebar-dl-woff2').addEventListener('click', guardDl(downloadAsWOFF2, 'WOFF2'));

  sidebar.querySelector('#sidebar-dl-png').addEventListener('click', () => {
    const area = main.querySelector('#preview-area');
    exportElementToPNG(area, `${currentProject?.name || 'Scribbleee'}-specimen.png`);
  });

  sidebar.querySelector('#sidebar-edit-btn')?.addEventListener('click', () => {
    if (!currentProject) return;
    navigate(`studio?project=${currentProject.id}`);
  });

  page._cleanup = () => {
    document.querySelectorAll('style[id^="preview-fontface-"]').forEach(el => el.remove());
  };

  function updatePreviewArea() {
    const area = main.querySelector('#preview-area');
    if (!currentProject) return;

    area.style.background = bgColor;

    if (viewMode === 'preview') {
      area.innerHTML = `
        <div style="
          font-family: ${activeFontFamily};
          font-style: normal;
          font-size: ${fontSize}px;
          color: ${textColor};
          line-height: 1.25;
          word-break: break-word;
          transition: color 0.2s, font-size 0.2s;
        ">${escapeHtml(previewText)}</div>
      `;
    } else if (viewMode === 'waterfall') {
      const sizes = [14, 20, 28, 40, 56, 72, 104];
      area.innerHTML = sizes.map(s => `
        <div class="waterfall-row">
          <div class="waterfall-size">${s}px</div>
          <div style="font-family:${activeFontFamily};font-size:${s}px;color:${textColor};line-height:1.25;">
            ${escapeHtml(previewText || currentProject.name || 'Scribbleee')}
          </div>
        </div>
      `).join('');
    } else if (viewMode === 'instagram') {
      area.innerHTML = `
        <div style="text-align:center;">
          <div style="font-family:var(--font-doodle);font-size:0.85rem;color:var(--gray-400);margin-bottom:var(--space-3);">
            Instagram Story Specimen (9:16)
          </div>
          <div class="ig-mockup" style="background:${bgColor};">
            <div class="ig-mockup__text" style="font-family:${activeFontFamily};font-style:normal;color:${textColor};">
              ${escapeHtml(previewText || currentProject.name)}
            </div>
          </div>
          <p style="font-family:var(--font-doodle);font-size:0.82rem;color:var(--gray-400);margin-top:var(--space-3);">
            Tip: Click "Export Specimen PNG" to save an image for Instagram!
          </p>
        </div>
      `;
    }
  }

  container.appendChild(page);
}

function exportElementToPNG(element, filename) {
  // Use canvas to draw simple snapshot if possible, or advise user
  try {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${element.offsetWidth}" height="${element.offsetHeight}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="background:${element.style.background || '#ffffff'};padding:24px;height:100%;box-sizing:border-box;">
            ${element.innerHTML}
          </div>
        </foreignObject>
      </svg>
    `;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = element.offsetWidth * 2;
      canvas.height = element.offsetHeight * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      ctx.fillStyle = element.style.background || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement('a');
      a.download = filename;
      a.href = canvas.toDataURL('image/png');
      a.click();
      showToast('Specimen exported as PNG!');
    };
    img.src = url;
  } catch (e) {
    showToast('Could not export PNG directly.');
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
