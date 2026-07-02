// ── GlyphGrid.js — character selector panel ──────────────────
const EN_UPPERCASE  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const EN_LOWERCASE  = 'abcdefghijklmnopqrstuvwxyz'.split('');
const EN_DIGITS     = '0123456789'.split('');
const EN_PUNCT      = `!?,.'";:-()`.split('');

const BN_CONSONANTS = 'কখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহ'.split('');
const BN_VOWELS     = 'অআইঈউঊঋএঐওঔ'.split('');
const BN_DIGITS     = '০১২৩৪৫৬৭৮৯'.split('');
const BN_MATRAS     = 'ািীুূেৈোৌংঃঁ'.split('');

const SECTIONS_EN = [
  { label: 'A–Z', chars: EN_UPPERCASE },
  { label: 'a–z', chars: EN_LOWERCASE },
  { label: '0–9', chars: EN_DIGITS },
  { label: 'Punctuation', chars: EN_PUNCT },
];

const SECTIONS_BN = [
  { label: 'ব্যঞ্জনবর্ণ (Consonants)', chars: BN_CONSONANTS },
  { label: 'স্বরবর্ণ (Vowels)', chars: BN_VOWELS },
  { label: '০–৯ (Digits)', chars: BN_DIGITS },
  { label: 'মাত্রা (Matras)', chars: BN_MATRAS },
];

export function createGlyphGrid(options = {}) {
  let language = options.language || 'english';
  let glyphs = options.glyphs || {};
  let selectedChar = options.selectedChar !== undefined ? options.selectedChar : 'A';
  const onSelect = options.onSelect;

  const sections = language === 'bangla' ? SECTIONS_BN : SECTIONS_EN;

  const panel = document.createElement('div');
  panel.className = 'glyph-grid-panel';
  panel.style.cssText = `
    width: 200px;
    flex-shrink: 0;
    overflow-y: auto;
    border: var(--border);
    background: var(--white);
    display: flex;
    flex-direction: column;
    height: 100%;
  `;

  function render() {
    panel.innerHTML = '';

    const progress = document.createElement('div');
    const allChars = sections.flatMap(s => s.chars);
    const drawn = allChars.filter(c => glyphs[c]?.svgPath).length;
    progress.style.cssText = `padding:var(--space-3);border-bottom:var(--border-sm);background:var(--cream);`;
    progress.innerHTML = `
      <div style="font-family:var(--font-doodle);font-size:0.85rem;color:var(--gray-500);margin-bottom:6px;">
        ${drawn}/${allChars.length} glyphs drawn
      </div>
      <div style="height:6px;background:var(--gray-200);border:var(--border-sm);overflow:hidden;">
        <div style="width:${(drawn/allChars.length*100).toFixed(1)}%;height:100%;background:var(--black);transition:width 0.4s var(--ease-out);"></div>
      </div>
    `;
    panel.appendChild(progress);

    sections.forEach(section => {
      const sectionEl = document.createElement('div');
      sectionEl.style.cssText = `border-bottom:var(--border-sm);`;

      const header = document.createElement('div');
      header.style.cssText = `
        font-family:var(--font-doodle);
        font-size:0.8rem;
        font-weight:700;
        color:var(--gray-400);
        letter-spacing:0.05em;
        text-transform:uppercase;
        padding:var(--space-2) var(--space-3);
        background:var(--cream);
      `;
      header.textContent = section.label;

      const grid = document.createElement('div');
      grid.style.cssText = `
        display:grid;
        grid-template-columns:repeat(4,1fr);
        gap:1px;
        background:var(--gray-200);
        border-top:1px solid var(--gray-200);
      `;

      section.chars.forEach(char => {
        const cell = document.createElement('button');
        const isDone = !!(glyphs[char]?.svgPath);
        const isActive = char === selectedChar;

        cell.style.cssText = `
          aspect-ratio:1;
          display:flex;
          align-items:center;
          justify-content:center;
          font-family:var(--font-doodle);
          font-size:1.15rem;
          cursor:pointer;
          border:none;
          background:${isActive ? 'var(--black)' : isDone ? 'var(--cream)' : 'var(--white)'};
          color:${isActive ? 'var(--white)' : 'var(--black)'};
          position:relative;
          transition:background 0.1s ease;
        `;
        cell.textContent = char;
        cell.title = `Draw "${char}"${isDone ? ' (done)' : ''}`;

        if (isDone && !isActive) {
          const dot = document.createElement('span');
          dot.style.cssText = `
            position:absolute;bottom:3px;right:3px;
            width:4px;height:4px;border-radius:50%;
            background:var(--gray-400);
          `;
          cell.appendChild(dot);
        }

        cell.addEventListener('click', () => {
          onSelect?.(char);
        });

        cell.addEventListener('mouseenter', () => {
          if (!isActive) cell.style.background = 'var(--gray-100)';
        });
        cell.addEventListener('mouseleave', () => {
          if (!isActive) cell.style.background = isDone ? 'var(--cream)' : 'var(--white)';
        });

        grid.appendChild(cell);
      });

      sectionEl.appendChild(header);
      sectionEl.appendChild(grid);
      panel.appendChild(sectionEl);
    });
  }

  render();

  return {
    element: panel,
    refresh(newGlyphs, newSelected) {
      if (newGlyphs) glyphs = newGlyphs;
      if (newSelected !== undefined) selectedChar = newSelected;
      render();
    },
  };
}

export function getAllCharsForLanguage(language) {
  const sections = language === 'bangla' ? SECTIONS_BN : SECTIONS_EN;
  return sections.flatMap(s => s.chars);
}
