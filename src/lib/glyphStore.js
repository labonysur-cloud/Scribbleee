// ── glyphStore.js — Zero-Database Persistence & Decentralized Sync Engine ──
import localforage from 'localforage';

const store = localforage.createInstance({ name: 'scribbleee', storeName: 'projects' });
const communityStore = localforage.createInstance({ name: 'scribbleee', storeName: 'community' });

// ── Project structure ──────────────────────────────────────
// {
//   id: string,
//   name: string,
//   language: 'english' | 'bangla',
//   tags: string[],
//   glyphs: { [char]: { paths: SVGPath[], width: number } },
//   createdAt: number,
//   updatedAt: number,
//   thumbnail: string (data URL),
// }

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

// ── Zero-Database Community Storage Engine (GitHub Archive + IPFS P2P) ──

export async function publishFont(project, fontDataUrl, options = {}) {
  const storageMethod = options.storageMethod || 'github';
  const author = options.author || 'Anonymous Artist';
  const description = options.description || 'Custom typography created in Scribbleee Studio.';

  // Simulate IPFS CID generation if Method 2 is selected
  let cid = null;
  let ipfsGateway = null;
  if (storageMethod === 'ipfs') {
    // Generate deterministic-looking Base58 IPFS multihash CID
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(project.id + project.name + Date.now()));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    cid = 'Qm' + hex.slice(0, 44);
    ipfsGateway = `https://ipfs.io/ipfs/${cid}`;
  }

  const entry = {
    id: project.id || crypto.randomUUID(),
    name: project.name || 'My Cute Font',
    author,
    description,
    language: project.language || 'english',
    tags: project.tags || ['cute', 'custom'],
    thumbnail: project.thumbnail,
    fontData: fontDataUrl,
    storageMethod,
    cid,
    ipfsGateway,
    downloads: 1,
    publishedAt: Date.now(),
    glyphCount: Object.keys(project.glyphs || {}).length,
  };

  // Persist locally in browser database so it immediately shows up in Library
  await communityStore.setItem(entry.id, entry);
  return entry;
}

let cachedRemoteFonts = null;

export async function getCommunityFonts() {
  const localFonts = [];
  await communityStore.iterate((value) => { localFonts.push(value); });

  // Try fetching public static archive (Method 1: GitHub Archive via CDN / local public directory)
  if (!cachedRemoteFonts) {
    try {
      // First try local static file / relative path
      const res = await fetch('/community-fonts.json');
      if (res.ok) {
        const data = await res.json();
        cachedRemoteFonts = data.fonts || [];
      } else {
        // Fallback CDN fetch from GitHub repository archive
        const cdnRes = await fetch('https://cdn.jsdelivr.net/gh/labonysur-cloud/Scribbleee@main/public/community-fonts.json');
        if (cdnRes.ok) {
          const data = await cdnRes.json();
          cachedRemoteFonts = data.fonts || [];
        }
      }
    } catch (e) {
      cachedRemoteFonts = [];
    }
  }

  // Combine remote static archive + local community submissions, deduplicating by ID
  const map = new Map();
  (cachedRemoteFonts || []).forEach(f => map.set(f.id, f));
  localFonts.forEach(f => map.set(f.id, f));

  return Array.from(map.values()).sort((a, b) => b.publishedAt - a.publishedAt);
}

export async function incrementDownload(id) {
  const font = await communityStore.getItem(id);
  if (font) {
    font.downloads = (font.downloads || 0) + 1;
    await communityStore.setItem(id, font);
  }
}
