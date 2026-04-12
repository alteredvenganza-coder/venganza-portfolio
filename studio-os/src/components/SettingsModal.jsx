import { useState, useEffect } from 'react';
import { Bell, BellOff, Webhook, Check, X, ExternalLink } from 'lucide-react';
import Modal from './Modal';
import Btn from './Btn';
import Field from './Field';
import { usePush } from '../hooks/usePush';
import { getWebhookUrl, saveWebhookUrl } from '../lib/webhook';

export default function SettingsModal({ open, onClose }) {
  const { status, subscribe, unsubscribe, supported } = usePush();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSaved, setWebhookSaved] = useState(false);
  const [pushError, setPushError] = useState('');

  useEffect(() => {
    if (open) {
      setWebhookUrl(getWebhookUrl());
      setWebhookSaved(false);
      setPushError('');
    }
  }, [open]);

  async function handleSubscribe() {
    setPushError('');
    const ok = await subscribe();
    if (!ok) setPushError('Permesso negato o VAPID key non configurata.');
  }

  function saveWebhook() {
    saveWebhookUrl(webhookUrl);
    setWebhookSaved(true);
    setTimeout(() => setWebhookSaved(false), 2000);
  }

  const statusLabel = {
    unsupported: 'Non supportato su questo browser',
    idle:        'Notifiche disattivate',
    requesting:  'Attivazione…',
    subscribed:  'Notifiche attive',
    denied:      'Permesso negato — cambia dalle impostazioni del browser',
  };

  return (
    <Modal open={open} onClose={onClose} title="Impostazioni" width="max-w-md">
      <div className="flex flex-col gap-6">

        {/* ── Push Notifications ── */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell size={14} className="text-burgundy" />
            <p className="text-sm font-semibold text-ink">Notifiche push</p>
          </div>
          <p className="text-xs text-subtle mb-3">
            Ricevi una notifica sul telefono ogni mattina con deadline urgenti e progetti in scadenza.
            {' '}<span className="text-[#7a6010]">Su iPhone: aggiungi l'app alla Home screen prima di attivare.</span>
          </p>

          <div className={`flex items-center gap-2 px-3 py-2 rounded border text-xs font-mono mb-3 ${
            status === 'subscribed' ? 'bg-[#e6f4ea] border-[#276749] text-[#276749]' :
            status === 'denied'     ? 'bg-[#fce8e6] border-burgundy text-burgundy' :
            'bg-paper border-border text-muted'
          }`}>
            {status === 'subscribed' ? <Check size={13} /> : <BellOff size={13} />}
            {statusLabel[status] ?? status}
          </div>

          {pushError && <p className="text-xs text-burgundy mb-3">{pushError}</p>}

          {status === 'subscribed' ? (
            <Btn variant="secondary" size="sm" onClick={unsubscribe}>
              <BellOff size={13} /> Disattiva notifiche
            </Btn>
          ) : (
            <Btn
              variant="primary"
              size="sm"
              onClick={handleSubscribe}
              disabled={!supported || status === 'requesting' || status === 'denied'}
            >
              <Bell size={13} />
              {status === 'requesting' ? 'Attivazione…' : 'Attiva notifiche'}
            </Btn>
          )}

          {!import.meta.env.VITE_VAPID_PUBLIC_KEY && (
            <p className="text-xs text-[#7a6010] mt-2">
              ⚠️ VITE_VAPID_PUBLIC_KEY non configurata — vedi istruzioni sotto.
            </p>
          )}
        </div>

        <hr className="border-border" />

        {/* ── Zapier Webhook ── */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Webhook size={14} className="text-burgundy" />
            <p className="text-sm font-semibold text-ink">Webhook → Microsoft To Do / Zapier</p>
          </div>
          <p className="text-xs text-subtle mb-1">
            Incolla il tuo Zapier webhook URL. Ogni task aggiunto a un progetto
            verrà inviato automaticamente a Zapier, che lo crea in Microsoft To Do.
          </p>
          <a
            href="https://zapier.com/apps/microsoft-todo/integrations/webhook"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-burgundy hover:underline mb-3"
          >
            Come creare lo Zap <ExternalLink size={11} />
          </a>

          <Field label="Webhook URL (Zapier / Make / n8n)">
            <input
              type="url"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
            />
          </Field>
          <div className="flex items-center gap-2 mt-2">
            <Btn variant="secondary" size="sm" onClick={saveWebhook}>
              {webhookSaved ? <><Check size={13} /> Salvato</> : 'Salva URL'}
            </Btn>
            {webhookUrl && (
              <Btn variant="ghost" size="sm" onClick={() => { setWebhookUrl(''); saveWebhookUrl(''); }}>
                <X size={13} /> Rimuovi
              </Btn>
            )}
          </div>
        </div>

        <hr className="border-border" />

        {/* ── Setup instructions ── */}
        <details className="text-xs text-subtle">
          <summary className="cursor-pointer font-mono uppercase tracking-wide text-[10px] text-muted hover:text-ink">
            Istruzioni setup env vars Vercel
          </summary>
          <div className="mt-3 flex flex-col gap-2 font-mono bg-paper rounded p-3 text-[11px] leading-relaxed">
            <p className="text-ink font-medium">1. Genera le VAPID keys (una volta sola):</p>
            <code className="bg-white border border-border rounded px-2 py-1 block">npx web-push generate-vapid-keys</code>
            <p className="text-ink font-medium mt-1">2. Aggiungi su Vercel → Settings → Env Vars:</p>
            <code className="block">VITE_VAPID_PUBLIC_KEY = (public key)</code>
            <code className="block">VAPID_PRIVATE_KEY = (private key)</code>
            <code className="block">VAPID_EMAIL = mailto:tua@email.com</code>
            <code className="block">SUPABASE_SERVICE_ROLE_KEY = (da Supabase → Settings → API)</code>
            <p className="text-ink font-medium mt-1">3. Rideploya su Vercel</p>
          </div>
        </details>

      </div>
    </Modal>
  );
}
