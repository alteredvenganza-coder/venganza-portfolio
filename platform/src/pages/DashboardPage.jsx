import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { updateCreatorProfile, signOut } from '../lib/auth';

const LABEL = 'font-mono text-[10px] uppercase tracking-widest text-zinc-400';
const INPUT =
  'w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors';

function AccordionSection({ title, open, onToggle, children }) {
  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-900/60 transition-colors"
      >
        <span className={`${LABEL} text-zinc-300`}>{title}</span>
        <span className="font-mono text-zinc-500 text-xs">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-zinc-800 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className={`block mb-1.5 ${LABEL}`}>{label}</label>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { session, creator, loading, setCreator } = useAuth();

  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    location: '',
    primary_color: '#ffffff',
    bg_color: '#0a0a0a',
    instagram_handle: '',
    premade_hashtag: '',
    stripe_payment_link: '',
    premade_basic_price: '',
  });

  const [openSection, setOpenSection] = useState('identity');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // '' | 'saved' | 'error'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      navigate('/login');
    }
  }, [loading, session, navigate]);

  useEffect(() => {
    if (creator) {
      setFormData({
        display_name: creator.display_name || '',
        bio: creator.bio || '',
        location: creator.location || '',
        primary_color: creator.primary_color || '#ffffff',
        bg_color: creator.bg_color || '#0a0a0a',
        instagram_handle: creator.instagram_handle || '',
        premade_hashtag: creator.premade_hashtag || '',
        stripe_payment_link: creator.stripe_payment_link || '',
        premade_basic_price: creator.premade_basic_price ?? '',
      });
    }
  }, [creator]);

  const portfolioUrl = creator?.slug ? `${creator.slug}.folio.app` : '';

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCopy = () => {
    if (!portfolioUrl) return;
    navigator.clipboard.writeText(portfolioUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSave = async () => {
    if (!session?.user?.id) return;
    setSaving(true);
    setSaveStatus('');
    try {
      const updated = await updateCreatorProfile(session.user.id, formData);
      setCreator(updated);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleSection = (name) =>
    setOpenSection((prev) => (prev === name ? null : name));

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0a0a0a' }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          Loading...
        </p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div
      className="min-h-screen pb-24"
      style={{ backgroundColor: '#0a0a0a', color: '#fff' }}
    >
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-[#0a0a0a]/90 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <span
          className="text-white text-xl font-bold tracking-widest"
          style={{ fontFamily: 'var(--font-heading, serif)' }}
        >
          FOLIO
        </span>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-zinc-400 hidden sm:block">
            {creator?.display_name || session?.user?.email || ''}
          </span>
          <button
            onClick={handleLogout}
            className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors border border-zinc-800 rounded px-3 py-1.5 hover:border-zinc-600"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-10 space-y-8">

        {/* Hero stat row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Portfolio URL */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
            <span className={LABEL}>Portfolio URL</span>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-mono truncate flex-1">
                {portfolioUrl || '—'}
              </span>
              {portfolioUrl && (
                <button
                  onClick={handleCopy}
                  className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 hover:text-white border border-zinc-700 rounded px-2 py-1 transition-colors shrink-0"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
            <span className={LABEL}>Status</span>
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-2 h-2 rounded-full bg-emerald-400 shrink-0"
                aria-hidden="true"
              />
              <span className="text-emerald-400 text-sm font-mono">Live</span>
            </div>
          </div>

          {/* Instagram */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
            <span className={LABEL}>Instagram</span>
            <span className="text-white text-sm font-mono truncate">
              {creator?.instagram_handle
                ? `@${creator.instagram_handle}`
                : 'Not connected'}
            </span>
          </div>
        </div>

        {/* Quick Edit panel */}
        <div className="space-y-2">
          <p className={`${LABEL} mb-4`}>Quick Edit</p>

          {/* Identity */}
          <AccordionSection
            title="Identity"
            open={openSection === 'identity'}
            onToggle={() => toggleSection('identity')}
          >
            <Field label="Display Name">
              <input
                type="text"
                value={formData.display_name}
                onChange={handleChange('display_name')}
                placeholder="Your name"
                className={INPUT}
              />
            </Field>
            <Field label="Bio">
              <textarea
                value={formData.bio}
                onChange={handleChange('bio')}
                placeholder="A short bio..."
                rows={3}
                className={`${INPUT} resize-none`}
              />
            </Field>
            <Field label="Location">
              <input
                type="text"
                value={formData.location}
                onChange={handleChange('location')}
                placeholder="City, Country"
                className={INPUT}
              />
            </Field>
          </AccordionSection>

          {/* Brand */}
          <AccordionSection
            title="Brand"
            open={openSection === 'brand'}
            onToggle={() => toggleSection('brand')}
          >
            <Field label="Primary Color">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={handleChange('primary_color')}
                  className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0"
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={handleChange('primary_color')}
                  placeholder="#ffffff"
                  className={`${INPUT} flex-1`}
                />
              </div>
            </Field>
            <Field label="Background Color">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.bg_color}
                  onChange={handleChange('bg_color')}
                  className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0"
                />
                <input
                  type="text"
                  value={formData.bg_color}
                  onChange={handleChange('bg_color')}
                  placeholder="#0a0a0a"
                  className={`${INPUT} flex-1`}
                />
              </div>
            </Field>
          </AccordionSection>

          {/* Instagram */}
          <AccordionSection
            title="Instagram"
            open={openSection === 'instagram'}
            onToggle={() => toggleSection('instagram')}
          >
            <Field label="Instagram Handle">
              <input
                type="text"
                value={formData.instagram_handle}
                onChange={handleChange('instagram_handle')}
                placeholder="yourhandle"
                className={INPUT}
              />
            </Field>
            <Field label="Premade Hashtag">
              <input
                type="text"
                value={formData.premade_hashtag}
                onChange={handleChange('premade_hashtag')}
                placeholder="#yourhashtag"
                className={INPUT}
              />
            </Field>
          </AccordionSection>

          {/* Stripe */}
          <AccordionSection
            title="Stripe"
            open={openSection === 'stripe'}
            onToggle={() => toggleSection('stripe')}
          >
            <Field label="Stripe Payment Link">
              <input
                type="url"
                value={formData.stripe_payment_link}
                onChange={handleChange('stripe_payment_link')}
                placeholder="https://buy.stripe.com/..."
                className={INPUT}
              />
            </Field>
          </AccordionSection>

          {/* Pricing */}
          <AccordionSection
            title="Pricing"
            open={openSection === 'pricing'}
            onToggle={() => toggleSection('pricing')}
          >
            <Field label="Basic Package Price ($)">
              <input
                type="number"
                value={formData.premade_basic_price}
                onChange={handleChange('premade_basic_price')}
                placeholder="0"
                min="0"
                step="0.01"
                className={INPUT}
              />
            </Field>
          </AccordionSection>
        </div>

        {/* Preview link */}
        {portfolioUrl && (
          <div className="text-center pt-2">
            <a
              href={`https://${portfolioUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
            >
              View Portfolio →
            </a>
          </div>
        )}
      </main>

      {/* Fixed save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-zinc-800 bg-[#0a0a0a]/95 backdrop-blur-sm px-6 py-4 flex items-center justify-between gap-4">
        <div className="h-4">
          {saveStatus === 'saved' && (
            <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
              Changes saved
            </p>
          )}
          {saveStatus === 'error' && (
            <p className="font-mono text-[10px] uppercase tracking-widest text-red-400">
              Save failed — try again
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-white text-black font-mono text-xs font-semibold tracking-widest uppercase py-2.5 px-6 rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
