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

  page.innerHTML = `
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
      border: 3px solid var(--black);
      border-radius: 20px;
      box-shadow: 5px 5px 0px var(--black);
      padding: var(--space-6);
      transition: transform 0.2s var(--ease-bounce), box-shadow 0.2s ease;
    }

    .feature-card:hover {
      transform: translate(-4px, -4px) rotate(-1deg);
      box-shadow: 8px 8px 0px var(--black);
      background: #fff8fb;
    }

    .feature-card__icon {
      font-size: 2.5rem;
      margin-bottom: var(--space-3);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      background: #fce7f3;
      border: 2px solid #000;
      border-radius: 14px;
      box-shadow: 2px 2px 0px #000;
      color: #ff1493;
    }

    .feature-card__title {
      font-family: var(--font-display);
      font-size: 1.6rem;
      font-weight: 700;
      margin-bottom: var(--space-2);
      color: var(--black);
    }

    .feature-card__desc {
      font-family: var(--font-doodle);
      font-size: 1.1rem;
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
      border: 3px solid var(--black);
      border-radius: 18px;
      box-shadow: 4px 4px 0px var(--black);
      padding: var(--space-5) var(--space-4);
      text-align: center;
      cursor: pointer;
      transition: transform 0.2s var(--ease-bounce), box-shadow 0.2s ease;
    }

    .template-card:hover {
      transform: translate(-3px, -3px) rotate(1deg);
      box-shadow: 6px 6px 0px var(--black);
      background: #fef08a;
    }

    .template-card__chars {
      font-family: var(--font-display);
      font-size: 2.5rem;
      font-style: italic;
      margin-bottom: var(--space-2);
      letter-spacing: -0.02em;
      color: #ff1493;
    }

    .template-card__name {
      font-family: var(--font-doodle);
      font-size: 1.15rem;
      font-weight: 800;
      margin-bottom: var(--space-1);
    }

    .template-card__desc {
      font-family: var(--font-doodle);
      font-size: 0.9rem;
      color: var(--gray-500);
    }

    /* ── Stats bar ──────────────────────────── */
    .stats-bar {
      background: #fff0f5;
      border-top: 4px solid #000;
      border-bottom: 4px solid #000;
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
  <section class="hero" style="background:#ffd1dc; border-bottom: 4px solid #000; padding: var(--space-12) var(--space-4) var(--space-12);">
    <div style="max-width: 940px; margin: 0 auto; position: relative;">
      <!-- Background floating vector shapes -->
      <div style="position:absolute; inset:0; pointer-events:none; opacity:0.35; display:flex; justify-content:space-around; align-items:center;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style="color:#ff1493; animation:floatUp 3s infinite ease-in-out;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" style="color:#ff1493;"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style="color:#000;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      </div>

      <!-- Labony Sur Creator Badge -->
      <div style="display:inline-block; background:#fff; border:3px solid #000; box-shadow:4px 4px 0px #000; border-radius:30px; padding:8px 22px; margin-bottom:20px; font-family:var(--font-doodle); font-size:1.2rem; font-weight:700; color:#000; position:relative; z-index:2;">
        ✨ A Creative Solo Project Made with Love by <span style="color:#ff1493; text-decoration:underline;">Labony Sur</span> ✨
      </div>

      <!-- Stop-Motion Flipbook Logo Text on ONE single line with NO white background -->
      <div style="padding: var(--space-4) 0 var(--space-8); display: flex; align-items: center; justify-content: center; position: relative; z-index: 2; width: 100%;">
        <h1 class="hero__title stopmotion-logo" id="hero-stopmotion-logo" style="margin:0; display:flex; flex-wrap:nowrap; justify-content:center; align-items:center; gap:clamp(1px, 1.2vw, 8px); font-size:clamp(1.8rem, 6.8vw, 5.5rem); line-height:1.1; white-space:nowrap;">
          <!-- Populated dynamically / animated at ~5.5 FPS -->
        </h1>
      </div>

      <!-- Subtitle and CTAs placed below the white box on the beautiful pink page -->
      <div style="margin-top: var(--space-8); position: relative; z-index: 2;">
        <p class="hero__sub" style="margin-bottom:var(--space-6); max-width:640px; font-family:var(--font-doodle); font-size:1.35rem; color:#222; line-height:1.5;">
          An independent creative typography studio built by <strong>Labony Sur</strong>. Draw custom English and Bangla handwriting fonts directly in your browser, decorate with adorable vector stamps, and download real TTF & OTF font files for free!
        </p>

        <div class="hero__ctas" style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center;">
          <button class="btn btn--cute-pink btn--lg" id="home-cta-draw" style="font-family:var(--font-doodle); font-size:1.35rem; font-weight:800; padding:14px 32px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="color:#ff1493;"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            Start Drawing Now
          </button>
          <button class="btn btn--cute-mint btn--lg" id="home-cta-library" style="font-family:var(--font-doodle); font-size:1.35rem; font-weight:800; padding:14px 32px;">
            Explore Fonts
          </button>
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
        <span class="feature-card__icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"/></svg></span>
        <h2 class="feature-card__title">Generate Real Fonts</h2>
        <p class="feature-card__desc">Download actual TTF, OTF, and WOFF2 files. Install them on your computer and use them in any app — Photoshop, Canva, Word, everywhere.</p>
      </div>
      <div class="feature-card anim-scale-in">
        <span class="feature-card__icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7C17 6.45 16.55 6 16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5Z"/></svg></span>
        <h2 class="feature-card__title">Instagram Export</h2>
        <p class="feature-card__desc">Animate your font text with wave, bounce, and typewriter effects. Export as a 1080×1920 Stories-ready video in one click.</p>
      </div>
      <div class="feature-card anim-scale-in">
        <span class="feature-card__icon" style="font-family:var(--font-doodle);font-size:1.8rem;">বর্ণ</span>
        <h2 class="feature-card__title">English + Bangla</h2>
        <p class="feature-card__desc">Full English character set plus Bangla consonants, vowels, and numerals. Create fonts for both languages in one project.</p>
      </div>
      <div class="feature-card anim-scale-in">
        <span class="feature-card__icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.88 15.76V14.3H11.1V15.76H12.88ZM12 6C10.07 6 8.5 7.57 8.5 9.5H10.1C10.1 8.45 10.95 7.6 12 7.6C13.05 7.6 13.9 8.45 13.9 9.5C13.9 10.55 13.05 11.4 12 11.4V13.3H13.8V11.83C15.01 11.19 15.8 9.94 15.8 8.5C15.8 7.12 14.68 6 13.3 6H12Z"/></svg></span>
        <h2 class="feature-card__title">Template Library</h2>
        <p class="feature-card__desc">6 pre-made letter style templates — Bubbly, Sketchy, Dainty, Bold Block, Cute Serif, and Wavy — to jump-start your creativity.</p>
      </div>
      <div class="feature-card anim-scale-in">
        <span class="feature-card__icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.44 4 16.08 4 12C4 11.38 4.08 10.79 4.21 10.21L9 15V16C9 17.1 9.9 18 11 18V19.93ZM17.9 17.39C17.64 16.58 16.9 16 16 16H15V13C15 12.45 14.55 12 14 12H8V10H10C10.55 10 11 9.55 11 9V7H13C14.1 7 15 6.1 15 5V4.59C17.93 5.78 20 8.65 20 12C20 14.08 19.2 15.97 17.9 17.39Z"/></svg></span>
        <h2 class="feature-card__title">Share With Everyone</h2>
        <p class="feature-card__desc">Publish your font to the community library. Anyone can find it and download it — no login, no friction, pure sharing joy.</p>
      </div>
    </div>
  </section>

  <!-- Template previews -->
  <div style="background:#fff0f5;border-top:4px solid #000;border-bottom:4px solid #000;padding:var(--space-10) 0;">
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
    <div class="footer__logo" style="display:flex; align-items:center; justify-content:center;">
      <img src="/Scribbleee.png" alt="Scribbleee App Logo" style="height:48px; width:auto; object-fit:contain;" />
    </div>
    <p class="footer__sub" style="font-size:1.05rem; line-height:1.5; max-width:600px; margin: 12px auto 0;">
      A creative solo independent project made with love by <strong>Labony Sur</strong>.<br />
      <span style="font-size:0.95rem; opacity:0.85;">Free for personal and creative use (not for commercial use). Draw something wonderful today!</span>
    </p>
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

  // ── Handcrafted Stop-Motion Flipbook Logo Engine (~5.5 FPS) ──
  const logoEl = page.querySelector('#hero-stopmotion-logo');
  if (logoEl) {
    const letters = [
      { char: 'S', stagger: 0, font: 'var(--font-display)', idx: 0 },
      { char: 'c', stagger: 2, font: 'var(--font-doodle)', idx: 1 },
      { char: 'r', stagger: 4, font: 'sans-serif', idx: 2 },
      { char: 'i', stagger: 1, font: 'Georgia, serif', idx: 3 },
      { char: 'b', stagger: 3, font: 'Impact, sans-serif', idx: 4 },
      { char: 'b', stagger: 0, font: 'monospace', idx: 5 },
      { char: 'l', stagger: 2, font: 'var(--font-doodle)', idx: 6 }, // Ultra fun unique 'l'
      { char: 'e', stagger: 4, font: 'var(--font-display)', idx: 7 },
      { char: 'e', stagger: 1, font: 'var(--font-doodle)', idx: 8 },
      { char: 'e', stagger: 3, font: 'monospace', idx: 9 },
    ];
    let currentFrame = 0;

    const svgHeart = `<svg width="12" height="12" viewBox="0 0 24 24" fill="#ff1493" style="display:inline-block;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
    const svgSparkle = `<svg width="12" height="12" viewBox="0 0 24 24" fill="#ff1493" style="display:inline-block;"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>`;

    function getVariantHTML(char, vIdx, letterIndex, customFont) {
      switch (vIdx) {
        case 0: // Base/Brutalist: High-contrast ink stamp with rotation
          if (letterIndex === 6) {
            return `<span style="font-family:${customFont}; font-weight:900; color:#000; display:inline-block; transform:rotate(-6deg) scale(1.1); text-decoration:underline; text-decoration-color:#ff1493; text-decoration-thickness:4px;">l</span>`;
          }
          return `<span style="font-family:${customFont}; font-weight:900; color:#000; display:inline-block; transform:${letterIndex % 2 === 0 ? 'rotate(-2deg)' : 'rotate(2deg)'};">${char}</span>`;
        case 1: // Princess Vector Aesthetic: Custom vector heart/sparkle accents
          if (char === 'i') return `<span style="display:inline-flex; flex-direction:column; align-items:center; line-height:1;">${svgHeart}<span style="font-family:${customFont}; font-weight:900; color:#000;">ı</span></span>`;
          if (letterIndex === 6) return `<span style="position:relative; display:inline-block; font-family:${customFont}; font-weight:900; color:#000; background:#fce7f3; padding:0 6px; border:2px solid #000; box-shadow:2px 2px 0 #000;">${char}<span style="position:absolute; top:-8px; right:-6px;">${svgSparkle}</span></span>`;
          return `<span style="position:relative; display:inline-block; font-family:${customFont}; font-weight:900; color:#ff1493; text-shadow:2px 2px 0px #000; transform:rotate(1deg);">${char}<span style="position:absolute; bottom:-6px; right:-4px;">${svgSparkle}</span></span>`;
        case 2: // Wobbly Scribble: Shaky distorted outline
          return `<span style="display:inline-block; font-family:${customFont}; font-weight:900; color:transparent; -webkit-text-stroke:2.5px #000; transform:rotate(-5deg) skewX(6deg) scale(1.05); filter:drop-shadow(2px 3px 0px #ff69b4);">${char}</span>`;
        case 3: // Dotted / Textured: Broken down dotted halftone
          return `<span style="display:inline-block; font-family:${customFont}; font-weight:900; color:transparent; -webkit-text-stroke:2px #000; background-image:radial-gradient(#ff1493 38%, transparent 39%); background-size:5px 5px; -webkit-background-clip:text; transform:rotate(3deg);">${char}</span>`;
        case 4: // Retro Pixel / Block: Boxed badge layout
          return `<span style="display:inline-block; font-family:${customFont}; font-weight:700; text-transform:uppercase; background:#000; color:#fff; padding:0 6px; box-shadow:3px 3px 0px #ff69b4; transform:scale(0.95) rotate(-1deg);">${char}</span>`;
        default:
          return `<span style="font-family:${customFont};">${char}</span>`;
      }
    }

    function renderStopMotion() {
      if (!logoEl.isConnected) return;
      logoEl.innerHTML = letters.map((item) => {
        const activeV = (currentFrame + item.stagger) % 5;
        return `<span style="display:inline-flex; align-items:center; justify-content:center; min-width:0.85em; height:1.3em;">${getVariantHTML(item.char, activeV, item.idx, item.font)}</span>`;
      }).join('');
      currentFrame = (currentFrame + 1) % 5;
    }

    renderStopMotion();
    const intervalId = setInterval(renderStopMotion, 180); // ~5.5 FPS slowed down handcrafted loop
  }

  page.prepend(createNav(navigate, 'home'));
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
