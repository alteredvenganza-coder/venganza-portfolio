import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY non configurata' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No auth token' });

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

  const { subscription } = req.body ?? {};
  if (!subscription?.endpoint) return res.status(400).json({ error: 'Subscription non valida' });

  const { error } = await supabase.from('push_subscriptions').upsert({
    user_id:      user.id,
    endpoint:     subscription.endpoint,
    subscription: subscription,
  }, { onConflict: 'user_id,endpoint' });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true });
}
