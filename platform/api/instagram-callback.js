// GET /api/instagram-callback?code=...&state=<creatorUserId>
// Handles Instagram OAuth redirect — exchanges code for long-lived token,
// fetches the username, and saves both to the creator's Supabase row.
import { createClient } from '@supabase/supabase-js';

const REDIRECT_URI = `${process.env.VITE_APP_URL || 'https://venganza-portfolio-fy8d.vercel.app'}/api/instagram-callback`;

export default async function handler(req, res) {
  const { code, state: creatorId, error: igError } = req.query;

  if (igError) {
    return res.redirect(`/dashboard?instagram=denied`);
  }

  if (!code || !creatorId) {
    return res.status(400).json({ error: 'Missing code or state param' });
  }

  const appId     = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) {
    return res.status(500).json({ error: 'Instagram app not configured (META_APP_ID / META_APP_SECRET missing)' });
  }

  try {
    // ── 1. Exchange code → short-lived token ────────────────────────────────
    const tokenForm = new URLSearchParams({
      client_id:     appId,
      client_secret: appSecret,
      grant_type:    'authorization_code',
      redirect_uri:  REDIRECT_URI,
      code,
    });

    const shortRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body:   tokenForm,
    });
    const shortData = await shortRes.json();

    if (shortData.error_type || !shortData.access_token) {
      console.error('Short token error:', shortData);
      return res.redirect('/dashboard?instagram=error');
    }

    const shortToken = shortData.access_token;

    // ── 2. Exchange short-lived → long-lived token (60 days) ───────────────
    const longRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortToken}`
    );
    const longData = await longRes.json();

    if (longData.error || !longData.access_token) {
      console.error('Long token error:', longData);
      return res.redirect('/dashboard?instagram=error');
    }

    const longToken = longData.access_token;

    // ── 3. Fetch Instagram username ─────────────────────────────────────────
    const meRes = await fetch(
      `https://graph.instagram.com/me?fields=username&access_token=${longToken}`
    );
    const meData = await meRes.json();
    const handle = meData.username || '';

    // ── 4. Save token + handle to Supabase ─────────────────────────────────
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { error: dbError } = await supabase
      .from('creators')
      .update({ instagram_token: longToken, instagram_handle: handle })
      .eq('id', creatorId);

    if (dbError) {
      console.error('Supabase save error:', dbError);
      return res.redirect('/dashboard?instagram=error');
    }

    // ── 5. Redirect back to dashboard with success flag ────────────────────
    return res.redirect('/dashboard?instagram=connected');
  } catch (err) {
    console.error('Instagram callback error:', err);
    return res.redirect('/dashboard?instagram=error');
  }
}
