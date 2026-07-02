// ── Home Page ─────────────────────────────────────────────
import { createNav } from '../components/Nav.js';
import { getAllProjects, getCommunityFonts } from '../lib/glyphStore.js';

const TICKER_CHARS = 'Aa Bb Cc Dd Ee Ff Gg সব বই ক খ গ ঘ Hh Ii Jj ★ ✦ ♡ Kk Ll Mm ○ ◆ ☆ Nn Oo Pp অ আ ই ঈ ♪ ✿ Qq Rr Ss উ ঊ ★ Tt Uu Vv Ww Xx Yy Zz'.split(' ');

const TEMPLATE_PREVIEWS = [
  { style: 'Bubbly',    chars: 'ABC',  desc: 'Round, pillowy letters full of life' },
  { style: 'Sketchy',   chars: 'DEF',  desc: 'Rough hand-drawn outlines with personality' },
  { style: 'Dainty',    chars: 'GHI',  desc: 'Thin, elegant strokes like a love letter' },
  { style: 'Bold Block',chars: 'JKL',  desc: 'Chunky, powerful, impossible to ignore' },
  { style: 'Cute Serif',chars: 'MNO',  desc: 'Mini serifs with a sweet, bookish charm' },
  { style: 'Wavy',      chars: 'PQR',  desc: 'Flowing glyphs that dance on the baseline' },
];

export function renderHome(container, navigate) {
  const page = document.createElement('div');
  page.className = 'page';

  page.appendChild(createNav(navigate, 'home'));

  page.innerHTML += `
  <style>
    /* ── Hero ─────────────────────────────── */
    .hero {
      padding: var(--space-16) var(--space-6) var(--space-10);
      max-width: 1100px;
      margin: 0 auto;
      text-align: center;
      position: relative;
    }

    .hero__eyebrow {
      font-family: var(--font-doodle);
      font-size: 1.15rem;
      color: var(--gray-500);
      margin-bottom: var(--space-4);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
    }

    .hero__eyebrow::before,
    .hero__eyebrow::after {
      content: '';
      display: block;
      width: 60px;
      height: 2px;
      background: var(--gray-300);
    }

    .hero__title {
      font-family: var(--font-display);
      font-size: clamp(4rem, 10vw, 8rem);
      line-height: 0.95;
      letter-spacing: -0.05em;
      margin-bottom: var(--space-6);
      position: relative;
    }

    .hero__title .word-scribble {
      display: block;
    }

    .hero__title .word-eee {
      font-style: italic;
      font-size: 0.75em;
      color: var(--gray-500);
      display: block;
    }

    .hero__deco-star {
      position: absolute;
      font-size: 2rem;
      animation: floatUp 3s ease-in-out infinite;
      user-select: none;
    }

    .hero__sub {
      font-size: 1.2rem;
      color: var(--gray-500);
      max-width: 540px;
      margin: 0 auto var(--space-8);
      line-height: 1.6;
      font-family: var(--font-doodle);
      font-size: 1.25rem;
    }

    .hero__ctas {
      display: flex;
      gap: var(--space-4);
      justify-content: center;
      flex-wrap: wrap;
    }

    .hero__ctas .btn {
      font-family: var(--font-doodle);
      font-size: 1.2rem;
      padding: var(--space-4) var(--space-8);
    }

    /* ── Ticker ─────────────────────────────── */
    .ticker {
      border-top: var(--border);
      border-bottom: var(--border);
      background: var(--black);
      color: var(--white);
      padding: var(--space-3) 0;
      overflow: hidden;
      white-space: nowrap;
      margin: var(--space-10) 0;
    }

    .ticker__track {
      display: inline-flex;
      gap: var(--space-5);
      animation: ticker 18s linear infinite;
    }

    .ticker__item {
      font-family: var(--font-doodle);
      font-size: 1.5rem;
      font-weight: 700;
      display: inline-block;
      padding: 0 var(--space-3);
    }

    /* ── Features ───────────────────────────── */
    .features {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 var(--space-6) var(--space-10);
    }

    .features__label {
      font-family: var(--font-doodle);
      font-size: 1rem;
      color: var(--gray-400);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-align: center;
      margin-bottom: var(--space-6);
    }

    .features__grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--space-5);
    }

    .feature-card {
      background: var(--white);
      border: var(--border);
      box-shadow: var(--shadow);
      padding: var(--space-5);
      transition: transform 0.2s var(--ease-bounce), box-shadow 0.2s ease;
    }

    .feature-card:hover {
      transform: translate(-3px, -3px);
      box-shadow: var(--shadow-lg);
    }

    .feature-card__icon {
      font-size: 2.5rem;
      margin-bottom: var(--space-3);
      display: block;
    }

    .feature-card__title {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 400;
      margin-bottom: var(--space-2);
    }

    .feature-card__desc {
      font-family: var(--font-doodle);
      font-size: 1rem;
      color: var(--gray-500);
      line-height: 1.5;
    }

    /* ── Template Preview ───────────────────── */
    .templates-section {
      border-top: var(--border);
      padding: var(--space-10) var(--space-6);
      max-width: 1100px;
      margin: 0 auto;
    }

    .templates-title {
      text-align: center;
      margin-bottom: var(--space-8);
    }

    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: var(--space-4);
    }

    .template-card {
      background: var(--white);
      border: var(--border);
      box-shadow: var(--shadow-sm);
      padding: var(--space-4);
      text-align: center;
      cursor: pointer;
      transition: transform 0.2s var(--ease-bounce), box-shadow 0.2s ease;
    }

    .template-card:hover {
      transform: translate(-2px, -2px) rotate(-1deg);
      box-shadow: var(--shadow);
    }

    .template-card__chars {
      font-family: var(--font-display);
      font-size: 2.5rem;
      font-style: italic;
      margin-bottom: var(--space-2);
      letter-spacing: -0.02em;
    }

    .template-card__name {
      font-family: var(--font-doodle);
      font-size: 1rem;
      font-weight: 700;
      margin-bottom: var(--space-1);
    }

    .template-card__desc {
      font-family: var(--font-body);
      font-size: 0.75rem;
      color: var(--gray-400);
    }

    /* ── Stats bar ──────────────────────────── */
    .stats-bar {
      background: var(--cream-dark);
      border-top: var(--border);
      border-bottom: var(--border);
      padding: var(--space-6) var(--space-6);
      display: flex;
      justify-content: center;
      gap: var(--space-10);
      flex-wrap: wrap;
    }

    .stat {
      text-align: center;
    }

    .stat__number {
      font-family: var(--font-display);
      font-size: 3rem;
      line-height: 1;
      font-style: italic;
      letter-spacing: -0.04em;
    }

    .stat__label {
      font-family: var(--font-doodle);
      font-size: 0.95rem;
      color: var(--gray-500);
      margin-top: var(--space-1);
    }

    /* ── CTA section ────────────────────────── */
    .cta-section {
      max-width: 700px;
      margin: 0 auto;
      padding: var(--space-12) var(--space-6);
      text-align: center;
    }

    .cta-section__title {
      font-family: var(--font-display);
      font-size: clamp(2.5rem, 5vw, 4rem);
      line-height: 1.1;
      margin-bottom: var(--space-5);
      letter-spacing: -0.03em;
    }

    .cta-section__sub {
      font-family: var(--font-doodle);
      font-size: 1.2rem;
      color: var(--gray-500);
      margin-bottom: var(--space-6);
    }

    /* ── Footer ─────────────────────────────── */
    .footer {
      background: var(--black);
      color: var(--white);
      border-top: var(--border-lg);
      padding: var(--space-8) var(--space-6);
      text-align: center;
    }

    .footer__logo {
      font-family: var(--font-display);
      font-size: 2rem;
      font-style: italic;
      margin-bottom: var(--space-3);
    }

    .footer__sub {
      font-family: var(--font-doodle);
      font-size: 1rem;
      color: var(--gray-400);
    }
  </style>

  <!-- Hero -->
  <section class="hero" style="background:#FFF0F5; border-bottom: 4px solid #000; padding: var(--space-12) var(--space-4) var(--space-10);">
    <div style="max-width: 920px; margin: 0 auto; position: relative;">
      <!-- Background floating princess decorations -->
      <span class="hero__deco-star" style="top:10px;left:30px;color:#ff69b4;font-size:2.2rem;">♡</span>
      <span class="hero__deco-star" style="top:30px;right:40px;font-size:2rem;">🎀</span>
      <span class="hero__deco-star" style="bottom:20px;left:60px;font-size:1.8rem;">⭐️</span>
      <span class="hero__deco-star" style="bottom:50px;right:30px;color:#ff1493;font-size:2.4rem;">✦</span>

      <!-- Prominent centered Neo-Brutalist Banner -->
      <div style="background: #ffffff; border: 4px solid #000; box-shadow: 6px 6px 0px #000; padding: var(--space-8) var(--space-6); display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; z-index: 2;">
        
        <div style="display:inline-flex; align-items:center; gap:8px; background:#fce7f3; border:2px solid #000; box-shadow:2px 2px 0px #000; padding: 4px 14px; margin-bottom: var(--space-5);">
          <span style="font-family:var(--font-doodle); font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.1em; color:#000;">👑 Princess Brutalism Foundry</span>
          <span>⭐️</span>
        </div>

        <!-- 12 FPS Stop-Motion Flipbook Logo Text -->
        <h1 class="hero__title stopmotion-logo" id="hero-stopmotion-logo" style="margin-bottom:var(--space-4); display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:4px; font-size:clamp(2.8rem, 7vw, 5.8rem); line-height:1.1;">
          <!-- Populated dynamically / animated at 12 FPS -->
        </h1>

        <p class="hero__sub" style="margin-bottom:var(--space-6); max-width:600px;">
          The most adorable font creation studio on the planet.
          Draw custom English and Bangla fonts, generate real font files,
          and export Instagram-ready animations. No login ever.
        </p>

        <div class="hero__ctas">
          <button class="btn btn--primary btn--lg" id="home-cta-draw" style="font-family:var(--font-doodle);font-size:1.2rem; box-shadow: 4px 4px 0px #000;">
            Start Drawing
          </button>
          <button class="btn btn--lg" id="home-cta-library" style="font-family:var(--font-doodle);font-size:1.2rem; box-shadow: 4px 4px 0px #000;">
            Explore Fonts
          </button>
        </div>

        <div style="margin-top:var(--space-5); font-family:var(--font-doodle); font-size:0.78rem; background:#000; color:#ffb6c1; padding: 5px 14px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; box-shadow:3px 3px 0px #ff69b4;">
          12 FPS Pure-Code Stop-Motion Flipbook Loop • Zero Video Assets
        </div>
      </div>
    </div>
  </section>

  <!-- Ticker -->
  <div class="ticker" aria-hidden="true">
    <div class="ticker__track" id="ticker-track"></div>
  </div>

  <!-- Features -->
  <section class="features">
    <p class="features__label">what you can do</p>
    <div class="features__grid stagger">
      <div class="feature-card anim-scale-in">
        <span class="feature-card__icon" style="font-size:2rem;font-family:var(--font-display);font-style:italic;">A</span>
        <h2 class="feature-card__title">Draw Glyphs</h2>
        <p class="feature-card__desc">Sketch every letter freehand on a guided canvas with baseline, x-height, and cap-height helpers. Just like a real type designer.</p>
      </div>
      <div class="feature-card anim-scale-in">
        <span class="feature-card__icon">&#128196;</span>
        <h2 class="feature-card__title">Generate Real Fonts</h2>
        <p class="feature-card__desc">Download actual TTF, OTF, and WOFF2 files. Install them on your computer and use them in any app — Photoshop, Canva, Word, everywhere.</p>
      </div>
      <div class="feature-card anim-scale-in">
        <span class="feature-card__icon">&#128247;</span>
        <h2 class="feature-card__title">Instagram Export</h2>
        <p class="feature-card__desc">Animate your font text with wave, bounce, and typewriter effects. Export as a 1080×1920 Stories-ready video in one click.</p>
      </div>
      <div class="feature-card anim-scale-in">
        <span class="feature-card__icon" style="font-family:var(--font-doodle);">বর্ণ</span>
        <h2 class="feature-card__title">English + Bangla</h2>
        <p class="feature-card__desc">Full English character set plus Bangla consonants, vowels, and numerals. Create fonts for both languages in one project.</p>
      </div>
      <div class="feature-card anim-scale-in">
        <span class="feature-card__icon">&#128204;</span>
        <h2 class="feature-card__title">Template Library</h2>
        <p class="feature-card__desc">6 pre-made letter style templates — Bubbly, Sketchy, Dainty, Bold Block, Cute Serif, and Wavy — to jump-start your creativity.</p>
      </div>
      <div class="feature-card anim-scale-in">
        <span class="feature-card__icon">&#127760;</span>
        <h2 class="feature-card__title">Share With Everyone</h2>
        <p class="feature-card__desc">Publish your font to the community library. Anyone can find it and download it — no login, no friction, pure sharing joy.</p>
      </div>
    </div>
  </section>

  <!-- Template previews -->
  <div style="background:var(--cream-dark);border-top:var(--border);border-bottom:var(--border);padding:var(--space-10) 0;">
    <section class="templates-section" style="border:none;padding-top:0;padding-bottom:0;">
      <div class="templates-title">
        <span class="label">template styles</span>
        <h2 class="section-title">Six flavours of <em>beautiful</em></h2>
      </div>
      <div class="templates-grid" id="template-grid"></div>
      <div style="text-align:center;margin-top:var(--space-6);">
        <button class="btn" id="home-templates-cta" style="font-family:var(--font-doodle);font-size:1.1rem;">
          Use a template to start drawing
        </button>
      </div>
    </section>
  </div>

  <!-- Stats bar -->
  <div class="stats-bar" id="stats-bar">
    <div class="stat">
      <div class="stat__number" id="stat-fonts">0</div>
      <div class="stat__label">fonts created</div>
    </div>
    <div class="stat">
      <div class="stat__number">52</div>
      <div class="stat__label">glyphs per font</div>
    </div>
    <div class="stat">
      <div class="stat__number">3</div>
      <div class="stat__label">download formats</div>
    </div>
    <div class="stat">
      <div class="stat__number">2</div>
      <div class="stat__label">languages</div>
    </div>
  </div>

  <!-- Final CTA -->
  <section class="cta-section">
    <h2 class="cta-section__title">
      Your handwriting deserves to be a <em>font</em>
    </h2>
    <p class="cta-section__sub">
      No design experience needed. No account required. Just open the studio and start drawing.
    </p>
    <button class="btn btn--primary btn--lg" id="home-final-cta" style="font-family:var(--font-doodle);font-size:1.2rem;">
      Open the Drawing Studio
    </button>
  </section>

  <!-- squiggle -->
  <div class="squiggle-line" style="margin:0;"></div>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer__logo">Scribbleee</div>
    <p class="footer__sub">Made with love for creative people everywhere. Draw something wonderful today.</p>
  </footer>
  `;

  // ── Wire up events ──────────────────────────
  page.querySelector('#home-cta-draw').addEventListener('click', () => navigate('studio'));
  page.querySelector('#home-cta-library').addEventListener('click', () => navigate('library'));
  page.querySelector('#home-templates-cta').addEventListener('click', () => navigate('studio'));
  page.querySelector('#home-final-cta').addEventListener('click', () => navigate('studio'));

  // Ticker
  const track = page.querySelector('#ticker-track');
  const tickerContent = [...TICKER_CHARS, ...TICKER_CHARS].map(c =>
    `<span class="ticker__item">${c}</span>`
  ).join('<span class="ticker__item" style="opacity:0.3;">|</span>');
  track.innerHTML = tickerContent;

  // Template grid
  const tGrid = page.querySelector('#template-grid');
  TEMPLATE_PREVIEWS.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'template-card anim-scale-in';
    card.style.animationDelay = `${i * 80}ms`;
    card.innerHTML = `
      <div class="template-card__chars">${t.chars}</div>
      <div class="template-card__name">${t.style}</div>
      <div class="template-card__desc">${t.desc}</div>
    `;
    card.addEventListener('click', () => {
      navigate(`studio?template=${encodeURIComponent(t.style.toLowerCase())}`);
    });
    tGrid.appendChild(card);
  });

  // Stats counter
  loadStats(page);

  // ── 12 FPS Stop-Motion Flipbook Logo Engine ──
  const logoEl = page.querySelector('#hero-stopmotion-logo');
  if (logoEl) {
    const letters = [
      { char: 'S', stagger: 0 },
      { char: 'c', stagger: 2 },
      { char: 'r', stagger: 4 },
      { char: 'i', stagger: 1 },
      { char: 'b', stagger: 3 },
      { char: 'b', stagger: 0 },
      { char: 'l', stagger: 2 },
      { char: 'e', stagger: 4 },
      { char: 'e', stagger: 1 },
      { char: 'e', stagger: 3 },
    ];
    let currentFrame = 0;

    function getVariantHTML(char, vIdx) {
      switch (vIdx) {
        case 0: // Base/Brutalist: Ultra-thick solid black
          return `<span style="font-family:var(--font-display); font-weight:900; color:#000; display:inline-block;">${char}</span>`;
        case 1: // Princess Aesthetic: Pink hearts ♡, bows 🎀, stars ⭐️
          if (char === 'i') return `<span style="display:inline-flex; flex-direction:column; align-items:center; line-height:1;"><span style="color:#ec4899; font-size:0.45em;">♡</span><span style="font-family:var(--font-display); font-weight:900; color:#000;">ı</span></span>`;
          if (char === 'e') return `<span style="position:relative; display:inline-block; font-family:var(--font-display); font-weight:900; color:#000;">${char}<span style="position:absolute; top:-12px; right:-8px; font-size:0.35em;">🎀</span></span>`;
          if (char === 'S') return `<span style="position:relative; display:inline-block; font-family:var(--font-display); font-weight:900; color:#000;">${char}<span style="position:absolute; top:-12px; left:-8px; font-size:0.35em;">👑</span></span>`;
          return `<span style="position:relative; display:inline-block; font-family:var(--font-display); font-weight:900; color:#ec4899; text-shadow:3px 3px 0px #000;">${char}<span style="position:absolute; bottom:-6px; right:-4px; font-size:0.3em;">✨</span></span>`;
        case 2: // Wobbly Scribble: Shaky distorted outline
          return `<span style="display:inline-block; font-family:var(--font-doodle); font-weight:900; color:transparent; -webkit-text-stroke:3px #000; transform:rotate(-3deg) skewX(6deg) scale(1.05); filter:drop-shadow(2px 3px 0px #ff69b4);">${char}</span>`;
        case 3: // Dotted / Textured: Broken down dotted strokes
          return `<span style="display:inline-block; font-family:var(--font-display); font-weight:900; color:transparent; -webkit-text-stroke:2.5px #000; background-image:radial-gradient(#ff1493 35%, transparent 36%); background-size:6px 6px; -webkit-background-clip:text; transform:rotate(2deg);">${char}</span>`;
        case 4: // Retro Pixel / Block: Stepped blocky layout
          return `<span style="display:inline-block; font-family:monospace; font-weight:700; text-transform:uppercase; background:#000; color:#fff; padding:0 4px; box-shadow:3px 3px 0px #ff69b4; transform:scale(0.92);">${char}</span>`;
        default:
          return `<span>${char}</span>`;
      }
    }

    function renderStopMotion() {
      if (!logoEl.isConnected) return;
      logoEl.innerHTML = letters.map((item) => {
        const activeV = (currentFrame + item.stagger) % 5;
        return `<span style="display:inline-flex; align-items:center; justify-content:center; min-width:0.85em; height:1.2em;">${getVariantHTML(item.char, activeV)}</span>`;
      }).join('');
      currentFrame = (currentFrame + 1) % 5;
    }

    renderStopMotion();
    const intervalId = setInterval(renderStopMotion, 83); // ~12 FPS
  }

  container.appendChild(page);
}

async function loadStats(page) {
  const projects = await getAllProjects();
  const community = await getCommunityFonts();
  const total = projects.length + community.length;
  const el = page.querySelector('#stat-fonts');
  if (el) {
    animateCounter(el, total || 12);
  }
}

function animateCounter(el, target) {
  let current = 0;
  const step = Math.ceil(target / 40);
  const interval = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(interval);
  }, 40);
}
