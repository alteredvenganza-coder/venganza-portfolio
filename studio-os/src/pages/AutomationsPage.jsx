import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Instagram, MessageCircle, MessagesSquare, Plus, Trash2, Power,
  CheckCircle2, AlertTriangle, Link2, Eye, EyeOff,
} from 'lucide-react';
import Panel from '../components/Panel';
import Btn from '../components/Btn';
import Modal from '../components/Modal';
import Field from '../components/Field';
import Badge from '../components/Badge';
import {
  useIgAccounts,
  useAutomationRules,
  useAutomationLogs,
} from '../hooks/useAutomations';
import { supabaseConfigured } from '../lib/supabase';
import { formatDate } from '../lib/utils';

export default function AutomationsPage() {
  const { accounts, loading: loadingAccounts, addAccount, deleteAccount } = useIgAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  const activeAccountId = selectedAccountId ?? accounts[0]?.id ?? null;

  const { rules, loading: loadingRules, addRule, deleteRule, toggleRule } =
    useAutomationRules(activeAccountId);
  const { logs } = useAutomationLogs({ limit: 25 });

  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [ruleModalOpen, setRuleModalOpen]       = useState(false);

  if (!supabaseConfigured) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-2xl font-semibold text-ink mb-3">Automazioni</h1>
        <div className="glass rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-burgundy shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-ink mb-2">Supabase non configurato</p>
              <p className="text-sm text-muted">
                Imposta <code className="px-1.5 py-0.5 bg-white/10 rounded text-[12px]">VITE_SUPABASE_URL</code> e <code className="px-1.5 py-0.5 bg-white/10 rounded text-[12px]">VITE_SUPABASE_ANON_KEY</code> su Vercel, poi esegui <code className="px-1 bg-white/10 rounded">supabase/automations.sql</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold text-ink">Automazioni</h1>
        <p className="text-sm text-muted mt-1">
          Comment-to-sell &amp; story-reply su Instagram. Quando un follower commenta o risponde a una storia con una keyword, il sistema risponde e/o invia un DM con un link.
        </p>
      </header>

      {/* Account IG */}
      <Panel
        title="Account Instagram"
        count={accounts.length}
        action={
          <Btn size="sm" variant="primary" onClick={() => setAccountModalOpen(true)}>
            <Plus size={14} /> Collega account
          </Btn>
        }
      >
        {loadingAccounts ? (
          <p className="text-sm text-subtle">Caricamento…</p>
        ) : accounts.length === 0 ? (
          <p className="text-sm text-subtle">
            Nessun account collegato. Aggiungine uno per iniziare.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {accounts.map(acc => (
              <button
                key={acc.id}
                onClick={() => setSelectedAccountId(acc.id)}
                className={`text-left p-3 rounded border transition-colors ${
                  acc.id === activeAccountId
                    ? 'border-burgundy bg-burgundy/15'
                    : 'border-white/10 hover:border-burgundy/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Instagram size={14} className="text-burgundy-muted" />
                    <span className="text-sm font-medium text-ink">{acc.label}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Rimuovere "${acc.label}"?`)) deleteAccount(acc.id);
                    }}
                    className="text-subtle hover:text-burgundy"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <p className="text-[11px] text-subtle mt-1 font-mono truncate">
                  ig:{acc.ig_user_id} · page:{acc.page_id}
                </p>
              </button>
            ))}
          </div>
        )}
      </Panel>

      {/* Regole */}
      <Panel
        title="Regole automation"
        count={rules.length}
        action={
          <Btn
            size="sm"
            variant="primary"
            onClick={() => setRuleModalOpen(true)}
            disabled={!activeAccountId}
          >
            <Plus size={14} /> Nuova regola
          </Btn>
        }
      >
        {!activeAccountId ? (
          <p className="text-sm text-subtle">Collega prima un account Instagram.</p>
        ) : loadingRules ? (
          <p className="text-sm text-subtle">Caricamento…</p>
        ) : rules.length === 0 ? (
          <p className="text-sm text-subtle">Nessuna regola. Creane una per partire.</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {rules.map(rule => <RuleRow key={rule.id} rule={rule} onToggle={toggleRule} onDelete={deleteRule} />)}
          </ul>
        )}
      </Panel>

      {/* Log */}
      <Panel title="Log eventi" count={logs.length}>
        {logs.length === 0 ? (
          <p className="text-sm text-subtle">Nessun evento ancora.</p>
        ) : (
          <ul className="space-y-1.5">
            {logs.map(log => <LogRow key={log.id} log={log} />)}
          </ul>
        )}
      </Panel>

      <AccountModal
        open={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        onSubmit={async (data) => { await addAccount(data); setAccountModalOpen(false); }}
      />
      <RuleModal
        open={ruleModalOpen}
        onClose={() => setRuleModalOpen(false)}
        igAccountId={activeAccountId}
        onSubmit={async (data) => { await addRule(data); setRuleModalOpen(false); }}
      />
    </div>
  );
}

// ─── Rule row ────────────────────────────────────────────────────────────────
function RuleRow({ rule, onToggle, onDelete }) {
  const TriggerIcon = rule.trigger === 'story_reply' ? MessagesSquare : MessageCircle;
  return (
    <motion.li
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-3 first:pt-0 last:pb-0 flex items-start gap-3"
    >
      <div className={`mt-0.5 p-1.5 rounded ${rule.active ? 'bg-burgundy/15 text-burgundy-muted' : 'bg-white/5 text-subtle'}`}>
        <TriggerIcon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink">{rule.name}</span>
          <Badge
            label={rule.trigger === 'story_reply' ? 'Story reply' : 'Comment'}
            bg={rule.trigger === 'story_reply' ? '#e8f0fe' : '#fce8e6'}
            color={rule.trigger === 'story_reply' ? '#1a56db' : '#7b1f24'}
          />
          {!rule.active && <Badge label="Pausa" bg="#f3efe8" color="#6b6460" />}
        </div>
        <p className="text-xs text-subtle mt-0.5 truncate">
          Keyword: <span className="font-mono">{rule.keywords.join(', ') || '—'}</span>
          {rule.post_id && <> · post <span className="font-mono">{rule.post_id}</span></>}
        </p>
        <p className="text-xs text-muted mt-1 line-clamp-2">
          DM: "{rule.dm_text}"{rule.dm_link && <> · <Link2 size={11} className="inline" /> {rule.dm_link}</>}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onToggle(rule.id, !rule.active)}
          className="p-1.5 text-subtle hover:text-ink rounded"
          title={rule.active ? 'Metti in pausa' : 'Riattiva'}
        >
          {rule.active ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button
          onClick={() => { if (confirm(`Eliminare la regola "${rule.name}"?`)) onDelete(rule.id); }}
          className="p-1.5 text-subtle hover:text-burgundy rounded"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.li>
  );
}

// ─── Log row ─────────────────────────────────────────────────────────────────
function LogRow({ log }) {
  const meta = LOG_META[log.event_type] ?? { color: 'text-subtle', Icon: Power };
  const Icon = meta.Icon;
  return (
    <li className="flex items-center gap-2 text-xs">
      <Icon size={12} className={meta.color} />
      <span className="font-mono text-subtle w-32 shrink-0">{formatDate(log.created_at)}</span>
      <span className="text-ink">{log.event_type}</span>
      {log.message && <span className="text-muted truncate">— {log.message}</span>}
    </li>
  );
}

const LOG_META = {
  webhook_received: { color: 'text-subtle',     Icon: Power },
  rule_matched:     { color: 'text-blue-600',   Icon: CheckCircle2 },
  no_match:         { color: 'text-subtle',     Icon: Power },
  comment_replied:  { color: 'text-green-700',  Icon: CheckCircle2 },
  dm_sent:          { color: 'text-green-700',  Icon: CheckCircle2 },
  dm_failed:        { color: 'text-burgundy',   Icon: AlertTriangle },
};

// ─── Account modal ───────────────────────────────────────────────────────────
function AccountModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ label: '', ig_user_id: '', page_id: '', access_token: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  function update(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await onSubmit(form);
      setForm({ label: '', ig_user_id: '', page_id: '', access_token: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Collega account Instagram">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-muted">
          Recupera questi valori dal{' '}
          <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" className="text-burgundy-muted underline">
            Graph API Explorer
          </a>.
        </p>
        <Field label="Nome (visibile solo a te)" required>
          <input className={INPUT} value={form.label} onChange={e => update('label', e.target.value)} required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="IG user id" required>
            <input className={INPUT} value={form.ig_user_id} onChange={e => update('ig_user_id', e.target.value)} required />
          </Field>
          <Field label="Page id" required>
            <input className={INPUT} value={form.page_id} onChange={e => update('page_id', e.target.value)} required />
          </Field>
        </div>
        <Field label="Page access token (long-lived)" required>
          <input className={INPUT} type="password" value={form.access_token} onChange={e => update('access_token', e.target.value)} required />
        </Field>
        {error && <p className="text-xs text-burgundy">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Btn variant="ghost" onClick={onClose} type="button">Annulla</Btn>
          <Btn variant="primary" type="submit" disabled={busy}>
            {busy ? 'Salvataggio…' : 'Salva'}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

// ─── Rule modal ──────────────────────────────────────────────────────────────
function RuleModal({ open, onClose, igAccountId, onSubmit }) {
  const [form, setForm] = useState(emptyRule());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  function update(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await onSubmit({
        ...form,
        ig_account_id: igAccountId,
        keywords: form.keywords.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
      });
      setForm(emptyRule());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const isComment = form.trigger === 'comment';

  return (
    <Modal open={open} onClose={onClose} title="Nuova regola" width="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nome regola" required>
          <input className={INPUT} value={form.name} onChange={e => update('name', e.target.value)} required />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Trigger" required>
            <select className={INPUT} value={form.trigger} onChange={e => update('trigger', e.target.value)}>
              <option value="comment">Commento su post / reel</option>
              <option value="story_reply">Risposta a storia (DM)</option>
            </select>
          </Field>
          <Field label="Match" required>
            <select className={INPUT} value={form.match_mode} onChange={e => update('match_mode', e.target.value)}>
              <option value="any">Una qualunque keyword</option>
              <option value="exact">Testo identico a una keyword</option>
            </select>
          </Field>
        </div>

        {isComment && (
          <Field label="Post / Reel id (opzionale)">
            <input
              className={INPUT}
              placeholder="lascia vuoto = applica a tutti i post"
              value={form.post_id ?? ''}
              onChange={e => update('post_id', e.target.value || null)}
            />
          </Field>
        )}

        <Field label="Keyword (separate da virgola)" required>
          <input
            className={INPUT}
            placeholder="link, info, prezzo"
            value={form.keywords}
            onChange={e => update('keywords', e.target.value)}
            required
          />
        </Field>

        {isComment && (
          <Field label="Risposta pubblica al commento (opzionale)">
            <input
              className={INPUT}
              placeholder="Ti ho mandato il link in DM 💌"
              value={form.reply_comment ?? ''}
              onChange={e => update('reply_comment', e.target.value || null)}
            />
          </Field>
        )}

        <Field label="Testo DM" required>
          <textarea
            className={`${INPUT} min-h-[80px]`}
            placeholder="Ciao! Ecco il link che mi hai chiesto:"
            value={form.dm_text}
            onChange={e => update('dm_text', e.target.value)}
            required
          />
        </Field>

        <Field label="Link da inviare nel DM (opzionale)">
          <input
            className={INPUT}
            type="url"
            placeholder="https://…"
            value={form.dm_link ?? ''}
            onChange={e => update('dm_link', e.target.value || null)}
          />
        </Field>

        {error && <p className="text-xs text-burgundy">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Btn variant="ghost" onClick={onClose} type="button">Annulla</Btn>
          <Btn variant="primary" type="submit" disabled={busy || !igAccountId}>
            {busy ? 'Salvataggio…' : 'Crea regola'}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

function emptyRule() {
  return {
    name: '',
    trigger: 'comment',
    post_id: null,
    keywords: '',
    match_mode: 'any',
    reply_comment: null,
    dm_text: '',
    dm_link: null,
    active: true,
  };
}

const INPUT = 'w-full text-sm';
