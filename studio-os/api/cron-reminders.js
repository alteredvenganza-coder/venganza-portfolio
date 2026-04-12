import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Vercel injects CRON_SECRET automatically for cron jobs
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const vapidEmail  = process.env.VAPID_EMAIL;
  const vapidPub    = process.env.VITE_VAPID_PUBLIC_KEY;
  const vapidPriv   = process.env.VAPID_PRIVATE_KEY;

  if (!supabaseUrl || !serviceKey || !vapidEmail || !vapidPub || !vapidPriv) {
    return res.status(500).json({ error: 'Env vars mancanti (VAPID o Supabase service role)' });
  }

  webpush.setVapidDetails(vapidEmail, vapidPub, vapidPriv);
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Fetch all push subscriptions
  const { data: subs, error: subsErr } = await supabase.from('push_subscriptions').select('*');
  if (subsErr) return res.status(500).json({ error: subsErr.message });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let sent = 0, expired = 0;

  for (const sub of subs ?? []) {
    // Fetch user's non-completed projects with deadline
    const { data: projects } = await supabase
      .from('projects')
      .select('id, title, deadline, stage, is_paused')
      .eq('user_id', sub.user_id)
      .neq('stage', 'completed')
      .eq('is_paused', false)
      .not('deadline', 'is', null);

    const urgent = (projects ?? []).filter(p => {
      const d = new Date(p.deadline);
      const daysLeft = Math.ceil((d - today) / 86400000);
      return daysLeft <= 3;
    });

    if (!urgent.length) continue;

    const overdue  = urgent.filter(p => new Date(p.deadline) < today);
    const dueSoon  = urgent.filter(p => new Date(p.deadline) >= today);

    let body = '';
    if (overdue.length)  body += `⚠️ ${overdue.map(p => p.title).join(', ')} — scaduti. `;
    if (dueSoon.length)  body += `📅 ${dueSoon.map(p => p.title).join(', ')} — in scadenza.`;

    const payload = JSON.stringify({
      title: `Venganza OS — ${urgent.length} ${urgent.length === 1 ? 'progetto urgente' : 'progetti urgenti'}`,
      body:  body.trim(),
      url:   '/',
      tag:   'daily-reminder',
    });

    try {
      await webpush.sendNotification(sub.subscription, payload);
      sent++;
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        // Subscription expired — remove it
        await supabase.from('push_subscriptions').delete().eq('id', sub.id);
        expired++;
      }
    }
  }

  return res.status(200).json({ ok: true, sent, expired });
}
