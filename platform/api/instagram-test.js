// GET /api/instagram-test?creator_id=<uuid>
// Diagnostic: verifies a creator's stored Instagram token is valid.
// Returns account info, media_count, and 3 recent post thumbnails.
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET')
    return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { creator_id } = req.query;
  if (!creator_id)
    return res.status(400).json({ ok: false, error: 'Missing creator_id param' });

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data: creator, error: fetchErr } = await supabase
    .from('creators')
    .select('instagram_token')
    .eq('id', creator_id)
    .single();

  if (fetchErr || !creator)
    return res.status(404).json({ ok: false, error: 'Creator not found' });

  if (!creator.instagram_token)
    return res.status(400).json({ ok: false, error: 'No Instagram token stored' });

  const token = creator.instagram_token;

  try {
    const meRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${token}`
    );
    const meData = await meRes.json();
    if (meData.error)
      return res.status(400).json({ ok: false, error: meData.error.message });

    const mediaRes = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,thumbnail_url,media_url,timestamp&limit=3&access_token=${token}`
    );
    const mediaData = await mediaRes.json();
    if (mediaData.error)
      return res.status(400).json({ ok: false, error: mediaData.error.message });

    return res.status(200).json({
      ok: true,
      username:      meData.username,
      account_type:  meData.account_type,
      media_count:   meData.media_count,
      token_preview: token.slice(-4),
      recent_posts:  mediaData.data || [],
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
