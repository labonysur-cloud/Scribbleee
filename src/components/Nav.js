// ── Nav component ────────────────────────────────────────────
export function createNav(navigate, activeRoute) {
  const nav = document.createElement('nav');
  nav.className = 'nav';

  nav.innerHTML = `
    <div class="nav__logo">
      <span style="display:inline-flex;align-items:baseline;gap:2px;">
        <span style="font-family:var(--font-display);font-size:1.7rem;letter-spacing:-0.05em;">Scribble</span><span style="font-family:var(--font-doodle);font-size:2rem;color:#555;line-height:1;">eee</span>
      </span>
    </div>
    <div class="nav__links">
      <button class="btn btn--ghost nav-link ${activeRoute === '' || activeRoute === 'home' ? 'nav-link--active' : ''}" id="nav-home">Home</button>
      <button class="btn btn--ghost nav-link ${activeRoute === 'studio' ? 'nav-link--active' : ''}" id="nav-studio">Draw</button>
      <button class="btn btn--ghost nav-link ${activeRoute === 'library' ? 'nav-link--active' : ''}" id="nav-library">Library</button>
      <button class="btn btn--primary ${activeRoute === 'studio' ? 'btn--ghost' : ''}" id="nav-cta" style="font-family:var(--font-doodle);font-size:1.05rem;">
        + Create Font
      </button>
    </div>
  `;

  // Active style
  nav.querySelectorAll('.nav-link').forEach(link => {
    if (link.classList.contains('nav-link--active')) {
      link.style.borderBottom = '3px solid var(--black)';
      link.style.fontWeight = '700';
    }
  });

  nav.querySelector('#nav-home').addEventListener('click', () => navigate(''));
  nav.querySelector('#nav-studio').addEventListener('click', () => navigate('studio'));
  nav.querySelector('#nav-library').addEventListener('click', () => navigate('library'));
  nav.querySelector('#nav-cta').addEventListener('click', () => navigate('studio'));

  return nav;
}
