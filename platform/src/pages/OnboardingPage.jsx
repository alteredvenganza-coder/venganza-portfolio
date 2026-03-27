import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { updateCreatorProfile } from '../lib/auth';

// ─── Constants ───────────────────────────────────────────────────────────────
const TOTAL_STEPS = 3;
const STEP_LABELS = ['Your Studio', 'Instagram', 'Brand Colors'];

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ─── Shared style tokens ────────────────────────────────────────────────────
const inputBase = {
  width: '100%',
  border: '1px solid #d2d2d7',
  borderRadius: '12px',
  padding: '12px 16px',
  fontSize: '15px',
  color: '#1d1d1f',
  backgroundColor: '#ffffff',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const onFocus = (e) => {
  e.target.style.borderColor = '#0071e3';
  e.target.style.boxShadow = '0 0 0 3px rgba(0,113,227,0.15)';
};

const onBlur = (e) => {
  e.target.style.borderColor = '#d2d2d7';
  e.target.style.boxShadow = 'none';
};

// Prefix-input wrapper (for folio.so/ slug, @handle, #hashtag)
const prefixWrapperBase = {
  display: 'flex',
  alignItems: 'center',
  border: '1px solid #d2d2d7',
  borderRadius: '12px',
  overflow: 'hidden',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  backgroundColor: '#ffffff',
};

const prefixLabel = {
  padding: '12px 14px',
  fontSize: '15px',
  color: '#6e6e73',
  backgroundColor: '#f5f5f7',
  borderRight: '1px solid #d2d2d7',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  fontFamily: 'inherit',
};

const prefixInput = {
  flex: 1,
  padding: '12px 14px',
  fontSize: '15px',
  color: '#1d1d1f',
  backgroundColor: '#ffffff',
  border: 'none',
  outline: 'none',
  fontFamily: 'inherit',
};

const onWrapperFocus = (e) => {
  e.currentTarget.style.borderColor = '#0071e3';
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,113,227,0.15)';
};

const onWrapperBlur = (e) => {
  e.currentTarget.style.borderColor = '#d2d2d7';
  e.currentTarget.style.boxShadow = 'none';
};

// ─── Step progress indicator ─────────────────────────────────────────────────
function StepProgress({ step }) {
  return (
    <div style={{ marginBottom: '36px' }}>
      {/* Numbered dots + connectors */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: '10px' }}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const n = i + 1;
          const isActive = n === step;
          const isDone = n < step;

          return (
            <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
              {/* Dot */}
              <div
                style={{
                  width: isActive ? 30 : 24,
                  height: isActive ? 30 : 24,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  transition: 'all 0.25s',
                  backgroundColor: isActive || isDone ? '#0071e3' : '#f5f5f7',
                  color: isActive || isDone ? '#ffffff' : '#6e6e73',
                  flexShrink: 0,
                }}
              >
                {isDone ? (
                  // Checkmark for completed steps
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  n
                )}
              </div>

              {/* Connector line between dots */}
              {n < TOTAL_STEPS && (
                <div
                  style={{
                    width: '36px',
                    height: '1px',
                    backgroundColor: n < step ? '#0071e3' : '#d2d2d7',
                    transition: 'background-color 0.25s',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step label */}
      <p style={{ textAlign: 'center', fontSize: '12px', fontWeight: '500', color: '#6e6e73', margin: 0, letterSpacing: '0.01em' }}>
        Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step - 1]}
      </p>
    </div>
  );
}

// ─── Label helper ─────────────────────────────────────────────────────────────
function Label({ children, optional = false }) {
  return (
    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#1d1d1f', marginBottom: '6px' }}>
      {children}
      {optional && (
        <span style={{ fontWeight: '400', color: '#6e6e73', marginLeft: '4px' }}>
          (optional)
        </span>
      )}
    </label>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1 fields
  const [displayName, setDisplayName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [location, setLocation] = useState('');

  // Step 2 fields
  const [instagramHandle, setInstagramHandle] = useState('');
  const [premadeHashtag, setPremadeHashtag] = useState('');

  // Step 3 fields
  const [primaryColor, setPrimaryColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#0a0a0a');

  const handleDisplayNameChange = (e) => {
    const val = e.target.value;
    setDisplayName(val);
    if (!slugEdited) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e) => {
    setSlugEdited(true);
    setSlug(slugify(e.target.value));
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && !displayName.trim()) {
      setError('Studio name is required.');
      return;
    }
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setError('');
    if (step > 1) setStep((s) => s - 1);
  };

  const handleFinish = async () => {
    setError('');
    setLoading(true);
    try {
      await updateCreatorProfile({
        userId: user?.id,
        displayName,
        slug,
        location,
        instagramHandle,
        premadeHashtag,
        primaryColor,
        bgColor,
        is_onboarded: true,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '380px' }}>

        {/* ── Brand ─────────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: '30px',
              fontWeight: '700',
              letterSpacing: '0.2em',
              color: '#1d1d1f',
              marginBottom: 0,
              marginTop: 0,
              fontFamily: 'var(--font-heading, -apple-system, "SF Pro Display", sans-serif)',
            }}
          >
            FOLIO
          </h1>
        </div>

        {/* ── Step progress ─────────────────────────────────────────────── */}
        <StepProgress step={step} />

        {/* ── Step 1: Studio Info ───────────────────────────────────────── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ marginBottom: '4px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', margin: '0 0 6px' }}>
                What&apos;s your studio called?
              </h2>
              <p style={{ fontSize: '14px', color: '#6e6e73', margin: 0 }}>
                This will be your public brand name.
              </p>
            </div>

            {/* Studio Name */}
            <div>
              <Label>Studio Name</Label>
              <input
                type="text"
                value={displayName}
                onChange={handleDisplayNameChange}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder="e.g. Venganza Studio"
                style={inputBase}
              />
            </div>

            {/* URL Slug */}
            <div>
              <Label>URL Slug</Label>
              <div
                style={prefixWrapperBase}
                onFocusCapture={onWrapperFocus}
                onBlurCapture={onWrapperBlur}
              >
                <span style={{ ...prefixLabel, fontSize: '13px' }}>folio.so/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="your-studio"
                  style={prefixInput}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <Label optional>Location</Label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder="e.g. Los Angeles, CA"
                style={inputBase}
              />
            </div>
          </div>
        )}

        {/* ── Step 2: Instagram ─────────────────────────────────────────── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ marginBottom: '4px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', margin: '0 0 6px' }}>
                Connect your Instagram
              </h2>
              <p style={{ fontSize: '14px', color: '#6e6e73', margin: 0 }}>
                We&apos;ll pull your latest premade posts automatically.
              </p>
            </div>

            {/* Instagram Handle */}
            <div>
              <Label>Instagram Handle</Label>
              <div
                style={prefixWrapperBase}
                onFocusCapture={onWrapperFocus}
                onBlurCapture={onWrapperBlur}
              >
                <span style={prefixLabel}>@</span>
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value.replace('@', ''))}
                  placeholder="yourstudio"
                  style={prefixInput}
                />
              </div>
            </div>

            {/* Premade Hashtag */}
            <div>
              <Label optional>Premade Hashtag</Label>
              <div
                style={prefixWrapperBase}
                onFocusCapture={onWrapperFocus}
                onBlurCapture={onWrapperBlur}
              >
                <span style={prefixLabel}>#</span>
                <input
                  type="text"
                  value={premadeHashtag}
                  onChange={(e) => setPremadeHashtag(e.target.value.replace('#', ''))}
                  placeholder="studioPremades"
                  style={prefixInput}
                />
              </div>
              <p style={{ fontSize: '12px', color: '#6e6e73', margin: '6px 0 0' }}>
                Posts tagged with this hashtag will appear in your shop.
              </p>
            </div>

            {/* Info callout */}
            <div
              style={{
                borderRadius: '12px',
                padding: '14px 16px',
                backgroundColor: '#f5f5f7',
              }}
            >
              <p style={{ fontSize: '13px', color: '#6e6e73', lineHeight: '1.5', margin: 0 }}>
                We pull your public Instagram posts matching this hashtag
                and display them as premade listings — no manual uploading
                required.
              </p>
            </div>
          </div>
        )}

        {/* ── Step 3: Brand Colors ──────────────────────────────────────── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ marginBottom: '4px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', margin: '0 0 6px' }}>
                Set your brand color
              </h2>
              <p style={{ fontSize: '14px', color: '#6e6e73', margin: 0 }}>
                Choose colors that reflect your aesthetic.
              </p>
            </div>

            {/* Primary Color */}
            <div>
              <Label>Primary Color</Label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: '1px solid #d2d2d7',
                  borderRadius: '12px',
                  padding: '10px 16px',
                }}
              >
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  style={{ width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', padding: 0 }}
                />
                <span style={{ fontSize: '14px', fontFamily: 'monospace', color: '#1d1d1f' }}>
                  {primaryColor.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#6e6e73', margin: '6px 0 0' }}>
                Used for buttons, accents, and highlights.
              </p>
            </div>

            {/* Background Color */}
            <div>
              <Label>Background Color</Label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: '1px solid #d2d2d7',
                  borderRadius: '12px',
                  padding: '10px 16px',
                }}
              >
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  style={{ width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', padding: 0 }}
                />
                <span style={{ fontSize: '14px', fontFamily: 'monospace', color: '#1d1d1f' }}>
                  {bgColor.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#6e6e73', margin: '6px 0 0' }}>
                The base background of your portfolio.
              </p>
            </div>

            {/* Live preview swatch */}
            <div>
              <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6e6e73', marginBottom: '8px' }}>
                Preview
              </p>
              <div
                style={{
                  width: '100%',
                  height: '64px',
                  borderRadius: '12px',
                  border: '1px solid #d2d2d7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: bgColor,
                  transition: 'background-color 0.2s',
                }}
              >
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    letterSpacing: '0.18em',
                    color: primaryColor,
                    fontFamily: 'var(--font-heading, -apple-system, "SF Pro Display", sans-serif)',
                    transition: 'color 0.2s',
                  }}
                >
                  FOLIO
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────────────────── */}
        {error && (
          <p style={{ fontSize: '13px', color: '#ff3b30', textAlign: 'center', margin: '16px 0 0' }}>
            {error}
          </p>
        )}

        {/* ── Navigation buttons ────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '28px' }}>
          {step > 1 && (
            <button
              onClick={handleBack}
              style={{
                flex: 1,
                backgroundColor: '#ffffff',
                color: '#1d1d1f',
                fontSize: '15px',
                fontWeight: '500',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #d2d2d7',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f5f5f7'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
            >
              Back
            </button>
          )}

          {step < TOTAL_STEPS ? (
            <button
              onClick={handleNext}
              style={{
                flex: 1,
                backgroundColor: '#0071e3',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: '500',
                padding: '14px 16px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0077ed'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0071e3'; }}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: '#0071e3',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: '500',
                padding: '14px 16px',
                borderRadius: '12px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'background-color 0.15s, opacity 0.15s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#0077ed'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0071e3'; }}
            >
              {loading ? 'Launching…' : 'Launch My Portfolio'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
