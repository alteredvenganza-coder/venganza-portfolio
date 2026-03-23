/**
 * Admin Auth API
 * POST /api/admin/auth — { action: "login", password } | { action: "verify" } | { action: "logout" }
 * Uses a simple token stored in cookie.
 */
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'av-secret-change-me';

function generateToken() {
  const payload = JSON.stringify({ role: 'admin', iat: Date.now() });
  const hmac = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64') + '.' + hmac;
}

function verifyToken(token) {
  if (!token) return null;
  try {
    const [payloadB64, sig] = token.split('.');
    const payload = Buffer.from(payloadB64, 'base64').toString();
    const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
    if (sig !== expected) return null;
    const data = JSON.parse(payload);
    // Token valid for 24 hours
    if (Date.now() - data.iat > 24 * 60 * 60 * 1000) return null;
    return data;
  } catch {
    return null;
  }
}

// Middleware helper — export for other routes
export { verifyToken };

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(c => {
    const [key, ...val] = c.trim().split('=');
    cookies[key] = val.join('=');
  });
  return cookies;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, password } = req.body || {};

  if (action === 'login') {
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Wrong password' });
    }
    const token = generateToken();
    res.setHeader('Set-Cookie', `av_admin_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
    return res.status(200).json({ ok: true, user: { email: 'admin@alteredvenganza.com', role: 'admin' } });
  }

  if (action === 'verify') {
    const cookies = parseCookies(req.headers.cookie);
    const data = verifyToken(cookies.av_admin_token);
    if (!data) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    return res.status(200).json({ ok: true, user: { email: 'admin@alteredvenganza.com', role: data.role } });
  }

  if (action === 'logout') {
    res.setHeader('Set-Cookie', 'av_admin_token=; Path=/; HttpOnly; Max-Age=0');
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: 'Invalid action' });
}
