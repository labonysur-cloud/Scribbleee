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
      <img src="/Scribbleee.png" alt="Scribbleee App Logo" style="height:52px; width:auto; object-fit:contain; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform='scale(1)'" />
    </div>
    <div class="nav__links" style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:center;">
      <button class="btn btn--ghost nav-link ${isHome ? 'nav-link--active' : ''}" id="nav-home" onclick="window.scribbleee && window.scribbleee.navigate('')" style="font-family:var(--font-doodle); font-size:1.15rem; font-weight:700; ${isHome ? 'background:#fce7f3; border:2px solid #000; box-shadow:3px 3px 0 #000; transform:translateY(-2px);' : ''}">Home</button>
      <button class="btn btn--ghost nav-link ${isStudio ? 'nav-link--active' : ''}" id="nav-studio" onclick="window.scribbleee && window.scribbleee.navigate('studio')" style="font-family:var(--font-doodle); font-size:1.15rem; font-weight:700; ${isStudio ? 'background:#fce7f3; border:2px solid #000; box-shadow:3px 3px 0 #000; transform:translateY(-2px);' : ''}">Draw & Studio</button>
      <button class="btn btn--ghost nav-link ${isLibrary ? 'nav-link--active' : ''}" id="nav-library" onclick="window.scribbleee && window.scribbleee.navigate('library')" style="font-family:var(--font-doodle); font-size:1.15rem; font-weight:700; ${isLibrary ? 'background:#fce7f3; border:2px solid #000; box-shadow:3px 3px 0 #000; transform:translateY(-2px);' : ''}">Community Library</button>
      <button class="btn btn--cute-pink" id="nav-cta" onclick="window.scribbleee && window.scribbleee.navigate('studio')" style="font-family:var(--font-doodle); font-size:1.15rem; font-weight:800; display:inline-flex; align-items:center; gap:6px; padding: 6px 18px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="color:#ff1493;"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>
        Create Cute Font
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
