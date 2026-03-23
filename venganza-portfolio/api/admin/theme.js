/**
 * Theme Config API
 * GET  /api/admin/theme — read current theme config
 * POST /api/admin/theme — save theme config
 *
 * Stores theme.json in the repo root with colors, fonts, texts, etc.
 */
import crypto from 'crypto';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_OWNER || 'alteredvenganza-coder';
const REPO_NAME = process.env.GITHUB_REPO || 'venganza-portfolio';
const BRANCH = 'main';
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
const THEME_PATH = 'venganza-portfolio/src/data/theme.json';
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'av-secret-change-me';

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(c => {
    const [key, ...val] = c.trim().split('=');
    cookies[key] = val.join('=');
  });
  return cookies;
}

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

const DEFAULT_THEME = {
  images: {
    heroLeft: '',
    heroRight: '',
    logo: '/logo.png',
    aboutHero: '',
    galleryBg: '',
    ogImage: '',
  },
  colors: {
    primary: '#7b1f24',
    background: '#f5f0eb',
    text: '#000000',
    accent: '#7b1f24',
  },
  fonts: {
    heading: 'Bebas Neue',
    body: 'Inter',
    mono: 'Space Mono',
  },
  texts: {
    siteTitle: 'Altered Venganza',
    subtitle: 'Multi-disciplinary studio made for brands that builds.',
    tagline: 'Premium branding • Custom designs • Pre-mades & softwares for fashion designers and creatives',
    location: 'Trieste, Italy / by Rare Martinez',
    premadeSubtitle1: 'Pre-made clothing renders • Production ready files',
    premadeSubtitle2: 'Fully alterable & customizable to your brand • Numbered & Ready to purchase',
  },
  instagram: {
    handle: 'alteredvenganza',
    hashtag: '#premade',
  },
  premadePrice: 200,
};

export default async function handler(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  if (!verifyToken(cookies.av_admin_token)) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });
  }

  try {
    if (req.method === 'GET') {
      try {
        const data = await githubFetch(`/contents/${THEME_PATH}?ref=${BRANCH}`);
        const content = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
        return res.status(200).json({ theme: { ...DEFAULT_THEME, ...content }, sha: data.sha });
      } catch (e) {
        // File doesn't exist yet, return defaults
        return res.status(200).json({ theme: DEFAULT_THEME, sha: null });
      }
    }

    if (req.method === 'POST') {
      const { theme, sha } = req.body;
      const content = JSON.stringify(theme, null, 2);

      const body = {
        message: 'Update theme configuration',
        content: Buffer.from(content, 'utf-8').toString('base64'),
        branch: BRANCH,
      };
      if (sha) body.sha = sha;

      const result = await githubFetch(`/contents/${THEME_PATH}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });

      return res.status(200).json({ ok: true, sha: result.content?.sha });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Theme API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
