import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { updateCreatorProfile, signOut } from '../lib/auth';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const LABEL_CAPS =
  'text-[10px] font-semibold uppercase tracking-widest text-[#6e6e73]';

const INPUT =
  'w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-[#1d1d1f] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-all';

const CARD = 'bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden';

// ─── Nav section definitions ───────────────────────────────────────────────────
const NAV_SECTIONS = [
  { id: 'overview',   label: 'Overview',   icon: '⊞', eyebrow: 'Dashboard',    heading: 'Overview'   },
  { id: 'identity',   label: 'Identity',   icon: '✦', eyebrow: 'Profile',      heading: 'Identity'   },
  { id: 'brand',      label: 'Brand',      icon: '◉', eyebrow: 'Appearance',   heading: 'Brand'      },
  { id: 'instagram',  label: 'Instagram',  icon: '◈', eyebrow: 'Social',       heading: 'Instagram'  },
  { id: 'payments',   label: 'Payments',   icon: '◇', eyebrow: 'Monetisation', heading: 'Payments'   },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function NavLink({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
        active
          ? 'bg-[#0071e3]/10 text-[#0071e3]'
          : 'text-[#1d1d1f] hover:bg-gray-100'
      }`}
    >
      <span className="text-base leading-none">{icon}</span>
      {label}
    </button>
  );
}

function StatTile({ label, value, accent }) {
  return (
    <div className={`${CARD} p-5 flex flex-col gap-1`}>
      <p className={LABEL_CAPS}>{label}</p>
      <p
        className="text-base font-semibold truncate"
        style={{ color: accent || '#1d1d1f' }}
      >
        {value || '—'}
      </p>
    </div>
  );
}

function SectionHeader({ eyebrow, heading }) {
  return (
    <div className="mb-6">
      <p className={`${LABEL_CAPS} mb-1`}>{eyebrow}</p>
      <h2 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
        {heading}
      </h2>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className={`block ${LABEL_CAPS}`}>{label}</label>
      {children}
      {hint && <p className="text-xs text-[#6e6e73]">{hint}</p>}
    </div>
  );
}

function SettingsCard({ title, description, children }) {
  return (
    <div className={CARD}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-gray-100">
          {title && (
            <h3 className="text-sm font-semibold text-[#1d1d1f]">{title}</h3>
          )}
          {description && (
            <p className="mt-0.5 text-xs text-[#6e6e73]">{description}</p>
          )}
        </div>
      )}
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
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

  const [activeSection, setActiveSection] = useState('overview');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // '' | 'saved' | 'error'
  const [copied, setCopied] = useState(false);

  // ── auth guard ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !session) {
      navigate('/login');
    }
  }, [loading, session, navigate]);

  // ── sync creator → form ───────────────────────────────────────────────────────
  useEffect(() => {
    if (creator) {
      setFormData({
        display_name:        creator.display_name        || '',
        bio:                 creator.bio                 || '',
        location:            creator.location            || '',
        primary_color:       creator.primary_color       || '#ffffff',
        bg_color:            creator.bg_color            || '#0a0a0a',
        instagram_handle:    creator.instagram_handle    || '',
        premade_hashtag:     creator.premade_hashtag     || '',
        stripe_payment_link: creator.stripe_payment_link || '',
        premade_basic_price: creator.premade_basic_price ?? '',
      });
    }
  }, [creator]);

  const portfolioUrl = creator?.slug ? `${creator.slug}.folio.app` : '';

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

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

  // ── loading state ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <p className={LABEL_CAPS}>Loading…</p>
      </div>
    );
  }

  if (!session) return null;

  const userLabel = creator?.display_name || session?.user?.email || '';

  // ── render ────────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col bg-[#f5f5f7]"
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      {/* ── Mobile top bar ── */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-5 py-3 flex items-center justify-between">
        <span className="text-[#1d1d1f] text-base font-bold tracking-tight">
          Folio
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#6e6e73] hidden sm:block truncate max-w-[180px]">
            {userLabel}
          </span>
          <button
            onClick={handleLogout}
            className="text-xs text-[#6e6e73] hover:text-[#1d1d1f] border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <aside
          className="hidden lg:flex flex-col w-56 shrink-0 sticky top-0 h-screen border-r border-gray-200 bg-[#f5f5f7]"
        >
          {/* Brand */}
          <div className="px-5 pt-7 pb-5 border-b border-gray-200">
            <p className="text-[#1d1d1f] text-lg font-bold tracking-tight">Folio</p>
            <p className="mt-0.5 text-[11px] text-[#6e6e73] truncate">{userLabel}</p>
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {NAV_SECTIONS.map((s) => (
              <NavLink
                key={s.id}
                label={s.label}
                icon={s.icon}
                active={activeSection === s.id}
                onClick={() => setActiveSection(s.id)}
              />
            ))}
          </nav>

          {/* Sign out */}
          <div className="px-3 py-5 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-gray-100 transition-colors text-left"
            >
              <span className="text-base leading-none">→</span>
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10 pb-32 space-y-8">

            {/* Mobile pill tabs */}
            <div className="lg:hidden -mx-5 sm:-mx-8 px-5 sm:px-8 overflow-x-auto">
              <div className="flex gap-2 min-w-max pb-1">
                {NAV_SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                      activeSection === s.id
                        ? 'bg-[#0071e3] text-white'
                        : 'bg-white text-[#1d1d1f] border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ══════════════════════════════════════════
                OVERVIEW
            ══════════════════════════════════════════ */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <SectionHeader eyebrow="Dashboard" heading="Overview" />

                {/* Portfolio URL strip */}
                <div className={`${CARD} p-6`}>
                  <p className={`${LABEL_CAPS} mb-3`}>Your Portfolio URL</p>
                  {portfolioUrl ? (
                    <>
                      <div className="flex items-center gap-3">
                        <code className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1d1d1f] font-mono truncate select-all">
                          {portfolioUrl}
                        </code>
                        <button
                          onClick={handleCopy}
                          className={`shrink-0 text-sm font-semibold rounded-xl px-5 py-2.5 transition-all ${
                            copied
                              ? 'bg-green-50 text-green-600 border border-green-200'
                              : 'bg-[#0071e3] text-white hover:bg-[#0077ed]'
                          }`}
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <a
                        href={`https://${portfolioUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 text-xs text-[#0071e3] hover:underline"
                      >
                        View live portfolio →
                      </a>
                    </>
                  ) : (
                    <p className="text-sm text-[#6e6e73]">No URL assigned yet.</p>
                  )}
                </div>

                {/* Stat tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <StatTile label="Status" value="Live" accent="#34c759" />
                  <StatTile
                    label="Instagram"
                    value={
                      creator?.instagram_handle
                        ? `@${creator.instagram_handle}`
                        : 'Not connected'
                    }
                  />
                  <StatTile
                    label="Basic Price"
                    value={
                      creator?.premade_basic_price
                        ? `$${creator.premade_basic_price}`
                        : 'Not set'
                    }
                  />
                </div>

                {/* Quick-access section cards */}
                <div>
                  <p className={`${LABEL_CAPS} mb-3`}>Settings</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {NAV_SECTIONS.filter((s) => s.id !== 'overview').map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        className={`${CARD} p-5 text-left hover:border-[#0071e3]/40 hover:shadow-md transition-all group`}
                      >
                        <span className="text-2xl leading-none">{s.icon}</span>
                        <p className="mt-2 text-sm font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors">
                          {s.label}
                        </p>
                        <p className="mt-0.5 text-xs text-[#6e6e73]">
                          {s.eyebrow} settings →
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
                IDENTITY
            ══════════════════════════════════════════ */}
            {activeSection === 'identity' && (
              <div className="space-y-6">
                <SectionHeader eyebrow="Profile" heading="Identity" />

                <SettingsCard
                  title="Public profile"
                  description="This information is displayed on your live portfolio page."
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

                  <Field
                    label="Bio"
                    hint="Keep it concise — one or two sentences work best."
                  >
                    <textarea
                      value={formData.bio}
                      onChange={handleChange('bio')}
                      placeholder="A short bio…"
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
                </SettingsCard>
              </div>
            )}

            {/* ══════════════════════════════════════════
                BRAND
            ══════════════════════════════════════════ */}
            {activeSection === 'brand' && (
              <div className="space-y-6">
                <SectionHeader eyebrow="Appearance" heading="Brand" />

                <SettingsCard
                  title="Color palette"
                  description="These colors define the visual theme of your public portfolio."
                >
                  <Field
                    label="Primary Color"
                    hint="Used for buttons and accent elements."
                  >
                    <div className="flex items-center gap-3">
                      {/* Clickable swatch wrapping hidden color input */}
                      <div
                        className="w-10 h-10 rounded-xl border border-gray-200 shrink-0 cursor-pointer overflow-hidden"
                        style={{ backgroundColor: formData.primary_color }}
                        title="Pick a color"
                      >
                        <input
                          type="color"
                          value={formData.primary_color}
                          onChange={handleChange('primary_color')}
                          className="opacity-0 w-full h-full cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={formData.primary_color}
                        onChange={handleChange('primary_color')}
                        placeholder="#ffffff"
                        className={`${INPUT} flex-1`}
                      />
                    </div>
                  </Field>

                  <Field
                    label="Background Color"
                    hint="The main page background of your portfolio."
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl border border-gray-200 shrink-0 cursor-pointer overflow-hidden"
                        style={{ backgroundColor: formData.bg_color }}
                        title="Pick a color"
                      >
                        <input
                          type="color"
                          value={formData.bg_color}
                          onChange={handleChange('bg_color')}
                          className="opacity-0 w-full h-full cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={formData.bg_color}
                        onChange={handleChange('bg_color')}
                        placeholder="#0a0a0a"
                        className={`${INPUT} flex-1`}
                      />
                    </div>
                  </Field>

                  {/* Live swatch preview */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <p className={`${LABEL_CAPS} px-4 pt-3 pb-2`}>Preview</p>
                    <div
                      className="h-16 w-full flex items-center justify-center"
                      style={{ backgroundColor: formData.bg_color }}
                    >
                      <span
                        className="text-xs font-semibold px-4 py-1.5 rounded-lg"
                        style={{
                          backgroundColor: formData.primary_color,
                          color: formData.bg_color,
                        }}
                      >
                        Button
                      </span>
                    </div>
                  </div>
                </SettingsCard>
              </div>
            )}

            {/* ══════════════════════════════════════════
                INSTAGRAM
            ══════════════════════════════════════════ */}
            {activeSection === 'instagram' && (
              <div className="space-y-6">
                <SectionHeader eyebrow="Social" heading="Instagram" />

                <SettingsCard
                  title="Instagram settings"
                  description="Connect your Instagram presence to your portfolio."
                >
                  <Field
                    label="Instagram Handle"
                    hint="Enter without the @ symbol."
                  >
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6e6e73] text-sm select-none pointer-events-none">
                        @
                      </span>
                      <input
                        type="text"
                        value={formData.instagram_handle}
                        onChange={handleChange('instagram_handle')}
                        placeholder="yourhandle"
                        className={`${INPUT} pl-8`}
                      />
                    </div>
                  </Field>

                  <Field
                    label="Premade Hashtag"
                    hint="Hashtag used on your premade content posts."
                  >
                    <input
                      type="text"
                      value={formData.premade_hashtag}
                      onChange={handleChange('premade_hashtag')}
                      placeholder="#yourhashtag"
                      className={INPUT}
                    />
                  </Field>
                </SettingsCard>
              </div>
            )}

            {/* ══════════════════════════════════════════
                PAYMENTS
            ══════════════════════════════════════════ */}
            {activeSection === 'payments' && (
              <div className="space-y-6">
                <SectionHeader eyebrow="Monetisation" heading="Payments" />

                <SettingsCard
                  title="Stripe"
                  description="Connect a Stripe payment link so clients can pay directly from your portfolio."
                >
                  <Field
                    label="Stripe Payment Link"
                    hint="Paste your full Stripe payment link URL."
                  >
                    <input
                      type="url"
                      value={formData.stripe_payment_link}
                      onChange={handleChange('stripe_payment_link')}
                      placeholder="https://buy.stripe.com/…"
                      className={INPUT}
                    />
                  </Field>
                </SettingsCard>

                <SettingsCard
                  title="Pricing"
                  description="Set the price displayed for your basic premade content package."
                >
                  <Field
                    label="Basic Package Price (USD)"
                    hint="Enter the price in dollars. Leave blank to hide pricing."
                  >
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6e6e73] text-sm select-none pointer-events-none">
                        $
                      </span>
                      <input
                        type="number"
                        value={formData.premade_basic_price}
                        onChange={handleChange('premade_basic_price')}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className={`${INPUT} pl-8`}
                      />
                    </div>
                  </Field>
                </SettingsCard>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ── Fixed save bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
          {/* Status feedback */}
          <div className="h-5 flex items-center">
            {saveStatus === 'saved' && (
              <span className="text-xs font-medium text-green-600 flex items-center gap-1.5">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"
                  aria-hidden="true"
                />
                Changes saved
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-xs font-medium text-red-500 flex items-center gap-1.5">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"
                  aria-hidden="true"
                />
                Save failed — please try again
              </span>
            )}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#0071e3] text-white text-sm font-semibold rounded-xl px-5 py-2.5 hover:bg-[#0077ed] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
