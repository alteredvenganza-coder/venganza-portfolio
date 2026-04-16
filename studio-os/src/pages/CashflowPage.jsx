import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, RefreshCw, ChevronLeft, ChevronRight, Trash2, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Btn from '../components/Btn';
import Modal from '../components/Modal';
import Field from '../components/Field';
import { useStore } from '../hooks/useStore';
import * as cf from '../lib/cashflow';

const REVOLUT_KEY = 'revolut-api-token';

const MONTHS_FULL  = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
const MONTHS_SHORT = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];

const SCOPE_TABS = ['Tutto', 'Entrate', 'Uscite'];

const EMPTY_FORM = {
  type: 'uscita',
  amount: '',
  category: 'Altro',
  description: '',
  date: new Date().toISOString().split('T')[0],
};

function fmt(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n ?? 0);
}

// ── Year mini-bar chart ────────────────────────────────────────────────────────

function YearChart({ entries, year, selectedMonth, onSelect }) {
  const data = useMemo(() => Array.from({ length: 12 }, (_, m) => {
    const me = entries.filter(e => {
      const d = new Date(e.date + 'T00:00:00');
      return d.getFullYear() === year && d.getMonth() === m;
    });
    return {
      entrate: me.filter(e => e.type === 'entrata').reduce((s, e) => s + e.amount, 0),
      uscite:  me.filter(e => e.type === 'uscita').reduce((s, e)  => s + e.amount, 0),
    };
  }), [entries, year]);

  const maxVal = Math.max(...data.flatMap(d => [d.entrate, d.uscite]), 1);
  const BAR_H  = 52;

  return (
    <div className="flex items-end gap-0.5 sm:gap-1" style={{ height: BAR_H + 18 }}>
      {data.map((d, m) => {
        const isSelected = m === selectedMonth;
        return (
          <button
            key={m}
            onClick={() => onSelect(m)}
            className="flex-1 flex flex-col items-center gap-0.5 group min-w-0"
            title={`${MONTHS_FULL[m]}: +${fmt(d.entrate)} / -${fmt(d.uscite)}`}
          >
            <div className="w-full flex items-end gap-px" style={{ height: BAR_H }}>
              <div
                className={`flex-1 rounded-t transition-all duration-200 ${isSelected ? 'bg-green-400/90' : 'bg-green-500/35 group-hover:bg-green-500/55'}`}
                style={{ height: d.entrate > 0 ? Math.max((d.entrate / maxVal) * BAR_H, 3) : 0 }}
              />
              <div
                className={`flex-1 rounded-t transition-all duration-200 ${isSelected ? 'bg-red-400/90' : 'bg-red-500/35 group-hover:bg-red-500/55'}`}
                style={{ height: d.uscite > 0 ? Math.max((d.uscite / maxVal) * BAR_H, 3) : 0 }}
              />
            </div>
            <span className={`text-[9px] font-mono transition-colors ${isSelected ? 'text-burgundy-muted font-bold' : 'text-subtle group-hover:text-muted'}`}>
              {MONTHS_SHORT[m]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Category badge ─────────────────────────────────────────────────────────────

const CATEGORY_COLORS = {
  'Ristoranti & Food':  'bg-orange-900/40 text-orange-300 border-orange-700/30',
  'Spesa alimentare':   'bg-lime-900/40 text-lime-300 border-lime-700/30',
  'Shopping':           'bg-pink-900/40 text-pink-300 border-pink-700/30',
  'Trasporti':          'bg-sky-900/40 text-sky-300 border-sky-700/30',
  'Casa & Utenze':      'bg-stone-800/60 text-stone-300 border-stone-600/30',
  'Salute & Farmacia':  'bg-teal-900/40 text-teal-300 border-teal-700/30',
  'Svago & Sport':      'bg-violet-900/40 text-violet-300 border-violet-700/30',
  'Abbonamenti':        'bg-indigo-900/40 text-indigo-300 border-indigo-700/30',
  'Software & Tools':   'bg-cyan-900/40 text-cyan-300 border-cyan-700/30',
  'Marketing':          'bg-yellow-900/40 text-yellow-300 border-yellow-700/30',
  'Fisco & Tasse':      'bg-red-900/40 text-red-300 border-red-700/30',
  'Formazione':         'bg-purple-900/40 text-purple-300 border-purple-700/30',
  'Fattura cliente':    'bg-green-900/40 text-green-300 border-green-700/30',
  'Retainer mensile':   'bg-emerald-900/40 text-emerald-300 border-emerald-700/30',
};

function CategoryBadge({ cat }) {
  const cls = CATEGORY_COLORS[cat] ?? 'bg-white/8 text-muted border-white/10';
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${cls}`}>{cat}</span>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function CashflowPage() {
  const { user } = useStore();
  const today    = new Date();

  /** Block mouse-wheel horizontal scroll on desktop */
  const blockWheelScroll = useCallback((e) => {
    if (window.matchMedia('(pointer: fine)').matches) e.preventDefault();
  }, []);

  const [entries,     setEntries]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [dbError,     setDbError]     = useState('');
  const [year,        setYear]        = useState(today.getFullYear());
  const [month,       setMonth]       = useState(today.getMonth());
  const [scopeTab,    setScopeTab]    = useState('Tutto');
  const [addOpen,     setAddOpen]     = useState(false);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMsg,     setSyncMsg]     = useState('');

  const revolutToken = localStorage.getItem(REVOLUT_KEY) ?? '';

  // ── Load entries ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    cf.fetchEntries(user.id)
      .then(setEntries)
      .catch(e => setDbError(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  // ── Filter by month ───────────────────────────────────────────────────────────
  const monthEntries = useMemo(() => {
    let list = entries.filter(e => {
      const d = new Date(e.date + 'T00:00:00');
      return d.getFullYear() === year && d.getMonth() === month;
    });
    if (scopeTab === 'Entrate') list = list.filter(e => e.type === 'entrata');
    if (scopeTab === 'Uscite')  list = list.filter(e => e.type === 'uscita');
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, year, month, scopeTab]);

  const entrate = useMemo(() =>
    entries.filter(e => { const d = new Date(e.date + 'T00:00:00'); return d.getFullYear() === year && d.getMonth() === month && e.type === 'entrata'; })
      .reduce((s, e) => s + e.amount, 0), [entries, year, month]);

  const uscite = useMemo(() =>
    entries.filter(e => { const d = new Date(e.date + 'T00:00:00'); return d.getFullYear() === year && d.getMonth() === month && e.type === 'uscita'; })
      .reduce((s, e) => s + e.amount, 0), [entries, year, month]);

  const netto = entrate - uscite;

  // ── Top spesa category for the month ─────────────────────────────────────────
  const topCategory = useMemo(() => {
    const usciteMonth = entries.filter(e => {
      const d = new Date(e.date + 'T00:00:00');
      return d.getFullYear() === year && d.getMonth() === month && e.type === 'uscita';
    });
    if (!usciteMonth.length) return null;
    const bycat = {};
    usciteMonth.forEach(e => { bycat[e.category] = (bycat[e.category] ?? 0) + e.amount; });
    return Object.entries(bycat).sort((a, b) => b[1] - a[1])[0];
  }, [entries, year, month]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  function setField(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.amount || !form.date) return;
    setSaving(true);
    try {
      const entry = await cf.insertEntry(user.id, form);
      setEntries(prev => [entry, ...prev]);
      setAddOpen(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      alert('Errore: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Eliminare questa voce?')) return;
    setEntries(prev => prev.filter(e => e.id !== id));
    await cf.deleteEntry(id).catch(console.error);
  }

  async function handleRevolutSync() {
    if (!revolutToken) return;
    setSyncLoading(true);
    setSyncMsg('');
    try {
      const from = `${year}-01-01T00:00:00Z`;
      const to   = `${year}-12-31T23:59:59Z`;
      const resp = await fetch('/api/revolut-sync', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token: revolutToken, from, to }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Errore sync');
      if (!Array.isArray(data) || !data.length) {
        setSyncMsg('Nessuna transazione trovata per questo anno.');
        return;
      }
      const upserted = await cf.upsertRevolutEntries(user.id, data);
      setEntries(prev => {
        const ids = new Set(upserted.map(e => e.id));
        return [...upserted, ...prev.filter(e => !ids.has(e.id))].sort((a, b) => b.date.localeCompare(a.date));
      });
      setSyncMsg(`✓ ${upserted.length} transazioni importate (auto-categorizzate)`);
    } catch (err) {
      setSyncMsg('⚠ ' + err.message);
    } finally {
      setSyncLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Finanze</h1>
          <p className="text-sm text-subtle mt-0.5">Entrate, uscite personali e business — manuale o sync Revolut</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {revolutToken && (
            <Btn variant="secondary" size="sm" onClick={handleRevolutSync} disabled={syncLoading}>
              <RefreshCw size={13} className={syncLoading ? 'animate-spin' : ''} />
              {syncLoading ? 'Sync in corso…' : 'Sync Revolut'}
            </Btn>
          )}
          <Btn variant="primary" size="sm" onClick={() => { setForm(EMPTY_FORM); setAddOpen(true); }}>
            <Plus size={14} /> Aggiungi
          </Btn>
        </div>
      </div>

      {syncMsg && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-xs mb-4 ${syncMsg.startsWith('✓') ? 'text-green-400' : 'text-yellow-400'}`}
        >
          {syncMsg}
        </motion.p>
      )}

      {dbError && (
        <div className="glass rounded-lg p-4 mb-6 text-sm text-red-300 border border-red-800/30">
          {dbError.includes('cashflow_entries') || dbError.includes('does not exist')
            ? <>Tabella mancante — esegui questa SQL su Supabase:<br /><code className="text-xs font-mono bg-white/5 px-2 py-1 rounded mt-2 block">CREATE TABLE cashflow_entries (...) — vedi MIGRATION.md</code></>
            : dbError}
        </div>
      )}

      {/* ── Year overview ── */}
      <div className="glass rounded-xl p-4 sm:p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => setYear(y => y - 1)} className="p-2 text-subtle hover:text-ink transition-colors rounded min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center">
            <ChevronLeft size={16} />
          </button>
          <span className="font-mono text-sm font-semibold text-ink w-12 text-center">{year}</span>
          <button onClick={() => setYear(y => y + 1)} className="p-2 text-subtle hover:text-ink transition-colors rounded min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center">
            <ChevronRight size={16} />
          </button>
          <div className="flex items-center gap-3 ml-auto text-[11px] text-subtle">
            <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-sm bg-green-500/60" /> Entrate</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-sm bg-red-500/60" /> Uscite</span>
          </div>
        </div>
        <YearChart entries={entries} year={year} selectedMonth={month} onSelect={setMonth} />
      </div>

      {/* ── Month header + stats ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }} className="p-2 text-subtle hover:text-ink transition-colors rounded min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ChevronLeft size={15} />
          </button>
          <h2 className="font-display text-lg sm:text-xl text-ink min-w-[140px] sm:min-w-[180px] text-center">{MONTHS_FULL[month]} {year}</h2>
          <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }} className="p-2 text-subtle hover:text-ink transition-colors rounded min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="flex gap-2 sm:ml-auto overflow-x-auto scrollbar-hide hscroll-contain" onWheel={blockWheelScroll}>
          {[
            { label: 'Entrate', value: entrate, color: 'text-green-400', icon: TrendingUp },
            { label: 'Uscite',  value: uscite,  color: 'text-red-400',   icon: TrendingDown },
            { label: 'Netto',   value: netto,   color: netto >= 0 ? 'text-green-400' : 'text-red-400', icon: Wallet },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="glass rounded-lg px-3 py-2 text-center min-w-[88px]">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Icon size={11} className={color} />
                <p className="text-[10px] text-subtle uppercase tracking-wide">{label}</p>
              </div>
              <p className={`text-sm font-semibold font-mono ${color}`}>{fmt(value)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top spesa hint */}
      {topCategory && (
        <p className="text-xs text-subtle mb-4">
          Categoria con più uscite: <span className="text-muted font-medium">{topCategory[0]}</span> — {fmt(topCategory[1])}
        </p>
      )}

      {/* ── Scope tabs ── */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/10 mb-4 w-fit">
        {SCOPE_TABS.map(t => (
          <button
            key={t}
            onClick={() => setScopeTab(t)}
            className={`px-3 py-2 sm:py-1 rounded text-xs font-medium transition-colors min-h-[44px] sm:min-h-0 ${
              scopeTab === t ? 'bg-burgundy text-white' : 'text-muted hover:text-ink hover:bg-white/8'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Transaction list ── */}
      {loading ? (
        <p className="text-sm text-subtle text-center py-16">Caricamento…</p>
      ) : monthEntries.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center">
          <Wallet size={36} className="text-subtle mx-auto mb-3 opacity-30" />
          <p className="text-sm text-subtle">Nessuna voce per {MONTHS_FULL[month]}.</p>
          <p className="text-xs text-subtle mt-1 mb-4">
            {revolutToken ? 'Aggiungi manualmente o fai sync con Revolut.' : 'Aggiungi manualmente oppure configura Revolut in Impostazioni.'}
          </p>
          <Btn variant="secondary" size="sm" onClick={() => setAddOpen(true)}>
            <Plus size={13} /> Aggiungi voce
          </Btn>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            key={`${year}-${month}-${scopeTab}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl overflow-hidden"
          >
            {monthEntries.map((entry, i) => (
              <div
                key={entry.id}
                className={`flex items-center gap-3 px-4 py-3 group ${i > 0 ? 'border-t border-white/8' : ''}`}
              >
                {/* Color strip */}
                <div className={`w-1 h-9 rounded-full flex-shrink-0 ${entry.type === 'entrata' ? 'bg-green-500/70' : 'bg-red-500/50'}`} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink truncate leading-tight">
                    {entry.description || entry.category || '—'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-[11px] text-subtle">
                      {new Date(entry.date + 'T00:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                    </span>
                    {entry.category && <CategoryBadge cat={entry.category} />}
                    {entry.source === 'revolut' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-700/30">Revolut</span>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <span className={`font-mono text-sm font-semibold flex-shrink-0 ${entry.type === 'entrata' ? 'text-green-400' : 'text-red-400'}`}>
                  {entry.type === 'entrata' ? '+' : '-'}{fmt(entry.amount)}
                </span>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="p-2 text-subtle hover:text-red-400 transition-colors sm:opacity-0 sm:group-hover:opacity-100 flex-shrink-0 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Add entry modal ── */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Aggiungi voce" width="max-w-sm">
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          {/* Type toggle */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
            {['entrata', 'uscita'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setField('type', t)}
                className={`flex-1 py-1.5 px-3 rounded text-sm font-medium transition-colors ${
                  form.type === t
                    ? t === 'entrata'
                      ? 'bg-green-800/60 text-green-200 border border-green-700/40'
                      : 'bg-red-900/60 text-red-200 border border-red-800/40'
                    : 'text-muted hover:text-ink hover:bg-white/8'
                }`}
              >
                {t === 'entrata' ? '↑ Entrata' : '↓ Uscita'}
              </button>
            ))}
          </div>

          <Field label="Importo (€)" required>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              value={form.amount}
              onChange={e => setField('amount', e.target.value)}
              required
              autoFocus
            />
          </Field>

          <Field label="Categoria">
            <select value={form.category} onChange={e => setField('category', e.target.value)}>
              {(form.type === 'entrata' ? cf.CATEGORIES_ENTRATA : cf.CATEGORIES_USCITA).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Descrizione">
            <input
              type="text"
              placeholder={form.type === 'entrata' ? 'es. Saldo logo branding' : 'es. Netflix, Supermercato…'}
              value={form.description}
              onChange={e => setField('description', e.target.value)}
            />
          </Field>

          <Field label="Data" required>
            <input
              type="date"
              value={form.date}
              onChange={e => setField('date', e.target.value)}
              required
            />
          </Field>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-border">
            <Btn variant="ghost" size="sm" type="button" onClick={() => setAddOpen(false)} className="w-full sm:w-auto">Annulla</Btn>
            <Btn
              variant="primary"
              size="sm"
              type="submit"
              disabled={saving || !form.amount || !form.date}
              className="w-full sm:w-auto"
            >
              {saving ? 'Salvataggio…' : `Aggiungi ${form.type}`}
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
