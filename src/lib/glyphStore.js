// ── glyphStore.js — Personal Projects (local) + Community Fonts (GitHub CDN) ──
import localforage from 'localforage';

// ── Personal project store (stays local — your drafts, your device) ──────────
const store = localforage.createInstance({ name: 'scribbleee', storeName: 'projects' });

// ── Community cache (local mirror of what's on GitHub, for offline fallback) ──
const communityCache = localforage.createInstance({ name: 'scribbleee', storeName: 'community_cache' });

// ── CDN URL for community-fonts.json (served from GitHub via jsDelivr) ────────
// jsDelivr adds a cache purge delay of ~24h; use ?t= timestamp-busting for reads
// after a fresh publish so the publisher sees their font immediately.
const CDN_META_URL = 'https://cdn.jsdelivr.net/gh/labonysur-cloud/Scribbleee@main/public/community-fonts.json';
const PUBLISH_API  = '/api/publish-font';

// ── Project CRUD (personal, local-only) ──────────────────────────────────────

export async function saveProject(project) {
  project.updatedAt = Date.now();
  if (!project.id) {
    project.id = crypto.randomUUID();
    project.createdAt = Date.now();
  }
  await store.setItem(project.id, project);
  return project;
}

export async function getProject(id) {
  return await store.getItem(id);
}

export async function getAllProjects() {
  const projects = [];
  await store.iterate((value) => { projects.push(value); });
  return projects.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteProject(id) {
  await store.removeItem(id);
}

export function createEmptyProject(name = 'My Cute Font', language = 'english') {
  return {
    id: null,
    name,
    language,
    tags: [],
    glyphs: {},
    createdAt: null,
    updatedAt: null,
    thumbnail: null,
  };
}

// ── Community Font Publishing (GitHub as backend — 100% free) ─────────────────
//
// Flow:
//   Browser → POST /api/publish-font (Vercel serverless fn, holds GITHUB_TOKEN)
//           → GitHub API commits TTF file + updates community-fonts.json
//           → jsDelivr CDN serves both to every visitor worldwide
//
// The Vercel function keeps the GitHub token secret — it never touches the browser.

export async function publishFont(project, fontDataUrl, options = {}) {
  const author      = (options.author      || 'Anonymous Artist').trim();
  const description = (options.description || 'Custom typography created in Scribbleee Studio.').trim();

  // Strip the "data:font/truetype;base64," prefix → raw base64 for GitHub API
  const base64Match = fontDataUrl.match(/^data:[^;]+;base64,(.+)$/);
  if (!base64Match) throw new Error('Invalid font data URL — expected base64 data URL.');
  const fontBase64 = base64Match[1];

  const fontId = project.id || crypto.randomUUID();

  const payload = {
    fontId,
    fontName:    project.name    || 'My Cute Font',
    author,
    description,
    language:    project.language || 'english',
    tags:        project.tags    || ['custom'],
    glyphCount:  Object.keys(project.glyphs || {}).filter(k => project.glyphs[k]?.strokes?.length > 0).length,
    thumbnail:   project.thumbnail || null,
    fontBase64,
  };

  const res = await fetch(PUBLISH_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Publish failed: ${res.status}`);
  }

  const result = await res.json();

  // Also save to local cache so the publisher sees their font instantly
  // (jsDelivr CDN may take a few minutes to propagate the new commit)
  await communityCache.setItem(result.entry.id, result.entry);

  return result.entry;
}

// ── Community Font Discovery (reads from GitHub via jsDelivr CDN) ─────────────
//
// Priority order:
//   1. jsDelivr CDN (the real shared community list from GitHub)
//   2. Local cache (fonts this device published, visible immediately after publish)
//   Deduplication by ID ensures no double entries.

export async function getCommunityFonts() {
  // 1. Read locally cached fonts (instantly published ones from this device)
  const localFonts = [];
  await communityCache.iterate((value) => { localFonts.push(value); });

  // 2. Fetch from jsDelivr CDN (the shared community list on GitHub)
  //    Add cache-busting only if we just published (within last 5 minutes)
  let remoteFonts = [];
  try {
    // Try with cache-bust first so publisher sees their font
    const bust = `?t=${Math.floor(Date.now() / 300000)}`; // changes every 5 min
    const res = await fetch(CDN_META_URL + bust);
    if (res.ok) {
      const data = await res.json();
      remoteFonts = Array.isArray(data.fonts) ? data.fonts : [];
    }
  } catch (_) {
    // Network error — fall back to local cache only
  }

  // 3. Merge: remote (CDN) + local cache, deduplicate by ID
  //    Local cache wins for same ID (has fontUrl set correctly)
  const map = new Map();
  remoteFonts.forEach(f => map.set(f.id, f));
  localFonts.forEach(f  => map.set(f.id, f));  // local overwrites remote on conflict

  return Array.from(map.values()).sort((a, b) => b.publishedAt - a.publishedAt);
}

// ── Download counter ──────────────────────────────────────────────────────────
// Updates local cache only (GitHub doesn't need a live counter for every download)
export async function incrementDownload(id) {
  const cached = await communityCache.getItem(id);
  if (cached) {
    cached.downloads = (cached.downloads || 0) + 1;
    await communityCache.setItem(id, cached);
  }
}
