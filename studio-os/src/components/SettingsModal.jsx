import { useState, useEffect } from 'react';
import { Bell, BellOff, Webhook, Check, X, ExternalLink, Target, ImagePlus, Trash2, CreditCard } from 'lucide-react';

const REVOLUT_KEY = 'revolut-api-token';
import Modal from './Modal';
import Btn from './Btn';
import Field from './Field';
import GoalsSection from './GoalsSection';
import { usePush } from '../hooks/usePush';
import { useGoals } from '../hooks/useStore';
import { getWebhookUrl, saveWebhookUrl } from '../lib/webhook';

const TABS = [
  { id: 'settings', label: 'Impostazioni' },
  { id: 'goals',    label: 'Obiettivi', icon: Target },
];

export default function SettingsModal({ open, onClose }) {
  const { status, subscribe, unsubscribe, supported } = usePush();
  const { goals, updateGoals } = useGoals();
  const [webhookUrl,      setWebhookUrl]      = useState('');
  const [webhookSaved,    setWebhookSaved]    = useState(false);
  const [pushError,       setPushError]       = useState('');
  const [activeTab,       setActiveTab]       = useState('settings');
  const [bgDraft,         setBgDraft]         = useState('');
  const [revolutToken,    setRevolutToken]    = useState('');
  const [revolutSaved,    setRevolutSaved]    = useState(false);

  useEffect(() => {
    if (open) {
      setWebhookUrl(getWebhookUrl());
      setWebhookSaved(false);
      setPushError('');
      setRevolutToken(localStorage.getItem(REVOLUT_KEY) ?? '');
      setRevolutSaved(false);
    }
  }, [open]);

  function saveRevolutToken() {
    if (revolutToken.trim()) localStorage.setItem(REVOLUT_KEY, revolutToken.trim());
    else localStorage.removeItem(REVOLUT_KEY);
    setRevolutSaved(true);
    setTimeout(() => setRevolutSaved(false), 2000);
  }

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
    <Modal
      open={open}
      onClose={onClose}
      title="Impostazioni"
      width={activeTab === 'goals' ? 'max-w-xl' : 'max-w-md'}
    >
      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-6 p-1 bg-white/5 rounded-lg border border-white/10">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-burgundy text-white'
                : 'text-muted hover:text-ink hover:bg-white/8'
            }`}
          >
            {tab.icon && <tab.icon size={13} />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Impostazioni ── */}
      {activeTab === 'settings' && (
        <div className="flex flex-col gap-6">

          {/* Push Notifications */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bell size={14} className="text-burgundy" />
              <p className="text-sm font-semibold text-ink">Notifiche push</p>
            </div>
            <p className="text-xs text-subtle mb-3">
              Ricevi una notifica sul telefono ogni mattina con deadline urgenti e progetti in scadenza.
              {' '}<span className="text-yellow-300/80">Su iPhone: aggiungi l'app alla Home screen prima di attivare.</span>
            </p>

            <div className={`flex items-center gap-2 px-3 py-2 rounded border text-xs font-mono mb-3 ${
              status === 'subscribed' ? 'bg-green-950/40 border-green-500/30 text-green-400' :
              status === 'denied'     ? 'bg-red-950/40 border-red-500/30 text-red-400' :
              'bg-white/5 border-white/12 text-muted'
            }`}>
              {status === 'subscribed' ? <Check size={13} /> : <BellOff size={13} />}
              {statusLabel[status] ?? status}
            </div>

            {pushError && <p className="text-xs text-red-400 mb-3">{pushError}</p>}

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
              <p className="text-xs text-yellow-300/70 mt-2">
                ⚠️ VITE_VAPID_PUBLIC_KEY non configurata — vedi istruzioni sotto.
              </p>
            )}
          </div>

          <hr className="border-white/10" />

          {/* Zapier Webhook */}
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
              className="inline-flex items-center gap-1 text-xs text-burgundy-muted hover:underline mb-3"
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

          <hr className="border-white/10" />

          {/* ── Sfondo app ── */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ImagePlus size={14} className="text-burgundy" />
              <p className="text-sm font-semibold text-ink">Sfondo app</p>
            </div>
            <p className="text-xs text-subtle mb-3">
              Imposta una tua foto come sfondo — vision board, obiettivo, mood.
              Incolla il link diretto di un'immagine (Unsplash, Google Drive, ecc.)
            </p>

            {goals.appBackground && (
              <div className="relative mb-3 rounded-lg overflow-hidden h-28 group">
                <img
                  src={goals.appBackground}
                  alt="Sfondo corrente"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => updateGoals({ appBackground: null })}
                    className="flex items-center gap-1.5 text-xs text-white bg-red-900/70 hover:bg-red-900 px-3 py-1.5 rounded transition-colors"
                  >
                    <Trash2 size={12} /> Rimuovi
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/…"
                value={bgDraft}
                onChange={e => setBgDraft(e.target.value)}
                className="flex-1 text-sm"
              />
              <Btn
                variant="secondary"
                size="sm"
                onClick={() => { if (bgDraft.trim()) { updateGoals({ appBackground: bgDraft.trim() }); setBgDraft(''); } }}
                disabled={!bgDraft.trim()}
              >
                <Check size={13} /> Imposta
              </Btn>
            </div>
          </div>

          <hr className="border-white/10" />

          {/* ── Revolut API ── */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={14} className="text-burgundy" />
              <p className="text-sm font-semibold text-ink">Revolut Business API</p>
            </div>
            <p className="text-xs text-subtle mb-1">
              Collega il tuo conto Revolut Business per sincronizzare automaticamente entrate e uscite nella pagina <strong className="text-muted">Finanze</strong>.
              Le transazioni vengono auto-categorizzate (Ristoranti, Spesa, Software, ecc.)
            </p>
            <a
              href="https://developer.revolut.com/docs/business/business-api"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-burgundy-muted hover:underline mb-3"
            >
              Come ottenere il Personal Access Token <ExternalLink size={11} />
            </a>
            <Field label="Personal Access Token">
              <input
                type="password"
                placeholder="ey... (Revolut Business → API → Personal Access Token)"
                value={revolutToken}
                onChange={e => setRevolutToken(e.target.value)}
                autoComplete="off"
              />
            </Field>
            <div className="flex items-center gap-2 mt-2">
              <Btn variant="secondary" size="sm" onClick={saveRevolutToken}>
                {revolutSaved ? <><Check size={13} /> Salvato</> : 'Salva token'}
              </Btn>
              {revolutToken && (
                <Btn variant="ghost" size="sm" onClick={() => { setRevolutToken(''); localStorage.removeItem(REVOLUT_KEY); }}>
                  <X size={13} /> Rimuovi
                </Btn>
              )}
            </div>
          </div>

          <hr className="border-white/10" />

          {/* Setup instructions */}
          <details className="text-xs text-subtle">
            <summary className="cursor-pointer font-mono uppercase tracking-wide text-[10px] text-muted hover:text-ink">
              Istruzioni setup env vars Vercel
            </summary>
            <div className="mt-3 flex flex-col gap-2 font-mono bg-white/5 rounded p-3 text-[11px] leading-relaxed border border-white/8">
              <p className="text-ink font-medium">1. Genera le VAPID keys (una volta sola):</p>
              <code className="bg-white/5 border border-white/10 rounded px-2 py-1 block">npx web-push generate-vapid-keys</code>
              <p className="text-ink font-medium mt-1">2. Aggiungi su Vercel → Settings → Env Vars:</p>
              <code className="block">VITE_VAPID_PUBLIC_KEY = (public key)</code>
              <code className="block">VAPID_PRIVATE_KEY = (private key)</code>
              <code className="block">VAPID_EMAIL = mailto:tua@email.com</code>
              <code className="block">SUPABASE_SERVICE_ROLE_KEY = (da Supabase → Settings → API)</code>
              <p className="text-ink font-medium mt-1">3. Rideploya su Vercel</p>
            </div>
          </details>
        </div>
      )}

      {/* ── Tab: Obiettivi ── */}
      {activeTab === 'goals' && <GoalsSection />}
    </Modal>
  );
}
