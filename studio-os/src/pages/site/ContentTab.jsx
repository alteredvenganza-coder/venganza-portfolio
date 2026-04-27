import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { fetchSiteSettings, updateSiteData } from '../../lib/db';
import { Field, ErrorBanner } from './_shared';

const DEFAULT_CONTENT = {
  hero: {
    eyebrow: 'Italian Creative Studio · Trieste',
    headline_top: 'Altered',
    headline_bottom: 'Venganza',
    accent_line: 'We build brands worth defending.',
    sub_paragraph: 'A small Italian studio shaping identity systems, apparel and tools for emerging brands. Strategic, editorial, made to outlast a single drop.',
    cta_primary_label: 'Schedule a Consultation',
    cta_primary_link: '/contact',
    cta_secondary_label: 'See What We Do',
    cta_secondary_link: '#services',
    image_caption_left: 'Studio · 2026',
    image_caption_right: 'Trieste · IT',
  },
  services: {
    eyebrow: '01 — Strategic Engagements',
    title:   'What we build',
    note:    'Built for brands that intend to ship more than once.',
  },
  work: {
    eyebrow: '02 — Selected Work',
    title:   'Case studies',
  },
  premades: {
    eyebrow: '03 — Quick Services',
    title:   'Premades & deliverables',
    sub:     'For founders who need speed — files, renders and packs that move from inbox to factory in days, not weeks.',
    browse_cta: 'Browse all premades',
  },
  apps: {
    eyebrow: "04 — Tools we're shipping",
    title:   'Software for creators',
    sub:     "Two products spinning out of the studio — built to fix problems we kept hitting in client work.",
  },
  cta: {
    eyebrow: "Let's build it",
    headline_top: 'If your brand is going to last,',
    headline_bottom: 'it deserves a real foundation.',
    sub: "Tell us where you are. We'll tell you honestly what makes sense — premade, custom, or somewhere between.",
    primary_label: 'Schedule a Consultation',
    primary_link: '/contact',
    secondary_label: 'Instagram',
    secondary_link: 'https://instagram.com',
  },
};

export default function ContentTab() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchSiteSettings()
      .then(s => {
        if (cancelled) return;
        const c = s?.data?.content || {};
        setContent(merge(DEFAULT_CONTENT, c));
      })
      .catch(e => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  function setSection(section, k, v) {
    setContent(c => ({ ...c, [section]: { ...c[section], [k]: v } }));
  }

  async function save() {
    setSaving(true); setError(null);
    try {
      await updateSiteData({ content });
      setSavedAt(new Date());
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  if (loading) return <p className="label-meta">Caricamento…</p>;

  return (
    <div>
      <ErrorBanner error={error} onClose={() => setError(null)} />

      <SectionGroup title="Hero" subtitle="Top of homepage.">
        <Field label="Eyebrow"><Input v={content.hero.eyebrow} onChange={v => setSection('hero', 'eyebrow', v)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Wordmark — top line"><Input v={content.hero.headline_top} onChange={v => setSection('hero', 'headline_top', v)} /></Field>
          <Field label="Wordmark — bottom line"><Input v={content.hero.headline_bottom} onChange={v => setSection('hero', 'headline_bottom', v)} /></Field>
        </div>
        <Field label="Italic accent line"><Input v={content.hero.accent_line} onChange={v => setSection('hero', 'accent_line', v)} /></Field>
        <Field label="Sub paragraph"><Textarea v={content.hero.sub_paragraph} onChange={v => setSection('hero', 'sub_paragraph', v)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Primary CTA label"><Input v={content.hero.cta_primary_label} onChange={v => setSection('hero', 'cta_primary_label', v)} /></Field>
          <Field label="Primary CTA link"><Input v={content.hero.cta_primary_link} onChange={v => setSection('hero', 'cta_primary_link', v)} /></Field>
          <Field label="Secondary CTA label"><Input v={content.hero.cta_secondary_label} onChange={v => setSection('hero', 'cta_secondary_label', v)} /></Field>
          <Field label="Secondary CTA link"><Input v={content.hero.cta_secondary_link} onChange={v => setSection('hero', 'cta_secondary_link', v)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Image caption — left"><Input v={content.hero.image_caption_left} onChange={v => setSection('hero', 'image_caption_left', v)} /></Field>
          <Field label="Image caption — right"><Input v={content.hero.image_caption_right} onChange={v => setSection('hero', 'image_caption_right', v)} /></Field>
        </div>
      </SectionGroup>

      <SectionGroup title="Services section">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Eyebrow"><Input v={content.services.eyebrow} onChange={v => setSection('services', 'eyebrow', v)} /></Field>
          <Field label="Title"><Input v={content.services.title} onChange={v => setSection('services', 'title', v)} /></Field>
          <Field label="Side note"><Input v={content.services.note} onChange={v => setSection('services', 'note', v)} /></Field>
        </div>
      </SectionGroup>

      <SectionGroup title="Work / case studies section">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Eyebrow"><Input v={content.work.eyebrow} onChange={v => setSection('work', 'eyebrow', v)} /></Field>
          <Field label="Title"><Input v={content.work.title} onChange={v => setSection('work', 'title', v)} /></Field>
        </div>
      </SectionGroup>

      <SectionGroup title="Premades section">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Eyebrow"><Input v={content.premades.eyebrow} onChange={v => setSection('premades', 'eyebrow', v)} /></Field>
          <Field label="Title"><Input v={content.premades.title} onChange={v => setSection('premades', 'title', v)} /></Field>
        </div>
        <Field label="Sub-copy"><Textarea v={content.premades.sub} onChange={v => setSection('premades', 'sub', v)} /></Field>
        <Field label="Browse CTA label"><Input v={content.premades.browse_cta} onChange={v => setSection('premades', 'browse_cta', v)} /></Field>
      </SectionGroup>

      <SectionGroup title="Apps section">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Eyebrow"><Input v={content.apps.eyebrow} onChange={v => setSection('apps', 'eyebrow', v)} /></Field>
          <Field label="Title"><Input v={content.apps.title} onChange={v => setSection('apps', 'title', v)} /></Field>
        </div>
        <Field label="Sub-copy"><Textarea v={content.apps.sub} onChange={v => setSection('apps', 'sub', v)} /></Field>
      </SectionGroup>

      <SectionGroup title="Final CTA section">
        <Field label="Eyebrow"><Input v={content.cta.eyebrow} onChange={v => setSection('cta', 'eyebrow', v)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Headline — top"><Input v={content.cta.headline_top} onChange={v => setSection('cta', 'headline_top', v)} /></Field>
          <Field label="Headline — bottom"><Input v={content.cta.headline_bottom} onChange={v => setSection('cta', 'headline_bottom', v)} /></Field>
        </div>
        <Field label="Sub"><Textarea v={content.cta.sub} onChange={v => setSection('cta', 'sub', v)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Primary label"><Input v={content.cta.primary_label} onChange={v => setSection('cta', 'primary_label', v)} /></Field>
          <Field label="Primary link"><Input v={content.cta.primary_link} onChange={v => setSection('cta', 'primary_link', v)} /></Field>
          <Field label="Secondary label"><Input v={content.cta.secondary_label} onChange={v => setSection('cta', 'secondary_label', v)} /></Field>
          <Field label="Secondary link"><Input v={content.cta.secondary_link} onChange={v => setSection('cta', 'secondary_link', v)} /></Field>
        </div>
      </SectionGroup>

      <div className="sticky bottom-0 glass-strong border-t border-white/10 -mx-3 sm:-mx-6 px-3 sm:px-6 py-3 flex items-center justify-between gap-2 mt-6">
        <span className="label-meta">{savedAt ? `Saved at ${savedAt.toLocaleTimeString()}` : 'Unsaved changes will be lost.'}</span>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm bg-burgundy text-white hover:bg-burgundy/90 transition-colors disabled:opacity-50">
          <Save size={14} /> {saving ? 'Saving…' : 'Save content'}
        </button>
      </div>
    </div>
  );
}

function SectionGroup({ title, subtitle, children }) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline gap-2 mb-3">
        <h3 className="text-sm font-medium text-ink">{title}</h3>
        {subtitle && <p className="label-meta">— {subtitle}</p>}
      </div>
      <div className="glass rounded-xl p-4 space-y-3">{children}</div>
    </div>
  );
}

function Input({ v, onChange }) {
  return <input value={v ?? ''} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 rounded-md text-sm" />;
}

function Textarea({ v, onChange }) {
  return <textarea rows={3} value={v ?? ''} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 rounded-md text-sm" />;
}

function merge(a, b) {
  const out = { ...a };
  for (const k of Object.keys(b || {})) {
    if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) {
      out[k] = merge(a[k] || {}, b[k]);
    } else if (b[k] !== undefined) {
      out[k] = b[k];
    }
  }
  return out;
}
