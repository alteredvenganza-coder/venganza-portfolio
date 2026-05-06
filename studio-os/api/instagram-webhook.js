// Instagram Comment-to-DM webhook receiver (Phase 2).
//
// GET  /api/instagram-webhook  → verify subscription (hub.challenge)
// POST /api/instagram-webhook  → ingest comments + story replies, match
//                                triggers, fire public reply (optional) + DM
//
// All credentials live in Supabase table `ig_credentials` (single owner row).
// HMAC signature verified using ig_credentials.app_secret. The webhook also
// reads ig_credentials.verify_token for the GET handshake — so the user can
// rotate creds entirely from the admin UI without redeploying.
//
// Required env:
//   VITE_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL ?? '', SERVICE_KEY ?? '', {
  auth: { persistSession: false },
});

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method === 'GET')  return handleVerify(req, res);
  if (req.method === 'POST') return handleEvent(req, res);
  return res.status(405).json({ error: 'method not allowed' });
}

// ── GET: Meta subscription challenge ────────────────────────────────────────

async function handleVerify(req, res) {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode !== 'subscribe') return res.status(403).json({ error: 'mode mismatch' });

  const creds = await loadCredentials();
  if (!creds || !creds.verify_token) return res.status(403).json({ error: 'no credentials configured' });
  if (token !== creds.verify_token)  return res.status(403).json({ error: 'verify token mismatch' });

  return res.status(200).send(challenge);
}

// ── POST: webhook event ─────────────────────────────────────────────────────

async function handleEvent(req, res) {
  const raw = await readRaw(req);

  const creds = await loadCredentials();
  if (!creds) {
    console.error('[ig-webhook] no credentials row in ig_credentials');
    return res.status(500).json({ error: 'no credentials configured' });
  }

  if (creds.app_secret && !verifySignature(req, raw, creds.app_secret)) {
    return res.status(401).json({ error: 'invalid signature' });
  }

  let body;
  try { body = JSON.parse(raw.toString('utf8')); }
  catch { return res.status(400).json({ error: 'invalid json' }); }

  // Meta wants a fast 200 — process in background.
  res.status(200).json({ received: true });

  try {
    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.field === 'comments') {
          await handleComment(creds, change.value);
        }
      }
      for (const ev of entry.messaging ?? []) {
        if (ev.message?.reply_to?.story) {
          await handleStoryReply(creds, ev);
        }
      }
    }
  } catch (err) {
    console.error('[ig-webhook] processing error', err);
  }
}

// ── Comment handling ────────────────────────────────────────────────────────

async function handleComment(creds, value) {
  const commentId = value.id;
  const text      = value.text ?? '';
  const fromId    = value.from?.id;
  const fromName  = value.from?.username;
  const mediaId   = value.media?.id;

  const trigger = await matchTrigger(creds.user_id, {
    kind: 'comment', text, mediaId,
  });
  if (!trigger) return; // silent drop, not even a skipped row

  // Dedup: already a sent event for this trigger + comment?
  const existing = await findSentEvent(trigger.id, commentId);
  if (existing) {
    await insertEvent({
      user_id: creds.user_id, trigger_id: trigger.id,
      source_kind: 'comment', source_event_id: commentId, source_media_id: mediaId,
      sender_igsid: fromId ?? '', sender_username: fromName ?? null,
      status: 'skipped_dup',
    });
    return;
  }

  // 1. Public reply (optional)
  let replyStatus = null, replyError = null;
  if (trigger.comment_reply_text && trigger.comment_reply_text.trim()) {
    const r = await postCommentReply(commentId, trigger.comment_reply_text, creds.page_access_token);
    replyStatus = r.ok ? 'sent' : 'failed';
    replyError  = r.ok ? null  : r.error;
  }

  // 2. DM (only if we have a sender IGSID)
  let status = 'failed', error = 'no sender id';
  if (fromId) {
    const r = await sendDm(fromId, buildDmText(trigger), creds.page_access_token);
    status = r.ok ? 'sent' : 'failed';
    error  = r.ok ? null  : r.error;
  }

  await insertEvent({
    user_id: creds.user_id, trigger_id: trigger.id,
    source_kind: 'comment', source_event_id: commentId, source_media_id: mediaId,
    sender_igsid: fromId ?? '', sender_username: fromName ?? null,
    status, error,
    comment_reply_status: replyStatus, comment_reply_error: replyError,
  });
}

// ── Story-reply handling ────────────────────────────────────────────────────

async function handleStoryReply(creds, ev) {
  const text      = ev.message?.text ?? '';
  const senderId  = ev.sender?.id;
  const storyId   = ev.message?.reply_to?.story?.id;
  const messageId = ev.message?.mid;

  const trigger = await matchTrigger(creds.user_id, {
    kind: 'story_reply', text, mediaId: storyId,
  });
  if (!trigger) return;

  const existing = await findSentEvent(trigger.id, messageId);
  if (existing) {
    await insertEvent({
      user_id: creds.user_id, trigger_id: trigger.id,
      source_kind: 'story_reply', source_event_id: messageId, source_media_id: storyId,
      sender_igsid: senderId ?? '', sender_username: null,
      status: 'skipped_dup',
    });
    return;
  }

  let status = 'failed', error = 'no sender id';
  if (senderId) {
    const r = await sendDm(senderId, buildDmText(trigger), creds.page_access_token);
    status = r.ok ? 'sent' : 'failed';
    error  = r.ok ? null  : r.error;
  }

  await insertEvent({
    user_id: creds.user_id, trigger_id: trigger.id,
    source_kind: 'story_reply', source_event_id: messageId, source_media_id: storyId,
    sender_igsid: senderId ?? '', sender_username: null,
    status, error,
  });
}

// ── Matcher ─────────────────────────────────────────────────────────────────

async function matchTrigger(userId, { kind, text, mediaId }) {
  const { data: triggers, error } = await supabase
    .from('ig_triggers')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true);
  if (error) {
    console.error('[ig-webhook] fetch triggers failed', error);
    return null;
  }
  if (!triggers?.length) return null;

  const lowText = (text ?? '').toLowerCase();
  const candidates = triggers.filter(t => {
    if (kind === 'comment') {
      if (t.source_type === 'any_post') return true;
      if (t.source_type === 'specific_post') return t.source_id && t.source_id === mediaId;
      return false;
    }
    if (kind === 'story_reply') {
      if (t.source_type === 'any_story') return true;
      if (t.source_type === 'specific_story') return t.source_id && t.source_id === mediaId;
      return false;
    }
    return false;
  });

  // Specific source wins over generic
  candidates.sort((a, b) => {
    const aSpecific = a.source_type.startsWith('specific') ? 1 : 0;
    const bSpecific = b.source_type.startsWith('specific') ? 1 : 0;
    return bSpecific - aSpecific;
  });

  for (const t of candidates) {
    if (!t.keyword) continue;
    if (lowText.includes(t.keyword.toLowerCase())) return t;
  }
  return null;
}

// ── Graph API senders ───────────────────────────────────────────────────────

export async function sendDm(recipientIgsid, text, accessToken) {
  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/me/messages?access_token=${encodeURIComponent(accessToken)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient:      { id: recipientIgsid },
        message:        { text },
        messaging_type: 'RESPONSE',
      }),
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok || json.error) {
      return { ok: false, error: json.error?.message ?? `http ${r.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function postCommentReply(commentId, text, accessToken) {
  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${commentId}/replies?access_token=${encodeURIComponent(accessToken)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok || json.error) {
      return { ok: false, error: json.error?.message ?? `http ${r.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── DB helpers (server-side, bypass RLS via service role) ───────────────────

export async function loadCredentials() {
  const { data, error } = await supabase
    .from('ig_credentials')
    .select('*')
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error('[ig-webhook] load credentials failed', error);
    return null;
  }
  return data ?? null;
}

async function findSentEvent(triggerId, sourceEventId) {
  const { data } = await supabase
    .from('ig_events')
    .select('id')
    .eq('trigger_id', triggerId)
    .eq('source_event_id', sourceEventId)
    .eq('status', 'sent')
    .limit(1);
  return data && data.length > 0;
}

async function insertEvent(row) {
  try {
    await supabase.from('ig_events').insert(row);
  } catch (err) {
    console.error('[ig-webhook] event insert failed', err);
  }
}

// ── Utils ───────────────────────────────────────────────────────────────────

function buildDmText(trigger) {
  const text = trigger.dm_text || '';
  const link = trigger.dm_link || '';
  return link ? `${text}\n\n${link}` : text;
}

function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end',  () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function verifySignature(req, raw, appSecret) {
  const sig = req.headers['x-hub-signature-256'];
  if (!sig || !appSecret) return false;
  const expected = 'sha256=' + crypto
    .createHmac('sha256', appSecret)
    .update(raw)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch { return false; }
}
