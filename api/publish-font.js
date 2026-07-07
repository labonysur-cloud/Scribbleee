// api/publish-font.js — Vercel Serverless Function
// Acts as a secure bridge: Browser → This function → GitHub API → Repo
// The GITHUB_TOKEN secret never touches the browser.
// 100% Free: GitHub (free) + Vercel Hobby (free) + jsDelivr CDN (free)

const REPO_OWNER  = 'labonysur-cloud';
const REPO_NAME   = 'Scribbleee';
const BRANCH      = 'main';
const META_PATH   = 'public/community-fonts.json';
const FONTS_DIR   = 'public/fonts';

// ── GitHub REST API helper ────────────────────────────────────────
async function ghRequest(path, method = 'GET', body = null) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN env variable is not set on Vercel.');

  const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      'User-Agent': 'Scribbleee-Font-Publisher/1.0',
    },
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`GitHub API ${method} ${path} → ${res.status}: ${text}`);
  }
  return res;
}

// ── CORS headers (allows browser requests from any origin) ────────
function cors(res = {}) {
  return {
    ...res,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
      ...(res.headers || {}),
    },
  };
}

// ── Main handler ──────────────────────────────────────────────────
export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const {
      fontId,
      fontName,
      author,
      description,
      language,
      tags,
      glyphCount,
      thumbnail,
      fontBase64,   // raw base64 string of TTF binary (no data:... prefix)
    } = req.body;

    // ── Validate required fields ──────────────────────────────────
    if (!fontId || !fontName || !fontBase64) {
      return res.status(400).json({ error: 'Missing required fields: fontId, fontName, fontBase64' });
    }

    const safeId   = fontId.replace(/[^a-z0-9_-]/gi, '_').slice(0, 64);
    const fontPath = `${FONTS_DIR}/${safeId}.ttf`;
    const fontCdnUrl = `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${BRANCH}/${fontPath}`;

    // ── Step 1: Commit the TTF font file to GitHub repo ───────────
    // Check if file already exists (to get its SHA for update)
    let existingSha;
    const existingRes = await ghRequest(fontPath);
    if (existingRes.status === 200) {
      const existing = await existingRes.json();
      existingSha = existing.sha;
    }

    const fontCommitBody = {
      message: `🎨 Add font: "${fontName}" by ${author}`,
      content: fontBase64,
      branch: BRANCH,
    };
    if (existingSha) fontCommitBody.sha = existingSha;

    await ghRequest(fontPath, 'PUT', fontCommitBody);

    // ── Step 2: Read existing community-fonts.json ────────────────
    const metaRes = await ghRequest(META_PATH);
    let currentMeta = { version: '1.0.0', fonts: [] };
    let metaSha;

    if (metaRes.status === 200) {
      const metaJson = await metaRes.json();
      metaSha = metaJson.sha;
      try {
        currentMeta = JSON.parse(
          // GitHub returns base64 content with line breaks — clean them
          atob(metaJson.content.replace(/\n/g, ''))
        );
        if (!Array.isArray(currentMeta.fonts)) currentMeta.fonts = [];
      } catch (_) {
        currentMeta.fonts = [];
      }
    }

    // ── Step 3: Build the new font entry ──────────────────────────
    const newEntry = {
      id:           safeId,
      name:         fontName,
      author:       author    || 'Anonymous Artist',
      description:  description || 'Custom typography created in Scribbleee Studio.',
      language:     language  || 'english',
      tags:         tags      || ['custom'],
      glyphCount:   glyphCount || 0,
      thumbnail:    thumbnail || null,
      fontUrl:      fontCdnUrl,
      downloads:    0,
      publishedAt:  Date.now(),
      storageMethod: 'github',
    };

    // Remove old entry with same ID (re-publish scenario), add new one at top
    currentMeta.fonts = currentMeta.fonts.filter(f => f.id !== safeId);
    currentMeta.fonts.unshift(newEntry);

    // Keep max 200 fonts in the JSON to avoid file size explosion
    if (currentMeta.fonts.length > 200) {
      currentMeta.fonts = currentMeta.fonts.slice(0, 200);
    }

    // ── Step 4: Commit updated community-fonts.json ───────────────
    const metaCommitBody = {
      message: `📚 Update community library: add "${fontName}"`,
      content: btoa(unescape(encodeURIComponent(JSON.stringify(currentMeta, null, 2)))),
      branch:  BRANCH,
    };
    if (metaSha) metaCommitBody.sha = metaSha;

    await ghRequest(META_PATH, 'PUT', metaCommitBody);

    // ── Return success ─────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: `Font "${fontName}" published successfully!`,
      entry:   newEntry,
      cdnUrl:  fontCdnUrl,
    });

  } catch (err) {
    console.error('[publish-font] Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error.' });
  }
}
