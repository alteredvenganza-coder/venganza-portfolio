import { useState, useEffect } from 'react';
import { Instagram, Copy, Check, Plus, Trash2, Edit2, X, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import Btn from '../components/Btn';
import Field from '../components/Field';
import { useAuth } from '../hooks/useAuth';
import { fetchIgCredentials, upsertIgCredentials, fetchIgTriggers, insertIgTrigger, updateIgTrigger, deleteIgTrigger, fetchIgEvents } from '../lib/db';

export default function InstagramTriggersPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <header className="flex items-start gap-3">
        <Instagram size={20} className="text-burgundy-muted shrink-0 mt-1" />
        <div>
          <h1 className="text-xl font-semibold text-ink">Comment-to-DM</h1>
          <p className="text-xs text-subtle mt-1">
            Quando qualcuno commenta una keyword su un post o risponde a una storia, mando in automatico un DM con il link e (opzionale) rispondo pubblicamente al commento.
          </p>
        </div>
      </header>

      <SetupCard userId={user?.id} />
      <TriggersSection userId={user?.id} />
      <EventLog userId={user?.id} />
    </div>
  );
}

function SetupCard({ userId }) {
  const [creds, setCreds] = useState({
    igUserId: '', pageAccessToken: '', appSecret: '', verifyToken: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [savedAt, setSavedAt] = useState(0);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetchIgCredentials(userId)
      .then(c => {
        if (c) setCreds({
          igUserId:        c.igUserId        ?? '',
          pageAccessToken: c.pageAccessToken ?? '',
          appSecret:       c.appSecret       ?? '',
          verifyToken:     c.verifyToken     ?? '',
        });
      })
      .catch(err => console.error('[ig] fetch credentials failed', err))
      .finally(() => setLoading(false));
  }, [userId]);

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/instagram-webhook`
    : '';

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    try {
      await upsertIgCredentials(userId, creds);
      setSavedAt(Date.now());
    } catch (e) {
      alert('Errore salvataggio: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  function copyWebhook() {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (loading) {
    return (
      <div className="glass rounded-lg p-5">
        <p className="text-sm text-muted">Caricamento setup…</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-lg p-5 flex flex-col gap-4">
      <div>
        <p className="label-meta mb-1">Setup Meta</p>
        <p className="text-[11px] text-subtle">
          Una volta sole. Trovi questi valori nella Meta Developer Console → la tua App → Instagram + Webhooks.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="IG Business User ID">
          <input
            value={creds.igUserId}
            onChange={e => setCreds({ ...creds, igUserId: e.target.value })}
            placeholder="178…"
          />
        </Field>
        <Field label="Page Access Token (long-lived)">
          <input
            type="password"
            value={creds.pageAccessToken}
            onChange={e => setCreds({ ...creds, pageAccessToken: e.target.value })}
            placeholder="EAAB…"
            autoComplete="off"
          />
        </Field>
        <Field label="App Secret">
          <input
            type="password"
            value={creds.appSecret}
            onChange={e => setCreds({ ...creds, appSecret: e.target.value })}
            placeholder="abc123…"
            autoComplete="off"
          />
        </Field>
        <Field label="Verify Token (lo scegli tu)">
          <input
            value={creds.verifyToken}
            onChange={e => setCreds({ ...creds, verifyToken: e.target.value })}
            placeholder="vng-ig-2026"
          />
        </Field>
      </div>

      <Field label="Webhook URL — incolla in Meta → Webhooks → Callback URL">
        <div className="flex gap-2">
          <input
            readOnly
            value={webhookUrl}
            className="flex-1 font-mono text-xs"
            onClick={e => e.target.select()}
          />
          <button
            type="button"
            onClick={copyWebhook}
            className="px-3 py-1.5 rounded bg-white/8 text-muted hover:text-ink text-xs flex items-center gap-1 shrink-0"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copiato' : 'Copia'}
          </button>
        </div>
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Btn variant="primary" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvataggio…' : 'Salva credenziali'}
        </Btn>
        {savedAt > 0 && Date.now() - savedAt < 3000 && (
          <span className="text-xs text-burgundy-muted">Salvato</span>
        )}

        <Btn variant="secondary" size="sm" disabled>
          Test DM
        </Btn>
        <span className="text-[10px] text-subtle">Disponibile dopo il setup webhook (Fase 2)</span>
      </div>
    </div>
  );
}

const SOURCE_LABELS = {
  any_post:       'Qualsiasi post',
  any_story:      'Qualsiasi storia',
  specific_post:  'Post specifico',
  specific_story: 'Storia specifica',
};

const EMPTY_DRAFT = {
  sourceType: 'any_post',
  sourceId: '',
  keyword: '',
  dmText: '',
  dmLink: '',
  commentReplyText: '',
  active: true,
};

function TriggersSection({ userId }) {
  const [triggers, setTriggers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(null);   // null | 'new' | trigger.id
  const [draft,    setDraft]    = useState(EMPTY_DRAFT);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetchIgTriggers(userId)
      .then(setTriggers)
      .catch(err => console.error('[ig] fetch triggers failed', err))
      .finally(() => setLoading(false));
  }, [userId]);

  function startNew() {
    setDraft(EMPTY_DRAFT);
    setEditing('new');
  }

  function startEdit(t) {
    setDraft({
      sourceType:       t.sourceType,
      sourceId:         t.sourceId       ?? '',
      keyword:          t.keyword,
      dmText:           t.dmText,
      dmLink:           t.dmLink,
      commentReplyText: t.commentReplyText ?? '',
      active:           t.active,
    });
    setEditing(t.id);
  }

  function cancelEdit() {
    setEditing(null);
    setDraft(EMPTY_DRAFT);
  }

  async function handleSave() {
    if (!userId) return;
    if (!draft.keyword.trim() || !draft.dmText.trim() || !draft.dmLink.trim()) {
      alert('Keyword, testo DM e link sono obbligatori.');
      return;
    }
    if ((draft.sourceType === 'specific_post' || draft.sourceType === 'specific_story') && !draft.sourceId.trim()) {
      alert('Per "Post specifico" / "Storia specifica" devi indicare un ID o URL.');
      return;
    }
    setSaving(true);
    try {
      if (editing === 'new') {
        const created = await insertIgTrigger(userId, draft);
        setTriggers(prev => [created, ...prev]);
      } else {
        await updateIgTrigger(editing, draft);
        setTriggers(prev => prev.map(t => t.id === editing ? { ...t, ...draft, sourceId: draft.sourceId || null, commentReplyText: draft.commentReplyText || null } : t));
      }
      cancelEdit();
    } catch (e) {
      alert('Errore: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(t) {
    if (!confirm(`Eliminare il trigger "${t.keyword}"?`)) return;
    try {
      await deleteIgTrigger(t.id);
      setTriggers(prev => prev.filter(x => x.id !== t.id));
    } catch (e) {
      alert('Errore: ' + e.message);
    }
  }

  async function handleToggleActive(t) {
    const next = !t.active;
    setTriggers(prev => prev.map(x => x.id === t.id ? { ...x, active: next } : x));
    try {
      await updateIgTrigger(t.id, { active: next });
    } catch (e) {
      // revert on error
      setTriggers(prev => prev.map(x => x.id === t.id ? { ...x, active: t.active } : x));
      alert('Errore: ' + e.message);
    }
  }

  const isPostSource = draft.sourceType === 'any_post' || draft.sourceType === 'specific_post';
  const isSpecific   = draft.sourceType === 'specific_post' || draft.sourceType === 'specific_story';

  return (
    <div className="glass rounded-lg p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="label-meta mb-1">Trigger</p>
          <p className="text-[11px] text-subtle">
            Una keyword + una sorgente (post/storia) + un DM. Quando qualcuno commenta o risponde, parte tutto in automatico.
          </p>
        </div>
        {editing === null && (
          <Btn variant="primary" size="sm" onClick={startNew}>
            <Plus size={13} /> Nuovo trigger
          </Btn>
        )}
      </div>

      {editing !== null && (
        <div className="rounded-md border border-burgundy/30 bg-burgundy/8 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-ink">{editing === 'new' ? 'Nuovo trigger' : 'Modifica trigger'}</p>
            <button onClick={cancelEdit} className="text-subtle hover:text-ink">
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Sorgente">
              <select
                value={draft.sourceType}
                onChange={e => setDraft({ ...draft, sourceType: e.target.value })}
              >
                <option value="any_post">{SOURCE_LABELS.any_post}</option>
                <option value="any_story">{SOURCE_LABELS.any_story}</option>
                <option value="specific_post">{SOURCE_LABELS.specific_post}</option>
                <option value="specific_story">{SOURCE_LABELS.specific_story}</option>
              </select>
            </Field>

            <Field label="Keyword (case-insensitive)">
              <input
                value={draft.keyword}
                onChange={e => setDraft({ ...draft, keyword: e.target.value })}
                placeholder="info"
              />
            </Field>

            {isSpecific && (
              <Field label="ID o URL del post/storia" className="sm:col-span-2">
                <input
                  value={draft.sourceId}
                  onChange={e => setDraft({ ...draft, sourceId: e.target.value })}
                  placeholder="https://www.instagram.com/p/… oppure 178…"
                />
              </Field>
            )}

            <Field label="Testo DM" className="sm:col-span-2">
              <textarea
                rows={3}
                maxLength={900}
                value={draft.dmText}
                onChange={e => setDraft({ ...draft, dmText: e.target.value })}
                placeholder="Ciao! Ecco il link che hai chiesto 👇"
                className="resize-none"
              />
            </Field>

            <Field label="Link nel DM" className="sm:col-span-2">
              <input
                type="url"
                value={draft.dmLink}
                onChange={e => setDraft({ ...draft, dmLink: e.target.value })}
                placeholder="https://altered.example/checkout"
              />
            </Field>

            {isPostSource && (
              <Field label="Risposta pubblica al commento (opzionale)" className="sm:col-span-2">
                <textarea
                  rows={2}
                  maxLength={250}
                  value={draft.commentReplyText}
                  onChange={e => setDraft({ ...draft, commentReplyText: e.target.value })}
                  placeholder="Ti ho mandato il link in DM 📩"
                  className="resize-none"
                />
              </Field>
            )}

            <Field label="Attivo" className="sm:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={e => setDraft({ ...draft, active: e.target.checked })}
                />
                Trigger attivo
              </label>
            </Field>
          </div>

          <div className="flex items-center gap-2">
            <Btn variant="primary" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvataggio…' : 'Salva trigger'}
            </Btn>
            <Btn variant="ghost" size="sm" onClick={cancelEdit}>Annulla</Btn>
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-muted">Caricamento trigger…</p>}

      {!loading && triggers.length === 0 && editing === null && (
        <p className="text-sm text-subtle py-6 text-center">
          Nessun trigger. Premi <strong>Nuovo trigger</strong> per crearne uno.
        </p>
      )}

      {!loading && triggers.length > 0 && (
        <div className="flex flex-col gap-2">
          {triggers.map(t => (
            <div key={t.id} className="rounded-md border border-white/10 bg-white/5 p-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-wide text-burgundy-muted font-mono">
                    {SOURCE_LABELS[t.sourceType]}
                  </span>
                  {t.sourceId && (
                    <span className="text-[10px] text-subtle font-mono truncate max-w-[180px]" title={t.sourceId}>
                      · {t.sourceId}
                    </span>
                  )}
                </div>
                <p className="text-sm text-ink mb-1">
                  Se commento contiene <code className="px-1 rounded bg-white/10 text-burgundy-muted">{t.keyword}</code>
                  {' '}→ DM con link
                </p>
                <p className="text-[11px] text-muted line-clamp-2">{t.dmText}</p>
                {t.commentReplyText && (
                  <p className="text-[11px] text-subtle italic mt-1">
                    Reply pubblico: "{t.commentReplyText}"
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <label className="inline-flex items-center gap-1 cursor-pointer mr-1" title={t.active ? 'Attivo' : 'Disattivato'}>
                  <input
                    type="checkbox"
                    checked={t.active}
                    onChange={() => handleToggleActive(t)}
                  />
                </label>
                <button
                  onClick={() => startEdit(t)}
                  className="p-1.5 rounded text-muted hover:text-ink hover:bg-white/8"
                  title="Modifica"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(t)}
                  className="p-1.5 rounded text-muted hover:text-red-400 hover:bg-white/8"
                  title="Elimina"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function eventTimeLabel(ts) {
  const d = new Date(ts);
  return d.toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status, label }) {
  if (!status) return null;
  const map = {
    sent:        { Icon: CheckCircle2, color: 'text-green-400',  bg: 'bg-green-950/30 border-green-500/20' },
    failed:      { Icon: XCircle,      color: 'text-red-400',    bg: 'bg-red-950/30 border-red-500/20' },
    skipped_dup: { Icon: MinusCircle,  color: 'text-yellow-400', bg: 'bg-yellow-950/30 border-yellow-500/20' },
  };
  const cfg = map[status] ?? map.failed;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-mono ${cfg.bg} ${cfg.color}`}>
      <cfg.Icon size={10} />
      {label}: {status}
    </span>
  );
}

function EventLog({ userId }) {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function refresh() {
      try {
        const list = await fetchIgEvents(userId, { limit: 50 });
        if (!cancelled) setEvents(list);
      } catch (e) {
        console.error('[ig] fetch events failed', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [userId]);

  return (
    <div className="glass rounded-lg p-5 flex flex-col gap-3">
      <div>
        <p className="label-meta mb-1">Eventi recenti</p>
        <p className="text-[11px] text-subtle">
          Aggiornamento automatico ogni 30 s. Ultimi 50 eventi.
        </p>
      </div>

      {loading && <p className="text-sm text-muted">Caricamento eventi…</p>}

      {!loading && events.length === 0 && (
        <p className="text-sm text-subtle py-6 text-center">
          Nessun evento ancora. Riceverai eventi qui dopo aver completato il setup Meta (Fase 2).
        </p>
      )}

      {!loading && events.length > 0 && (
        <div className="flex flex-col gap-1">
          {events.map(ev => {
            const isOpen = expanded === ev.id;
            return (
              <div
                key={ev.id}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 cursor-pointer hover:bg-white/8"
                onClick={() => setExpanded(isOpen ? null : ev.id)}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono text-subtle">{eventTimeLabel(ev.createdAt)}</span>
                  <span className="text-[10px] uppercase tracking-wide text-burgundy-muted">
                    {ev.sourceKind === 'comment' ? 'commento' : 'story-reply'}
                  </span>
                  <span className="text-xs text-ink truncate max-w-[160px]" title={ev.senderUsername || ev.senderIgsid}>
                    @{ev.senderUsername || ev.senderIgsid}
                  </span>
                  <div className="flex items-center gap-1 ml-auto">
                    <StatusBadge status={ev.status} label="DM" />
                    {ev.commentReplyStatus && <StatusBadge status={ev.commentReplyStatus} label="Reply" />}
                  </div>
                </div>
                {isOpen && (
                  <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-muted font-mono space-y-1">
                    <div>media: {ev.sourceMediaId ?? '—'}</div>
                    <div>event id: {ev.sourceEventId}</div>
                    {ev.error && <div className="text-red-400">DM error: {ev.error}</div>}
                    {ev.commentReplyError && <div className="text-red-400">Reply error: {ev.commentReplyError}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
