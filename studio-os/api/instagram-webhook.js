// Webhook receiver per Instagram Graph API.
//
// GET  /api/instagram-webhook  → verify subscription (hub.challenge)
// POST /api/instagram-webhook  → ingest commenti su post/reel + risposte alle storie
//
// Setup Meta:
//   App Dashboard → Webhooks → Instagram → Subscribe a "comments" e "messages"
//   Callback URL : https://os.altered-venganza.com/api/instagram-webhook
//   Verify token : process.env.IG_WEBHOOK_VERIFY_TOKEN
//
// Env richieste:
//   VITE_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   META_APP_SECRET            (per verifica firma x-hub-signature-256)
//   IG_WEBHOOK_VERIFY_TOKEN    (challenge GET)

import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const VERIFY_TOKEN = process.env.IG_WEBHOOK_VERIFY_TOKEN;
const APP_SECRET   = process.env.META_APP_SECRET;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL ?? '', SERVICE_KEY ?? '', {
  auth: { persistSession: false },
});

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method === 'GET') return handleVerify(req, res);
  if (req.method === 'POST') return handleEvent(req, res);
  return res.status(405).json({ error: 'method not allowed' });
}

function handleVerify(req, res) {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.status(403).json({ error: 'verify token mismatch' });
}

async function handleEvent(req, res) {
  const raw = await readRaw(req);

  if (APP_SECRET && !verifySignature(req, raw)) {
    return res.status(401).json({ error: 'invalid signature' });
  }

  let body;
  try { body = JSON.parse(raw.toString('utf8')); }
  catch { return res.status(400).json({ error: 'invalid json' }); }

  // Meta vuole risposta veloce: ack subito, processa in background
  res.status(200).json({ received: true });

  try {
    for (const entry of body.entry ?? []) {
      const igUserId = entry.id;

      const { data: account } = await supabase
        .from('ig_accounts')
        .select('*')
        .eq('ig_user_id', igUserId)
        .maybeSingle();

      if (!account) {
        await log({ event_type: 'webhook_received', message: `account ${igUserId} non collegato`, payload: entry });
        continue;
      }

      for (const change of entry.changes ?? []) {
        if (change.field === 'comments') {
          await handleComment(account, change.value);
        }
      }
      for (const ev of entry.messaging ?? []) {
        if (ev.message?.reply_to?.story) {
          await handleStoryReply(account, ev);
        }
      }
    }
  } catch (err) {
    console.error('[ig-webhook] processing error', err);
    await log({ event_type: 'dm_failed', message: `processing error: ${err.message}` });
  }
}

async function handleComment(account, value) {
  const commentId = value.id;
  const text      = (value.text ?? '').toLowerCase();
  const fromId    = value.from?.id;
  const mediaId   = value.media?.id;

  await log({
    user_id: account.user_id,
    ig_account_id: account.id,
    event_type: 'webhook_received',
    trigger: 'comment',
    source_id: commentId,
    payload: value,
  });

  const rule = await matchRule({ igAccountId: account.id, trigger: 'comment', text, postId: mediaId });
  if (!rule) {
    await log({ user_id: account.user_id, ig_account_id: account.id, event_type: 'no_match', trigger: 'comment', source_id: commentId });
    return;
  }
  await log({ user_id: account.user_id, rule_id: rule.id, ig_account_id: account.id, event_type: 'rule_matched', trigger: 'comment', source_id: commentId });

  if (rule.reply_comment) {
    try {
      await fetch(`https://graph.facebook.com/v21.0/${commentId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: rule.reply_comment, access_token: account.access_token }),
      });
      await log({ user_id: account.user_id, rule_id: rule.id, ig_account_id: account.id, event_type: 'comment_replied', source_id: commentId });
    } catch (err) {
      await log({ user_id: account.user_id, rule_id: rule.id, ig_account_id: account.id, event_type: 'dm_failed', message: `comment reply: ${err.message}` });
    }
  }

  if (fromId) {
    await supabase.from('dm_queue').insert({
      user_id:       account.user_id,
      rule_id:       rule.id,
      ig_account_id: account.id,
      recipient_id:  fromId,
      trigger:       'comment',
      source_id:     commentId,
      payload:       { dm_text: rule.dm_text, dm_link: rule.dm_link },
    });
  }
}

async function handleStoryReply(account, ev) {
  const text      = (ev.message?.text ?? '').toLowerCase();
  const senderId  = ev.sender?.id;
  const storyId   = ev.message?.reply_to?.story?.id;
  const messageId = ev.message?.mid;

  await log({
    user_id: account.user_id,
    ig_account_id: account.id,
    event_type: 'webhook_received',
    trigger: 'story_reply',
    source_id: storyId,
    payload: ev,
  });

  const rule = await matchRule({ igAccountId: account.id, trigger: 'story_reply', text, postId: null });
  if (!rule) {
    await log({ user_id: account.user_id, ig_account_id: account.id, event_type: 'no_match', trigger: 'story_reply', source_id: messageId });
    return;
  }
  await log({ user_id: account.user_id, rule_id: rule.id, ig_account_id: account.id, event_type: 'rule_matched', trigger: 'story_reply', source_id: messageId });

  if (senderId) {
    await supabase.from('dm_queue').insert({
      user_id:       account.user_id,
      rule_id:       rule.id,
      ig_account_id: account.id,
      recipient_id:  senderId,
      trigger:       'story_reply',
      source_id:     messageId,
      payload:       { dm_text: rule.dm_text, dm_link: rule.dm_link },
    });
  }
}

async function matchRule({ igAccountId, trigger, text, postId }) {
  const { data: candidates } = await supabase
    .from('automation_rules')
    .select('*')
    .eq('ig_account_id', igAccountId)
    .eq('trigger', trigger)
    .eq('active', true);
  if (!candidates?.length) return null;

  // post_id specifico vince su generico
  const sorted = [...candidates].sort((a, b) => (b.post_id ? 1 : 0) - (a.post_id ? 1 : 0));

  for (const rule of sorted) {
    if (rule.post_id && postId && rule.post_id !== postId) continue;
    if (rule.post_id && !postId) continue;
    const kws = (rule.keywords ?? []).map(k => k.toLowerCase());
    const hit = rule.match_mode === 'exact'
      ? kws.includes(text.trim())
      : kws.some(k => text.includes(k));
    if (hit) return rule;
  }
  return null;
}

async function log(row) {
  try { await supabase.from('automation_logs').insert(row); }
  catch (err) { console.error('[ig-webhook] log insert failed', err); }
}

function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end',  () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function verifySignature(req, raw) {
  const sig = req.headers['x-hub-signature-256'];
  if (!sig) return false;
  const expected = 'sha256=' + crypto
    .createHmac('sha256', APP_SECRET)
    .update(raw)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch { return false; }
}
