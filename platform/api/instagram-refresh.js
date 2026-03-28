// GET /api/instagram-refresh?creator_id=<uuid>
// Refreshes a creator's Instagram long-lived token before it expires (60-day TTL).
// Can be called on-demand from the dashboard or scheduled via Vercel Cron.
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const creatorId = req.query.creator_id;
  if (!creatorId) {
    return res.status(400).json({ error: 'Missing creator_id param' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // Fetch current token
  const { data: creator, error: fetchErr } = await supabase
    .from('creators')
    .select('instagram_token')
    .eq('id', creatorId)
    .single();

  if (fetchErr || !creator?.instagram_token) {
    return res.status(404).json({ error: 'No Instagram token found for this creator' });
  }

  try {
    // Refresh the long-lived token (works any time before expiry)
    const refreshRes = await fetch(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${creator.instagram_token}`
    );
    const refreshData = await refreshRes.json();

    if (refreshData.error || !refreshData.access_token) {
      return res.status(400).json({ error: 'Token refresh failed', details: refreshData });
    }

    // Save refreshed token
    const { error: saveErr } = await supabase
      .from('creators')
      .update({ instagram_token: refreshData.access_token })
      .eq('id', creatorId);

    if (saveErr) {
      return res.status(500).json({ error: saveErr.message });
    }

    return res.status(200).json({ ok: true, expires_in: refreshData.expires_in });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
