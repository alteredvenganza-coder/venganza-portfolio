// Worker che svuota la dm_queue.
// Triggerato dal cron Vercel ogni minuto (vedi vercel.json) o via POST manuale con CRON_SECRET.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CRON_SECRET  = process.env.CRON_SECRET;
const MAX_ATTEMPTS = 3;
const BATCH_SIZE   = 25;

const supabase = createClient(SUPABASE_URL ?? '', SERVICE_KEY ?? '', {
  auth: { persistSession: false },
});

export default async function handler(req, res) {
  if (CRON_SECRET && req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: jobs, error } = await supabase
    .from('dm_queue')
    .select('id, rule_id, ig_account_id, recipient_id, payload, attempts, ig_accounts(access_token, page_id)')
    .eq('status', 'pending')
    .lt('attempts', MAX_ATTEMPTS)
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE);

  if (error) return res.status(500).json({ error: error.message });
  if (!jobs?.length) return res.status(200).json({ processed: 0 });

  const results = await Promise.allSettled(jobs.map(processJob));

  return res.status(200).json({
    processed: jobs.length,
    sent:   results.filter(r => r.status === 'fulfilled' && r.value === 'sent').length,
    failed: results.filter(r => r.status === 'rejected' || r.value === 'failed').length,
  });
}

async function processJob(job) {
  const account = job.ig_accounts;
  if (!account?.access_token || !account?.page_id) {
    await markFailed(job, 'missing account token/page_id');
    return 'failed';
  }

  const text = buildText(job.payload);

  try {
    const url = `https://graph.facebook.com/v21.0/${account.page_id}/messages`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient:      { id: job.recipient_id },
        message:        { text },
        messaging_type: 'RESPONSE',
        access_token:   account.access_token,
      }),
    });
    const json = await r.json();
    if (!r.ok || json.error) {
      await markFailed(job, json.error?.message ?? `http ${r.status}`);
      return 'failed';
    }

    await supabase.from('dm_queue').update({
      status:   'sent',
      sent_at:  new Date().toISOString(),
      attempts: (job.attempts ?? 0) + 1,
    }).eq('id', job.id);

    await supabase.from('automation_logs').insert({
      rule_id:       job.rule_id,
      ig_account_id: job.ig_account_id,
      event_type:    'dm_sent',
      message:       `dm to ${job.recipient_id}`,
    });
    return 'sent';
  } catch (err) {
    await markFailed(job, err.message);
    return 'failed';
  }
}

function buildText({ dm_text, dm_link }) {
  return dm_link ? `${dm_text}\n\n${dm_link}` : dm_text;
}

async function markFailed(job, errMsg) {
  const attempts = (job.attempts ?? 0) + 1;
  await supabase.from('dm_queue').update({
    status: attempts >= MAX_ATTEMPTS ? 'failed' : 'pending',
    error:  errMsg,
    attempts,
  }).eq('id', job.id);

  await supabase.from('automation_logs').insert({
    rule_id:       job.rule_id,
    ig_account_id: job.ig_account_id,
    event_type:    'dm_failed',
    message:       errMsg,
  });
}
