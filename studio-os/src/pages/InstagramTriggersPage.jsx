import { useState, useEffect } from 'react';
import { Instagram, Copy, Check } from 'lucide-react';
import Btn from '../components/Btn';
import Field from '../components/Field';
import { useAuth } from '../hooks/useAuth';
import { fetchIgCredentials, upsertIgCredentials } from '../lib/db';

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

function TriggersSection({ userId }) {
  return (
    <div className="glass rounded-lg p-5">
      <p className="label-meta mb-2">Trigger</p>
      <p className="text-sm text-muted">Da implementare in Task 5.</p>
    </div>
  );
}

function EventLog({ userId }) {
  return (
    <div className="glass rounded-lg p-5">
      <p className="label-meta mb-2">Eventi recenti</p>
      <p className="text-sm text-muted">Da implementare in Task 6.</p>
    </div>
  );
}
