// PATCH /api/creator/update
// Update creator profile (authenticated)
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  const updates = req.body;
  // Whitelist updatable fields
  const allowed = ['display_name','logo_text','bio','tagline','location',
    'primary_color','accent_color','bg_color','text_color',
    'instagram_handle','premade_hashtag','stripe_payment_link',
    'premade_basic_price','premade_premium_price','premade_subtitle1','premade_subtitle2',
    'archive_price','archive_cutoff_date','mat_price_single','mat_price_custom','mat_price_360',
    'image_hero_left','image_hero_right','image_logo',
    'image_mat_render1','image_mat_render2','image_mat_render3',
    'image_mat_render4','image_mat_render5','image_mat_render6',
    'slug','is_onboarded'];

  const filtered = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));

  const { data, error } = await supabase
    .from('creators')
    .update(filtered)
    .eq('id', user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true, creator: data });
}
