// ── library.js — Vibrant Zero-Database Community Font Library ─────────────────────
import { createNav }                             from '../components/Nav.js';
import { getCommunityFonts, incrementDownload }  from '../lib/glyphStore.js';
import { showToast }                             from '../components/Toast.js';

export function renderLibrary(container, navigate) {
  const page = document.createElement('div');
  page.className = 'page';

  const style = document.createElement('style');
  style.textContent = `
    .library-header {
      padding: var(--space-8) var(--space-6) var(--space-4);
      max-width: 1150px;
      margin: 0 auto;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .zero-db-banner {
      max-width: 1150px;
      margin: 0 auto var(--space-6);
      background: var(--white);
      border: var(--border);
      box-shadow: var(--shadow);
      padding: var(--space-5) var(--space-6);
    }

    .zero-db-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-5);
      margin-top: var(--space-4);
    }

    @media (max-width: 800px) {
      .zero-db-grid { grid-template-columns: 1fr; }
    }

    .zero-db-card {
      background: var(--cream);
      border: var(--border-sm);
      padding: var(--space-4);
      border-radius: 4px;
    }

    .zero-db-card h3 {
      font-family: var(--font-display);
      font-size: 1.3rem;
      margin-bottom: var(--space-2);
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .zero-db-card p {
      font-family: var(--font-doodle);
      font-size: 0.9rem;
      color: var(--gray-500);
      line-height: 1.45;
    }

    .library-filters {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
      padding: 0 var(--space-6) var(--space-5);
      max-width: 1150px;
      margin: 0 auto;
      align-items: center;
    }

    .filter-btn {
      font-family: var(--font-doodle);
      font-size: 0.92rem;
    }

    .filter-btn.active {
      background: var(--black);
      color: var(--white);
    }

    .font-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
      gap: var(--space-6);
      padding: 0 var(--space-6) var(--space-12);
      max-width: 1150px;
      margin: 0 auto;
    }

    .font-card {
      background: var(--white);
      border: var(--border);
      box-shadow: var(--shadow);
      overflow: hidden;
      transition: transform 0.2s var(--ease-bounce), box-shadow 0.2s ease;
      cursor: pointer;
      display: flex;
      flex-direction: column;
    }

    .font-card:hover {
      transform: translate(-4px, -4px);
      box-shadow: var(--shadow-lg);
    }

    .font-card__preview {
      height: 170px;
      background: var(--cream);
      border-bottom: var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-style: italic;
      font-size: 3.8rem;
      letter-spacing: -0.04em;
      color: var(--black);
      position: relative;
      overflow: hidden;
    }

    .storage-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      font-family: var(--font-doodle);
      font-size: 0.72rem;
      padding: 3px 8px;
      border: 1.5px solid var(--black);
      background: var(--white);
      box-shadow: 2px 2px 0px var(--black);
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 700;
      z-index: 2;
    }

    .font-card__body {
      padding: var(--space-4);
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .font-card__name {
      font-family: var(--font-display);
      font-size: 1.45rem;
      font-weight: 400;
      margin-bottom: 2px;
    }

    .font-card__author {
      font-family: var(--font-doodle);
      font-size: 0.85rem;
      color: var(--gray-400);
      margin-bottom: var(--space-3);
    }

    .font-card__desc {
      font-family: var(--font-doodle);
      font-size: 0.88rem;
      color: var(--gray-500);
      line-height: 1.35;
      margin-bottom: var(--space-3);
    }

    .font-card__meta {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
      margin-bottom: var(--space-4);
    }

    .font-card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: var(--space-3);
      border-top: var(--border-sm);
      border-style: dashed;
      margin-top: auto;
    }

    .font-card__stats {
      font-family: var(--font-doodle);
      font-size: 0.82rem;
      color: var(--gray-400);
    }

    .empty-state {
      text-align: center;
      padding: var(--space-16) var(--space-6);
      max-width: 500px;
      margin: 0 auto;
    }
  `;
  page.appendChild(style);

  page.innerHTML += `
    <div class="library-header">
      <div>
        <span class="label" style="background:#fce7f3; padding:4px 12px; border:2px solid #000; box-shadow:2px 2px 0 #000; font-family:var(--font-doodle); font-weight:800; border-radius:12px;">Community Foundry</span>
        <h1 class="section-title" style="margin-top:12px; font-size:clamp(2.5rem, 6vw, 4rem);">Open Font Ecosystem</h1>
      </div>
      <button class="btn btn--cute-pink" id="lib-create-btn" style="font-family:var(--font-doodle);font-size:1.15rem; font-weight:800; padding:10px 24px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="color:#ff1493;"><path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z"/></svg>
        Draw & Publish Font
      </button>
    </div>

    <div class="zero-db-banner card--cute-mint" style="max-width:1150px; margin:0 auto var(--space-6); padding:var(--space-6);">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--space-2);">
        <h2 style="font-family:var(--font-display);font-size:1.7rem; font-weight:900;">Welcome to our Creative Community</h2>
        <span style="font-family:var(--font-doodle);font-size:0.95rem; font-weight:700; background:#000; color:#fff; padding:4px 12px; border-radius:12px;">Free for Creative Use * Made by Labony Sur</span>
      </div>
      <p style="font-family:var(--font-doodle);font-size:1.05rem;margin-top:var(--space-3);line-height:1.6;color:var(--gray-700);">
        Explore authentic handwriting and typography created by independent creators around the world. Browse, download, and design custom projects with instant live preview. All fonts are instantly available and ready for creative inspiration!
      </p>
    </div>

    <div class="library-filters">
      <span style="font-family:var(--font-doodle);font-weight:700;margin-right:var(--space-2);font-size:1.1rem;">Filter:</span>
      <button class="btn btn--sm filter-btn active" data-filter="all">All Fonts</button>
      <span style="margin:0 var(--space-2);color:var(--gray-300);">|</span>
      <button class="btn btn--sm filter-btn" data-filter="english">English</button>
      <button class="btn btn--sm filter-btn" data-filter="bangla">Bangla</button>
      <button class="btn btn--sm filter-btn" data-filter="cute">cute</button>
      <button class="btn btn--sm filter-btn" data-filter="sketchy">sketchy</button>
    </div>

    <div class="font-grid" id="font-grid">
      <div style="grid-column:1/-1;text-align:center;padding:var(--space-8);font-family:var(--font-doodle);color:var(--gray-400);">
        Loading community fonts...
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
    allFonts = await getCommunityFonts();
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
          <div style="font-family:var(--font-display);font-style:italic;font-size:5rem;color:var(--gray-300);margin-bottom:var(--space-3);">Aa</div>
          <h2 style="font-family:var(--font-display);font-size:2rem;margin-bottom:var(--space-2);">No matching fonts</h2>
          <p style="font-family:var(--font-doodle);color:var(--gray-400);margin-bottom:var(--space-5);">
            Be the first artist to publish a font in this category!
          </p>
          <button class="btn btn--primary" id="empty-cta" style="font-family:var(--font-doodle);">Open Studio</button>
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

  page.prepend(createNav(navigate, 'library'));
  container.appendChild(page);
}

function createFontCard(font, index, navigate) {
  const card = document.createElement('article');
  card.className = 'font-card anim-scale-in';
  card.style.animationDelay = `${index * 50}ms`;

  const previewLetters = font.language === 'bangla' ? 'ক খ গ' : (font.name.slice(0, 3).toUpperCase() || 'ABC');
  const ago = timeAgo(font.publishedAt || Date.now());
  card.innerHTML = `
    <div class="font-card__preview">
      <span style="transition:transform 0.3s var(--ease-bounce);">${previewLetters}</span>
    </div>
    <div class="font-card__body">
      <h3 class="font-card__name">${font.name}</h3>
      <div class="font-card__author">by ${font.author || 'Anonymous'}</div>
      <p class="font-card__desc">${font.description || 'Custom font drawn in Scribbleee Studio.'}</p>
      <div class="font-card__meta">
        <span class="tag">${font.language === 'bangla' ? 'বাংলা' : 'English'}</span>
        ${(font.tags || []).slice(0, 3).map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
      <div class="font-card__footer">
        <div class="font-card__stats">
          ${font.glyphCount || 0} glyphs * ${font.downloads || 0} dl * ${ago}
        </div>
        <div style="display:flex;gap:var(--space-2);">
          <button class="btn btn--sm btn--cute-pink dl-btn" data-id="${font.id}" style="font-family:var(--font-doodle);font-weight:800;">
            Download
          </button>
        </div>
      </div>
    </div>
  `;

  card.querySelector('.dl-btn').addEventListener('click', async (e) => {
    e.stopPropagation();
    const btn = e.currentTarget;
    const id  = btn.dataset.id;

    // fontUrl = CDN link on GitHub (visible to everyone)
    // fontData = legacy local base64 blob (only visible to uploader)
    const downloadUrl = font.fontUrl || font.fontData;

    if (!downloadUrl) {
      showToast('Font file not available. Try drawing your own in Studio!');
      navigate('studio');
      return;
    }

    btn.textContent = 'Downloading…';
    btn.disabled = true;

    try {
      // Fetch the font bytes then trigger a local blob download.
      // This is required because cross-origin CDN URLs ignore the HTML
      // `download` attribute — browsers would just navigate instead.
      const res  = await fetch(downloadUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${font.name.replace(/[^a-z0-9_\-]/gi, '_')}.ttf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);

      await incrementDownload(id);
      showToast(`✅ Downloaded "${font.name}"!`);
    } catch (err) {
      console.error('[download]', err);
      showToast('Download failed. Font may still be propagating — try again in a minute!');
    } finally {
      btn.textContent = 'Download';
      btn.disabled = false;
    }
  });

  return card;
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}
