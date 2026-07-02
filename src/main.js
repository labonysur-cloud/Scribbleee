import './styles/reset.css';
import './styles/tokens.css';
import './styles/neobrutalism.css';
import './styles/animations.css';

import { renderHome }    from './pages/home.js';
import { renderStudio }  from './pages/studio.js';
import { renderLibrary } from './pages/library.js';
import { renderPreview } from './pages/preview.js';
import { showToast }     from './components/Toast.js';

// ── Router ──────────────────────────────────
const ROUTES = {
  '':         renderHome,
  'home':     renderHome,
  'studio':   renderStudio,
  'library':  renderLibrary,
  'preview':  renderPreview,
};

function getRoute() {
  const hash = window.location.hash.replace('#/', '').replace('#', '') || '';
  return hash.split('?')[0];
}

function navigate(path) {
  window.location.hash = `#/${path}`;
}

function renderRoute() {
  const route = getRoute();
  const render = ROUTES[route] || renderHome;
  const app = document.getElementById('app');
  app.innerHTML = '';
  render(app, navigate);
}

window.addEventListener('hashchange', renderRoute);
window.addEventListener('load', renderRoute);

// Global nav helper available everywhere
window.scribbleee = { navigate, showToast };
