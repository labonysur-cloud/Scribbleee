// api/delete-font.js — Vercel Serverless Function
// Deletes a font file from GitHub repo + removes it from community-fonts.json
// Security: requires a delete key that only the original publisher received.
// The key is hashed (SHA-256) before storage — the raw key is never saved anywhere.

const REPO_OWNER = 'labonysur-cloud';
const REPO_NAME  = 'Scribbleee';
const BRANCH     = 'main';
const META_PATH  = 'public/community-fonts.json';
const FONTS_DIR  = 'public/fonts';

// ── GitHub REST API helper ─────────────────────────────────────────
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
      'User-Agent': 'Scribbleee-Font-Deleter/1.0',
    },
    body: body ? JSON.stringify(body) : null,
  });
  return res;
}

// ── SHA-256 hash of the delete key (Node.js crypto) ───────────────
async function sha256(text) {
  const { createHash } = await import('crypto');
  return createHash('sha256').update(text).digest('hex');
}

// ── Main handler ──────────────────────────────────────────────────
export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*')
                          .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
                          .setHeader('Access-Control-Allow-Headers', 'Content-Type')
                          .json({});
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { fontId, deleteKey } = req.body;

    if (!fontId || !deleteKey) {
      return res.status(400).json({ error: 'Missing fontId or deleteKey.' });
    }

    const safeId = fontId.replace(/[^a-z0-9_-]/gi, '_').slice(0, 64);

    // ── Step 1: Read current community-fonts.json ─────────────────
    const metaRes = await ghRequest(META_PATH);
    if (!metaRes.ok) {
      return res.status(404).json({ error: 'Community font list not found on GitHub.' });
    }

    const metaJson    = await metaRes.json();
    const metaSha     = metaJson.sha;
    let currentMeta;
    try {
      currentMeta = JSON.parse(atob(metaJson.content.replace(/\n/g, '')));
      if (!Array.isArray(currentMeta.fonts)) currentMeta.fonts = [];
    } catch (_) {
      return res.status(500).json({ error: 'Could not parse community-fonts.json.' });
    }

    // ── Step 2: Find the font entry ───────────────────────────────
    const fontEntry = currentMeta.fonts.find(f => f.id === safeId);
    if (!fontEntry) {
      return res.status(404).json({ error: 'Font not found in the community library.' });
    }

    // ── Step 3: Verify the delete key ────────────────────────────
    // We stored SHA-256(deleteKey) at publish time — compare hashes
    if (!fontEntry.deleteKeyHash) {
      return res.status(403).json({ error: 'This font was published before the delete feature existed. It cannot be deleted with a key.' });
    }

    const inputHash = await sha256(deleteKey.trim());
    if (inputHash !== fontEntry.deleteKeyHash) {
      return res.status(403).json({
        error: '❌ Wrong delete key. Only the original creator can delete this font.',
      });
    }

    const fontName = fontEntry.name;

    // ── Step 4: Delete the .ttf font file from GitHub ─────────────
    const fontPath    = `${FONTS_DIR}/${safeId}.ttf`;
    const fontFileRes = await ghRequest(fontPath);
    if (fontFileRes.ok) {
      const fontFile = await fontFileRes.json();
      const delRes = await ghRequest(fontPath, 'DELETE', {
        message: `🗑️ Delete font: "${fontName}"`,
        sha:     fontFile.sha,
        branch:  BRANCH,
      });
      if (!delRes.ok && delRes.status !== 404) {
        const errText = await delRes.text();
        throw new Error(`Failed to delete font file: ${errText}`);
      }
    }
    // If font file doesn't exist (404), continue anyway — still remove from JSON

    // ── Step 5: Remove entry from community-fonts.json ────────────
    currentMeta.fonts = currentMeta.fonts.filter(f => f.id !== safeId);

    await ghRequest(META_PATH, 'PUT', {
      message: `📚 Remove "${fontName}" from community library`,
      content: btoa(unescape(encodeURIComponent(JSON.stringify(currentMeta, null, 2)))),
      sha:     metaSha,
      branch:  BRANCH,
    });

    // ── Success ───────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: `Font "${fontName}" has been permanently deleted from GitHub and the community library.`,
    });

  } catch (err) {
    console.error('[delete-font] Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error.' });
  }
}
