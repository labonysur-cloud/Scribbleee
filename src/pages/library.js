// ── library.js — Community font library ─────────────────────
import { createNav }         from '../components/Nav.js';
import { getCommunityFonts, incrementDownload } from '../lib/glyphStore.js';
import { showToast }         from '../components/Toast.js';

const SAMPLE_FONTS = [
  { id: 'sample-1', name: 'Bubbly Dreams',   language: 'english', tags: ['bubbly','cute','round'],   downloads: 142, glyphCount: 52, publishedAt: Date.now() - 86400000 * 3 },
  { id: 'sample-2', name: 'Sketch Rush',     language: 'english', tags: ['sketchy','rough','bold'],   downloads: 87,  glyphCount: 30, publishedAt: Date.now() - 86400000 * 7 },
  { id: 'sample-3', name: 'বর্ণমালা',        language: 'bangla',  tags: ['bangla','clean','display'], downloads: 63,  glyphCount: 44, publishedAt: Date.now() - 86400000 * 2 },
  { id: 'sample-4', name: 'Dainty Script',   language: 'english', tags: ['dainty','thin','elegant'],  downloads: 214, glyphCount: 52, publishedAt: Date.now() - 86400000 * 14 },
  { id: 'sample-5', name: 'Bold Blocks',     language: 'english', tags: ['bold','block','display'],  downloads: 39,  glyphCount: 26, publishedAt: Date.now() - 86400000 },
  { id: 'sample-6', name: 'Cute Serif',      language: 'english', tags: ['serif','cute','classic'],  downloads: 176, glyphCount: 52, publishedAt: Date.now() - 86400000 * 5 },
];

export function renderLibrary(container, navigate) {
  const page = document.createElement('div');
  page.className = 'page';

  page.appendChild(createNav(navigate, 'library'));

  const style = document.createElement('style');
  style.textContent = `
    .library-header {
      padding: var(--space-10) var(--space-6) var(--space-6);
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .library-filters {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
      padding: 0 var(--space-6) var(--space-5);
      max-width: 1100px;
      margin: 0 auto;
    }

    .filter-btn {
      font-family: var(--font-doodle);
      font-size: 0.95rem;
    }

    .filter-btn.active {
      background: var(--black);
      color: var(--white);
    }

    .font-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--space-5);
      padding: 0 var(--space-6) var(--space-10);
      max-width: 1100px;
      margin: 0 auto;
    }

    .font-card {
      background: var(--white);
      border: var(--border);
      box-shadow: var(--shadow);
      overflow: hidden;
      transition: transform 0.2s var(--ease-bounce), box-shadow 0.2s ease;
      cursor: pointer;
    }

    .font-card:hover {
      transform: translate(-3px, -3px);
      box-shadow: var(--shadow-lg);
    }

    .font-card__preview {
      height: 160px;
      background: var(--cream);
      border-bottom: var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-style: italic;
      font-size: 4rem;
      letter-spacing: -0.05em;
      color: var(--black);
      position: relative;
      overflow: hidden;
    }

    .font-card__preview-text {
      transform-origin: center;
      transition: transform 0.3s var(--ease-bounce);
    }

    .font-card:hover .font-card__preview-text {
      transform: scale(1.1);
    }

    .font-card__body {
      padding: var(--space-4);
    }

    .font-card__name {
      font-family: var(--font-display);
      font-size: 1.4rem;
      font-weight: 400;
      margin-bottom: var(--space-2);
    }

    .font-card__meta {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
      margin-bottom: var(--space-3);
    }

    .font-card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: var(--space-3);
      border-top: var(--border-sm);
      border-style: dashed;
    }

    .font-card__stats {
      font-family: var(--font-doodle);
      font-size: 0.85rem;
      color: var(--gray-400);
    }

    .empty-state {
      text-align: center;
      padding: var(--space-16) var(--space-6);
      max-width: 500px;
      margin: 0 auto;
    }

    .empty-state__icon {
      font-family: var(--font-display);
      font-style: italic;
      font-size: 6rem;
      color: var(--gray-300);
      margin-bottom: var(--space-4);
    }
  `;
  page.appendChild(style);

  page.innerHTML += `
    <div class="library-header">
      <div>
        <span class="label">Community Library</span>
        <h1 class="section-title">Fonts made with <em>love</em></h1>
      </div>
      <button class="btn btn--primary" id="lib-create-btn" style="font-family:var(--font-doodle);font-size:1.05rem;">
        + Draw Your Own
      </button>
    </div>

    <div class="library-filters">
      <button class="btn btn--sm filter-btn active" data-filter="all">All fonts</button>
      <button class="btn btn--sm filter-btn" data-filter="english">English</button>
      <button class="btn btn--sm filter-btn" data-filter="bangla">Bangla</button>
      <span style="margin:0 var(--space-2);color:var(--gray-300);">|</span>
      <button class="btn btn--sm filter-btn" data-filter="cute">cute</button>
      <button class="btn btn--sm filter-btn" data-filter="bold">bold</button>
      <button class="btn btn--sm filter-btn" data-filter="sketchy">sketchy</button>
      <button class="btn btn--sm filter-btn" data-filter="display">display</button>
    </div>

    <div class="font-grid" id="font-grid">
      <div style="grid-column:1/-1;text-align:center;padding:var(--space-8);font-family:var(--font-doodle);color:var(--gray-400);">
        Loading fonts...
      </div>
    </div>
  `;

  page.querySelector('#lib-create-btn').addEventListener('click', () => navigate('studio'));

  // Filter logic
  let activeFilter = 'all';
  page.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      page.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderGrid(allFonts, activeFilter);
    });
  });

  let allFonts = [];
  loadFonts();

  async function loadFonts() {
    const community = await getCommunityFonts();
    allFonts = [...SAMPLE_FONTS, ...community];
    renderGrid(allFonts, activeFilter);
  }

  function renderGrid(fonts, filter) {
    const grid = page.querySelector('#font-grid');
    grid.innerHTML = '';

    const filtered = filter === 'all' ? fonts : fonts.filter(f => {
      if (filter === 'english' || filter === 'bangla') return f.language === filter;
      return f.tags?.includes(filter);
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="empty-state__icon">Aa</div>
          <h2 style="font-family:var(--font-display);font-size:2rem;margin-bottom:var(--space-3);">No fonts yet</h2>
          <p style="font-family:var(--font-doodle);color:var(--gray-400);margin-bottom:var(--space-5);">
            Be the first to create a font with this style!
          </p>
          <button class="btn btn--primary" id="empty-cta" style="font-family:var(--font-doodle);">Start Drawing</button>
        </div>
      `;
      grid.querySelector('#empty-cta')?.addEventListener('click', () => navigate('studio'));
      return;
    }

    filtered.forEach((font, i) => {
      const card = createFontCard(font, i, navigate);
      grid.appendChild(card);
    });
  }

  container.appendChild(page);
}

function createFontCard(font, index, navigate) {
  const card = document.createElement('article');
  card.className = 'font-card anim-scale-in';
  card.style.animationDelay = `${index * 60}ms`;

  const previewLetters = font.language === 'bangla' ? 'ক খ গ' : font.name.slice(0, 3);
  const ago = timeAgo(font.publishedAt);
  const isSample = font.id?.startsWith('sample');

  card.innerHTML = `
    <div class="font-card__preview">
      <span class="font-card__preview-text">${previewLetters}</span>
      ${isSample ? '<span style="position:absolute;top:8px;right:8px;font-family:var(--font-doodle);font-size:0.7rem;background:var(--black);color:var(--white);padding:2px 6px;">SAMPLE</span>' : ''}
    </div>
    <div class="font-card__body">
      <h3 class="font-card__name">${font.name}</h3>
      <div class="font-card__meta">
        <span class="tag">${font.language === 'bangla' ? 'বাংলা' : 'English'}</span>
        ${(font.tags || []).slice(0, 2).map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
      <div class="font-card__footer">
        <div class="font-card__stats">
          ${font.glyphCount || 0} glyphs &nbsp;·&nbsp; ${font.downloads || 0} downloads &nbsp;·&nbsp; ${ago}
        </div>
        <button class="btn btn--sm btn--primary dl-btn" data-id="${font.id}" style="font-family:var(--font-doodle);">
          Download
        </button>
      </div>
    </div>
  `;

  card.querySelector('.dl-btn').addEventListener('click', async (e) => {
    e.stopPropagation();
    const id = e.target.dataset.id;
    await incrementDownload(id);

    if (font.fontData) {
      const a = document.createElement('a');
      a.href = font.fontData;
      a.download = `${font.name}.ttf`;
      a.click();
      showToast(`Downloaded "${font.name}"!`);
    } else {
      showToast(`"${font.name}" is a sample. Draw your own in the studio!`);
      navigate('studio');
    }
  });

  return card;
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}
