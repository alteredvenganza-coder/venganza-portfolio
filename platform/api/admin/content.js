/**
 * Admin Content API — proxy to GitHub API (secrets stay server-side)
 * GET  /api/admin/content?action=list&path=...
 * GET  /api/admin/content?action=get&path=...
 * POST /api/admin/content — { action: "save", path, content, message, sha? }
 * POST /api/admin/content — { action: "delete", path, sha, message }
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_OWNER || 'alteredvenganza-coder';
const REPO_NAME = process.env.GITHUB_REPO || 'venganza-portfolio';
const BRANCH = 'main';
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(c => {
    const [key, ...val] = c.trim().split('=');
    cookies[key] = val.join('=');
  });
  return cookies;
}

// Inline token verify (avoid import issues in serverless)
import crypto from 'crypto';
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'av-secret-change-me';

function verifyToken(token) {
  if (!token) return null;
  try {
    const [payloadB64, sig] = token.split('.');
    const payload = Buffer.from(payloadB64, 'base64').toString();
    const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
    if (sig !== expected) return null;
    const data = JSON.parse(payload);
    if (Date.now() - data.iat > 24 * 60 * 60 * 1000) return null;
    return data;
  } catch { return null; }
}

function authCheck(req) {
  const cookies = parseCookies(req.headers.cookie);
  return verifyToken(cookies.av_admin_token);
}

async function githubFetch(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub ${res.status}: ${text}`);
  }
  return res.json();
}

export default async function handler(req, res) {
  if (!authCheck(req)) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });
  }

  try {
    // GET requests
    if (req.method === 'GET') {
      const { action, path } = req.query;

      if (action === 'list') {
        const data = await githubFetch(`/contents/${path}?ref=${BRANCH}`);
        return res.status(200).json(Array.isArray(data) ? data : []);
      }

      if (action === 'get') {
        const data = await githubFetch(`/contents/${path}?ref=${BRANCH}`);
        return res.status(200).json({
          content: Buffer.from(data.content, 'base64').toString('utf-8'),
          sha: data.sha,
        });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    // POST requests
    if (req.method === 'POST') {
      const { action, path, content, message, sha } = req.body;

      if (action === 'save') {
        const body = {
          message: message || 'Update content',
          content: Buffer.from(content, 'utf-8').toString('base64'),
          branch: BRANCH,
        };
        if (sha) body.sha = sha;

        const result = await githubFetch(`/contents/${path}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        return res.status(200).json({ ok: true, sha: result.content?.sha });
      }

      if (action === 'delete') {
        await githubFetch(`/contents/${path}`, {
          method: 'DELETE',
          body: JSON.stringify({ message: message || 'Delete content', sha, branch: BRANCH }),
        });
        return res.status(200).json({ ok: true });
      }

      if (action === 'upload') {
        // For binary files (images) — content is already base64
        const { base64 } = req.body;
        let existingSha = null;
        try {
          const existing = await githubFetch(`/contents/${path}?ref=${BRANCH}`);
          existingSha = existing.sha;
        } catch { /* doesn't exist */ }

        const body = {
          message: message || 'Upload file',
          content: base64,
          branch: BRANCH,
        };
        if (existingSha) body.sha = existingSha;

        const result = await githubFetch(`/contents/${path}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        return res.status(200).json({ ok: true, sha: result.content?.sha });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Content API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
