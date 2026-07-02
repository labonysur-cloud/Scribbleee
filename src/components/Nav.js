// ── Nav component ────────────────────────────────────────────
export function createNav(navigate, activeRoute) {
  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.style.cssText = 'background: #ffdfea; border-bottom: 4px solid #000; padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; position: sticky; top: 0; z-index: 1000; box-shadow: 0 4px 0 rgba(0,0,0,0.08);';

  const isHome = activeRoute === '' || activeRoute === 'home';
  const isStudio = activeRoute === 'studio';
  const isLibrary = activeRoute === 'library';

  nav.innerHTML = `
    <div class="nav__logo" style="cursor:pointer; display:flex; align-items:center;" id="nav-logo-box" onclick="window.scribbleee && window.scribbleee.navigate('')">
      <img src="/Scribbleee.png" alt="Scribbleee App Logo" style="height:clamp(36px, 6vw, 48px); width:auto; object-fit:contain; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform='scale(1)'" />
    </div>
    <div class="nav__links" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:center;">
      <button class="btn btn--ghost nav-link ${isHome ? 'nav-link--active' : ''}" id="nav-home" onclick="window.scribbleee && window.scribbleee.navigate('')" style="font-family:var(--font-doodle); font-size:1.05rem; font-weight:700; padding:6px 12px; ${isHome ? 'background:#fce7f3; border:2px solid #000; box-shadow:2px 2px 0 #000;' : ''}">Home</button>
      <button class="btn btn--ghost nav-link ${isStudio ? 'nav-link--active' : ''}" id="nav-studio" onclick="window.scribbleee && window.scribbleee.navigate('studio')" style="font-family:var(--font-doodle); font-size:1.05rem; font-weight:700; padding:6px 12px; ${isStudio ? 'background:#fce7f3; border:2px solid #000; box-shadow:2px 2px 0 #000;' : ''}">Studio</button>
      <button class="btn btn--ghost nav-link ${isLibrary ? 'nav-link--active' : ''}" id="nav-library" onclick="window.scribbleee && window.scribbleee.navigate('library')" style="font-family:var(--font-doodle); font-size:1.05rem; font-weight:700; padding:6px 12px; ${isLibrary ? 'background:#fce7f3; border:2px solid #000; box-shadow:2px 2px 0 #000;' : ''}">Library</button>
      <button class="btn btn--cute-pink" id="nav-cta" onclick="window.scribbleee && window.scribbleee.navigate('studio')" style="font-family:var(--font-doodle); font-size:1.05rem; font-weight:800; display:inline-flex; align-items:center; gap:4px; padding:6px 14px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="color:#ff1493;"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>
        + Create
      </button>
    </div>
  `;

  const logoBox = nav.querySelector('#nav-logo-box');
  const btnHome = nav.querySelector('#nav-home');
  const btnStudio = nav.querySelector('#nav-studio');
  const btnLibrary = nav.querySelector('#nav-library');
  const btnCta = nav.querySelector('#nav-cta');

  if (logoBox) logoBox.addEventListener('click', () => navigate(''));
  if (btnHome) btnHome.addEventListener('click', () => navigate(''));
  if (btnStudio) btnStudio.addEventListener('click', () => navigate('studio'));
  if (btnLibrary) btnLibrary.addEventListener('click', () => navigate('library'));
  if (btnCta) btnCta.addEventListener('click', () => navigate('studio'));

  return nav;
}
