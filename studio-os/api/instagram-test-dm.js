// Test-DM endpoint: sends a one-off DM using stored credentials.
//
// POST /api/instagram-test-dm
//   Headers: Authorization: Bearer <Supabase access token>
//   Body:    { recipient_igsid: string, text: string }
//
// Used by the admin "Test DM" button to verify token + permissions before
// going live. Auth: Supabase JWT must resolve to the same user that owns
// the ig_credentials row.

import { createClient } from '@supabase/supabase-js';
import { loadCredentials, sendDm } from './instagram-webhook.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL ?? '', SERVICE_KEY ?? '', {
  auth: { persistSession: false },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  // Verify JWT
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'missing bearer token' });

  const { data: userData, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !userData?.user) return res.status(401).json({ error: 'invalid token' });

  // Body
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
  catch { return res.status(400).json({ error: 'invalid json' }); }

  const recipientIgsid = (body?.recipient_igsid ?? '').trim();
  const text           = (body?.text ?? '').trim();
  if (!recipientIgsid) return res.status(400).json({ error: 'recipient_igsid required' });
  if (!text)           return res.status(400).json({ error: 'text required' });

  // Load credentials and confirm ownership
  const creds = await loadCredentials();
  if (!creds) return res.status(400).json({ error: 'no credentials configured — fill the Setup card first' });
  if (creds.user_id !== userData.user.id) {
    return res.status(403).json({ error: 'credentials owner mismatch' });
  }
  if (!creds.page_access_token) return res.status(400).json({ error: 'page_access_token missing in credentials' });

  // Send
  const r = await sendDm(recipientIgsid, text, creds.page_access_token);
  if (!r.ok) return res.status(502).json({ error: r.error });
  return res.status(200).json({ ok: true });
}
