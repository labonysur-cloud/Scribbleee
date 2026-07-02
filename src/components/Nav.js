// ── Nav component ────────────────────────────────────────────
export function createNav(navigate, activeRoute) {
  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.style.cssText = 'background: #fff0f5; border-bottom: 4px solid #000; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; box-shadow: 0 4px 0 rgba(0,0,0,0.08);';

  nav.innerHTML = `
    <div class="nav__logo" style="cursor:pointer; display:flex; align-items:center; gap:8px;" id="nav-logo-box">
      <div style="background:#000; color:#fff; padding:4px 10px; border-radius:12px; font-family:var(--font-display); font-weight:900; font-size:1.4rem; letter-spacing:-0.05em; border:2px solid #000; box-shadow:3px 3px 0 #ff69b4; transform:rotate(-2deg);">
        Scribble<span style="color:#ff69b4; font-style:italic;">eee</span>
      </div>
    </div>
    <div class="nav__links" style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
      <button class="btn btn--ghost nav-link ${activeRoute === '' || activeRoute === 'home' ? 'nav-link--active' : ''}" id="nav-home" style="font-family:var(--font-doodle); font-size:1.15rem; font-weight:700;">Home</button>
      <button class="btn btn--ghost nav-link ${activeRoute === 'studio' ? 'nav-link--active' : ''}" id="nav-studio" style="font-family:var(--font-doodle); font-size:1.15rem; font-weight:700;">Draw & Studio</button>
      <button class="btn btn--ghost nav-link ${activeRoute === 'library' ? 'nav-link--active' : ''}" id="nav-library" style="font-family:var(--font-doodle); font-size:1.15rem; font-weight:700;">Community Library</button>
      <button class="btn btn--cute-pink" id="nav-cta" style="font-family:var(--font-doodle); font-size:1.15rem; font-weight:800; display:inline-flex; align-items:center; gap:6px; padding: 6px 18px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="color:#ff1493;"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>
        Create Cute Font
      </button>
    </div>
  `;

  // Active style
  nav.querySelectorAll('.nav-link').forEach(link => {
    if (link.classList.contains('nav-link--active')) {
      link.style.background = '#fce7f3';
      link.style.border = '2px solid #000';
      link.style.boxShadow = '3px 3px 0 #000';
      link.style.transform = 'translateY(-2px)';
    }
  });

  nav.querySelector('#nav-logo-box').addEventListener('click', () => navigate(''));
  nav.querySelector('#nav-home').addEventListener('click', () => navigate(''));
  nav.querySelector('#nav-studio').addEventListener('click', () => navigate('studio'));
  nav.querySelector('#nav-library').addEventListener('click', () => navigate('library'));
  nav.querySelector('#nav-cta').addEventListener('click', () => navigate('studio'));

  return nav;
}
