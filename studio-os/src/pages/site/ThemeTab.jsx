import { useState, useEffect } from 'react';
import { Palette, Type, Save, Plus, Trash2 } from 'lucide-react';
import { fetchSiteSettings, updateSiteSettings, updateSiteData, uploadSiteAsset } from '../../lib/db';
import { Field, ImageSlotCard, ErrorBanner } from './_shared';

const IMAGE_SLOTS = [
  { key: 'hero_image',             label: 'Hero image',               hint: 'Right side of the homepage hero. Portrait works best.' },
  { key: 'case_study_maali_image', label: 'MAALI — case study',       hint: 'Featured 4:5 image for the MAALI block.' },
  { key: 'case_study_04_image',    label: '[04] STUDIOS — case study', hint: 'Square image for the secondary case study.' },
];

const COLOR_KEYS = [
  { key: 'primary',    label: 'Primary',    hint: 'Used for accent text & CTA buttons.' },
  { key: 'background', label: 'Background', hint: 'Page background.' },
  { key: 'text',       label: 'Text',       hint: 'Main body text color.' },
];

const FONT_OPTIONS = {
  heading: ['Bebas Neue', 'Playfair Display', 'Inter', 'DM Mono'],
  body:    ['Inter', 'Playfair Display', 'DM Mono'],
  mono:    ['Space Mono', 'DM Mono', 'Inter'],
};

const DEFAULT_THEME = {
  colors: { primary: '#7b1f24', background: '#ffffff', text: '#0a0a0a' },
  fonts:  { heading: 'Bebas Neue', body: 'Inter', mono: 'Space Mono' },
};

export default function ThemeTab() {
  const [settings, setSettings] = useState(null);
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [savingTheme, setSavingTheme] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchSiteSettings()
      .then(s => {
        if (cancelled) return;
        setSettings(s);
        const t = s?.data?.theme || {};
        setTheme({
          colors: { ...DEFAULT_THEME.colors, ...(t.colors || {}) },
          fonts:  { ...DEFAULT_THEME.fonts,  ...(t.fonts  || {}) },
        });
        setPresets(s?.data?.theme_presets || []);
      })
      .catch(e => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  async function handleUpload(key, file) {
    setSavingKey(key); setError(null);
    try {
      const { url } = await uploadSiteAsset(file, 'theme');
      await updateSiteSettings({ [key]: url });
      setSettings(s => ({ ...s, [key]: url }));
    } catch (e) { setError(e.message); }
    finally { setSavingKey(null); }
  }

  async function handleClear(key) {
    if (!window.confirm('Remove this image?')) return;
    setSavingKey(key);
    try {
      await updateSiteSettings({ [key]: null });
      setSettings(s => ({ ...s, [key]: null }));
    } catch (e) { setError(e.message); }
    finally { setSavingKey(null); }
  }

  function setColor(k, v) { setTheme(t => ({ ...t, colors: { ...t.colors, [k]: v } })); }
  function setFont(k, v)  { setTheme(t => ({ ...t, fonts:  { ...t.fonts,  [k]: v } })); }

  async function saveTheme() {
    setSavingTheme(true); setError(null);
    try {
      await updateSiteData({ theme });
    } catch (e) { setError(e.message); }
    finally { setSavingTheme(false); }
  }

  async function savePreset() {
    const name = window.prompt('Preset name?');
    if (!name) return;
    const next = [...presets, { name, theme: { ...theme }, created_at: new Date().toISOString() }];
    setPresets(next);
    try { await updateSiteData({ theme_presets: next }); }
    catch (e) { setError(e.message); }
  }

  async function loadPreset(p) {
    setTheme(p.theme);
  }

  async function deletePreset(idx) {
    const next = presets.filter((_, i) => i !== idx);
    setPresets(next);
    try { await updateSiteData({ theme_presets: next }); }
    catch (e) { setError(e.message); }
  }

  if (loading) return <p className="label-meta">Caricamento…</p>;

  return (
    <div>
      <ErrorBanner error={error} onClose={() => setError(null)} />

      {/* IMAGES */}
      <Section title="Images" subtitle="Hero + featured case study photography. Public on the site immediately.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {IMAGE_SLOTS.map(slot => (
            <ImageSlotCard
              key={slot.key}
              slot={slot}
              value={settings?.[slot.key]}
              saving={savingKey === slot.key}
              onUpload={file => handleUpload(slot.key, file)}
              onClear={() => handleClear(slot.key)}
            />
          ))}
        </div>
      </Section>

      {/* COLORS */}
      <Section title="Colors" subtitle="Affects buttons, accents and background tone." icon={Palette}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLOR_KEYS.map(c => (
            <ColorPicker
              key={c.key}
              label={c.label}
              hint={c.hint}
              value={theme.colors[c.key] || '#000000'}
              onChange={v => setColor(c.key, v)}
            />
          ))}
        </div>
      </Section>

      {/* FONTS */}
      <Section title="Typography" subtitle="Pair display + body + mono for the site." icon={Type}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FontSelect label="Heading"   value={theme.fonts.heading} options={FONT_OPTIONS.heading} onChange={v => setFont('heading', v)} sample="Altered Venganza" />
          <FontSelect label="Body"      value={theme.fonts.body}    options={FONT_OPTIONS.body}    onChange={v => setFont('body', v)}    sample="The quick brown fox" />
          <FontSelect label="Monospace" value={theme.fonts.mono}    options={FONT_OPTIONS.mono}    onChange={v => setFont('mono', v)}    sample="01 — Strategic" />
        </div>
      </Section>

      {/* PREVIEW + SAVE */}
      <Section title="Preview" subtitle="Live preview of selected colors and fonts.">
        <div className="glass rounded-xl p-6" style={{ background: theme.colors.background, color: theme.colors.text }}>
          <p className="text-[11px] uppercase tracking-[0.3em] mb-4" style={{ color: theme.colors.primary, fontFamily: theme.fonts.mono }}>Italian Studio · Trieste</p>
          <h2 style={{ fontFamily: theme.fonts.heading, fontSize: '3rem', lineHeight: 1, marginBottom: '0.5rem' }}>Altered Venganza</h2>
          <p style={{ fontFamily: theme.fonts.body, fontStyle: 'italic', fontSize: '1.25rem', opacity: 0.75 }}>We build brands worth defending.</p>
          <button className="mt-4 px-6 py-3 rounded-full text-xs uppercase tracking-widest" style={{ background: theme.colors.primary, color: theme.colors.background, fontFamily: theme.fonts.mono }}>
            Schedule a Consultation
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={saveTheme} disabled={savingTheme} className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm bg-burgundy text-white hover:bg-burgundy/90 transition-colors disabled:opacity-50">
            <Save size={14} /> {savingTheme ? 'Saving…' : 'Save theme'}
          </button>
          <button onClick={savePreset} className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm bg-white/5 text-muted hover:text-ink hover:bg-white/10 transition-colors">
            <Plus size={14} /> Save as preset
          </button>
        </div>
      </Section>

      {/* PRESETS */}
      {presets.length > 0 && (
        <Section title="Presets" subtitle="Saved combinations you can reload.">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {presets.map((p, i) => (
              <div key={i} className="glass rounded-lg p-3 flex items-center gap-3">
                <div className="flex gap-1.5 shrink-0">
                  <span className="w-5 h-5 rounded-full border border-white/15" style={{ background: p.theme.colors.primary }} />
                  <span className="w-5 h-5 rounded-full border border-white/15" style={{ background: p.theme.colors.background }} />
                  <span className="w-5 h-5 rounded-full border border-white/15" style={{ background: p.theme.colors.text }} />
                </div>
                <span className="text-sm text-ink flex-1 truncate">{p.name}</span>
                <button onClick={() => loadPreset(p)} className="text-[10px] font-mono uppercase tracking-wider text-muted hover:text-ink">Load</button>
                <button onClick={() => deletePreset(i)} className="text-muted hover:text-burgundy-muted"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="mb-8">
      <div className="flex items-baseline gap-2 mb-3">
        {Icon && <Icon size={14} className="text-burgundy-muted" />}
        <h3 className="text-sm font-medium text-ink">{title}</h3>
        {subtitle && <p className="label-meta">— {subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function ColorPicker({ label, hint, value, onChange }) {
  return (
    <div className="glass rounded-xl p-4">
      <p className="text-sm font-medium text-ink mb-1">{label}</p>
      {hint && <p className="label-meta mb-3">{hint}</p>}
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-12 h-12 rounded border border-white/15 bg-transparent cursor-pointer"
          style={{ padding: 2 }}
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded-md text-sm font-mono"
        />
      </div>
    </div>
  );
}

function FontSelect({ label, value, options, onChange, sample }) {
  return (
    <div className="glass rounded-xl p-4">
      <p className="text-sm font-medium text-ink mb-3">{label}</p>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 rounded-md text-sm mb-3">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <p className="text-xl text-ink truncate" style={{ fontFamily: value }}>{sample}</p>
    </div>
  );
}
