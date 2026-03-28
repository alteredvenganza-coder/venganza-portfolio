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
  const [igToast, setIgToast] = useState(''); // '' | 'connected' | 'error' | 'denied'
  const [igTest, setIgTest] = useState(null); // null | 'loading' | result object

  // ── Instagram OAuth toast ─────────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ig = params.get('instagram');
    if (ig) {
      setIgToast(ig);
      setActiveSection('instagram');
      // Clean the URL without reload
      window.history.replaceState({}, '', '/dashboard');
      setTimeout(() => setIgToast(''), 5000);
    }
  }, []);

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

  const handleIgTest = async () => {
    if (!session?.user?.id) return;
    setIgTest('loading');
    try {
      const res = await fetch(`/api/instagram-test?creator_id=${session.user.id}`);
      const data = await res.json();
      setIgTest(data);
    } catch (err) {
      setIgTest({ ok: false, error: err.message });
    }
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
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", position: 'relative', zIndex: 10 }}
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

                {/* Toast */}
                {igToast && (
                  <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
                    igToast === 'connected'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {igToast === 'connected' && '✓ Instagram connected successfully!'}
                    {igToast === 'error'     && 'Something went wrong. Please try again.'}
                    {igToast === 'denied'    && 'Instagram connection was cancelled.'}
                  </div>
                )}

                {/* Connection status card */}
                <SettingsCard
                  title="Instagram account"
                  description="Connect your Instagram so your premade posts appear in your shop automatically."
                >
                  {creator?.instagram_handle && creator?.instagram_token ? (
                    /* ── Connected state ── */
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                        <div>
                          <p className="text-sm font-semibold text-[#1d1d1f]">
                            @{creator.instagram_handle}
                          </p>
                          <p className="text-xs text-[#6e6e73]">Connected · token refreshes every 60 days</p>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={async () => {
                            if (!session?.user?.id) return;
                            await fetch(`/api/instagram-refresh?creator_id=${session.user.id}`);
                            setIgToast('connected');
                            setTimeout(() => setIgToast(''), 3000);
                          }}
                          className="text-xs text-[#6e6e73] hover:text-[#1d1d1f] underline"
                        >
                          Refresh token
                        </button>
                        <button
                          onClick={handleIgTest}
                          disabled={igTest === 'loading'}
                          style={{
                            fontSize: 12, padding: '2px 10px', borderRadius: 8,
                            border: '1px solid #d1d1d6', background: 'transparent',
                            color: igTest === 'loading' ? '#aeaeb2' : '#1d1d1f',
                            cursor: igTest === 'loading' ? 'not-allowed' : 'pointer',
                            lineHeight: '20px',
                          }}
                        >
                          {igTest === 'loading' ? '…' : 'Test Connection'}
                        </button>
                        <button
                          onClick={async () => {
                            if (!session?.user?.id) return;
                            await fetch('/api/creator/update', {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.access_token}`,
                              },
                              body: JSON.stringify({ instagram_token: null, instagram_handle: '' }),
                            });
                            setCreator(c => ({ ...c, instagram_token: null, instagram_handle: '' }));
                            setFormData(f => ({ ...f, instagram_handle: '' }));
                            setIgTest(null);
                          }}
                          className="text-xs text-red-500 hover:text-red-700 underline"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── Not connected state ── */
                    <div className="flex flex-col items-center gap-4 py-2">
                      <p className="text-sm text-[#6e6e73] text-center max-w-xs">
                        Authorise Show&apos;p Folio to read your Instagram posts and display them as premade listings.
                      </p>
                      <a
                        href={`https://www.instagram.com/oauth/authorize?client_id=${import.meta.env.VITE_META_APP_ID}&redirect_uri=${encodeURIComponent(`${window.location.origin}/api/instagram-callback`)}&scope=instagram_business_basic&response_type=code&state=${session?.user?.id}`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', textDecoration: 'none' }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                        Connect with Instagram
                      </a>
                    </div>
                  )}
                </SettingsCard>

                {/* Instagram test result */}
                {igTest && igTest !== 'loading' && (
                  <div style={{
                    background: 'rgba(255,255,255,0.7)', borderRadius: 12,
                    border: `1.5px solid ${igTest.ok ? '#34c759' : '#ff3b30'}`,
                    padding: '16px 20px',
                  }}>
                    {igTest.ok ? (
                      <>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', marginBottom: 4 }}>
                          ✓ Connection verified
                        </p>
                        <p style={{ fontSize: 12, color: '#6e6e73', marginBottom: 2 }}>
                          @{igTest.username} · {igTest.account_type} · {igTest.media_count} posts
                        </p>
                        <p style={{ fontSize: 11, color: '#aeaeb2', marginBottom: igTest.recent_posts?.length ? 12 : 0 }}>
                          Token: •••••••{igTest.token_preview}
                        </p>
                        {igTest.recent_posts?.length > 0 && (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {igTest.recent_posts.map((post) => {
                              const src = post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url;
                              return src ? (
                                <img
                                  key={post.id}
                                  src={src}
                                  alt={post.caption?.slice(0, 40) || 'Post'}
                                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                                />
                              ) : null;
                            })}
                          </div>
                        )}
                      </>
                    ) : (
                      <p style={{ fontSize: 13, color: '#ff3b30' }}>✗ {igTest.error || 'Test failed'}</p>
                    )}
                  </div>
                )}

                {/* Premade hashtag — always visible */}
                <SettingsCard
                  title="Premade hashtag"
                  description="Posts tagged with this hashtag appear in your shop."
                >
                  <Field label="Hashtag" hint="Without the # symbol.">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6e6e73] text-sm select-none pointer-events-none">#</span>
                      <input
                        type="text"
                        value={formData.premade_hashtag}
                        onChange={handleChange('premade_hashtag')}
                        placeholder="yourhashtag"
                        className={`${INPUT} pl-8`}
                      />
                    </div>
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

      {/* ── Privacy footer ── */}
      <div className="text-center py-3 border-t border-gray-100 bg-white">
        <span className="text-xs text-[#aeaeb2]">Show&apos;p Folio · </span>
        <a href="https://www.iubenda.com/privacy-policy/your-id" target="_blank" rel="noopener noreferrer" className="text-xs text-[#aeaeb2] hover:text-[#6e6e73] underline">Privacy Policy</a>
        <span className="text-xs text-[#aeaeb2]"> · </span>
        <a href="https://www.iubenda.com/terms-and-conditions/your-id" target="_blank" rel="noopener noreferrer" className="text-xs text-[#aeaeb2] hover:text-[#6e6e73] underline">Terms</a>
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
