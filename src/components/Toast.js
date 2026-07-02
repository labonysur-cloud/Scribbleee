// ── Toast notification component ────────────
let container = null;

function getContainer() {
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message, duration = 3000) {
  const c = getContainer();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  c.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastIn 0.3s ease reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
