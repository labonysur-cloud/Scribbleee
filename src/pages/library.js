// ── library.js — Vibrant Zero-Database Community Font Library ─────────────────────
import { createNav }                             from '../components/Nav.js';
import { getCommunityFonts, incrementDownload }  from '../lib/glyphStore.js';
import { showToast }                             from '../components/Toast.js';

export function renderLibrary(container, navigate) {
  const page = document.createElement('div');
  page.className = 'page';

  page.appendChild(createNav(navigate, 'library'));

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
        <span class="label">Zero-Database Community Foundry</span>
        <h1 class="section-title">Open Font Ecosystem 👑🎀</h1>
      </div>
      <button class="btn btn--primary" id="lib-create-btn" style="font-family:var(--font-doodle);font-size:1.05rem;">
        + Draw & Publish Font
      </button>
    </div>

    <div class="zero-db-banner">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--space-2);">
        <h2 style="font-family:var(--font-display);font-size:1.5rem;">🖤 How Our Database-Free Community Works</h2>
        <span style="font-family:var(--font-doodle);font-size:0.82rem;color:var(--gray-400);">No signups · No servers · 100% Free Forever</span>
      </div>
      <div class="zero-db-grid">
        <div class="zero-db-card">
          <h3>🌸 Method 1: GitHub-Driven Archive</h3>
          <p>
            Fonts are submitted directly into a public GitHub JSON file (<code>community-fonts.json</code>) via automated Pull Requests & serverless APIs. Our landing page reads this archive globally through lightning-fast CDNs like jsDelivr!
          </p>
        </div>
        <div class="zero-db-card">
          <h3>🪐 Method 2: IPFS P2P Network</h3>
          <p>
            When published to IPFS, the font binary is compiled in browser memory and pushed directly into decentralized nodes, generating a permanent, immutable Content Identifier (<code>CID</code>) link!
          </p>
        </div>
      </div>
    </div>

    <div class="library-filters">
      <span style="font-family:var(--font-doodle);font-weight:700;margin-right:var(--space-2);">Filter:</span>
      <button class="btn btn--sm filter-btn active" data-filter="all">All Fonts</button>
      <button class="btn btn--sm filter-btn" data-filter="github">🌸 GitHub Archive</button>
      <button class="btn btn--sm filter-btn" data-filter="ipfs">🪐 IPFS CIDs</button>
      <span style="margin:0 var(--space-2);color:var(--gray-300);">|</span>
      <button class="btn btn--sm filter-btn" data-filter="english">English</button>
      <button class="btn btn--sm filter-btn" data-filter="bangla">Bangla</button>
      <button class="btn btn--sm filter-btn" data-filter="cute">cute</button>
      <button class="btn btn--sm filter-btn" data-filter="sketchy">sketchy</button>
    </div>

    <div class="font-grid" id="font-grid">
      <div style="grid-column:1/-1;text-align:center;padding:var(--space-8);font-family:var(--font-doodle);color:var(--gray-400);">
        Fetching decentralized & static community archives...
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
      if (filter === 'github' || filter === 'ipfs') return f.storageMethod === filter;
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

  container.appendChild(page);
}

function createFontCard(font, index, navigate) {
  const card = document.createElement('article');
  card.className = 'font-card anim-scale-in';
  card.style.animationDelay = `${index * 50}ms`;

  const previewLetters = font.language === 'bangla' ? 'ক খ গ' : (font.name.slice(0, 3).toUpperCase() || 'ABC');
  const ago = timeAgo(font.publishedAt || Date.now());
  const storageMethod = font.storageMethod || 'github';

  const badgeHtml = storageMethod === 'ipfs'
    ? `<span class="storage-badge" style="background:#f3efe6;" title="Decentralized IPFS CID: ${font.cid || 'Qm...'}">🪐 IPFS P2P</span>`
    : `<span class="storage-badge" title="Public GitHub Archive via CDN">🌸 GitHub CDN</span>`;

  card.innerHTML = `
    <div class="font-card__preview">
      ${badgeHtml}
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
          ${font.glyphCount || 0} glyphs · ${font.downloads || 0} dl · ${ago}
        </div>
        <div style="display:flex;gap:var(--space-2);">
          ${font.ipfsGateway ? `<a href="${font.ipfsGateway}" target="_blank" class="btn btn--sm" style="font-family:var(--font-doodle);padding:4px 8px;" title="Open IPFS Gateway CID">🪐 Gateway</a>` : ''}
          <button class="btn btn--sm btn--primary dl-btn" data-id="${font.id}" style="font-family:var(--font-doodle);">
            Download
          </button>
        </div>
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
      a.download = `${font.name.replace(/\s+/g, '_')}.ttf`;
      a.click();
      showToast(`Downloaded "${font.name}"!`);
    } else {
      showToast(`Generating draft font for "${font.name}"... Try drawing your own in Studio!`);
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
  return `${days}d ago`;
}
