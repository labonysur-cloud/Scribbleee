// ── glyphStore.js — IndexedDB persistence via localforage ──
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

// ── Community (shared fonts in same browser) ───────────────
export async function publishFont(project, fontDataUrl) {
  const entry = {
    id: project.id,
    name: project.name,
    language: project.language,
    tags: project.tags,
    thumbnail: project.thumbnail,
    fontData: fontDataUrl,
    downloads: 0,
    publishedAt: Date.now(),
    glyphCount: Object.keys(project.glyphs).length,
  };
  await communityStore.setItem(entry.id, entry);
  return entry;
}

export async function getCommunityFonts() {
  const fonts = [];
  await communityStore.iterate((value) => { fonts.push(value); });
  return fonts.sort((a, b) => b.publishedAt - a.publishedAt);
}

export async function incrementDownload(id) {
  const font = await communityStore.getItem(id);
  if (font) {
    font.downloads = (font.downloads || 0) + 1;
    await communityStore.setItem(id, font);
  }
}
