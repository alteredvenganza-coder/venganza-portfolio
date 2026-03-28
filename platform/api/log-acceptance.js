// POST /api/log-acceptance
// Logs ToS acceptance after signup. Called client-side with the user's session token.
import { createClient } from '@supabase/supabase-js';

const TOS_VERSION = 'v1.0';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, accepted_tos, accepted_liability_clause } = req.body || {};
  if (!email || !accepted_tos || !accepted_liability_clause) {
    return res.status(400).json({ error: 'Both checkboxes must be accepted' });
  }

  // Get user from auth token (optional — log even if token missing for timing reasons)
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  let userId = null;
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    const { data: { user } } = await supabase.auth.getUser(token);
    userId = user?.id || null;
  }

  // Extract IP
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    null;

  const { error } = await supabase.from('tos_acceptances').insert({
    user_id: userId,
    email,
    tos_version: TOS_VERSION,
    accepted_tos: true,
    accepted_liability_clause: true,
    ip_address: ip,
    user_agent: req.headers['user-agent'] || null,
  });

  if (error) {
    console.error('ToS log error:', error);
    // Don't fail the signup flow — just log the error
  }

  return res.status(200).json({ ok: true });
}
