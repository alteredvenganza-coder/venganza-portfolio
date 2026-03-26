/**
 * Trigger Vercel Redeploy
 * POST /api/admin/deploy
 * Uses a Deploy Hook URL from Vercel project settings.
 */
import crypto from 'crypto';

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'av-secret-change-me';
const DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK;

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = parseCookies(req.headers.cookie);
  if (!verifyToken(cookies.av_admin_token)) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (!DEPLOY_HOOK) {
    return res.status(500).json({ error: 'VERCEL_DEPLOY_HOOK not configured. Add a Deploy Hook in Vercel project settings.' });
  }

  try {
    const response = await fetch(DEPLOY_HOOK, { method: 'POST' });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Deploy hook failed: ${response.status} ${text}`);
    }
    const data = await response.json();
    return res.status(200).json({ ok: true, deployment: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
