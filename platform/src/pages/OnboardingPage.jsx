import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { updateCreatorProfile } from '../lib/auth';

const TOTAL_STEPS = 3;

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

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

  const progressPercent = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ backgroundColor: '#111' }}
      >
        {/* Brand */}
        <div className="mb-6 text-center">
          <h1
            className="text-white text-2xl font-bold tracking-widest"
            style={{ fontFamily: 'var(--font-heading, serif)' }}
          >
            FOLIO
          </h1>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-zinc-500 text-xs font-mono uppercase tracking-wider">
              Step {step} of {TOTAL_STEPS}
            </span>
            <span className="text-zinc-500 text-xs font-mono">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full h-px bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step 1: Studio Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-white text-xl font-semibold mb-1 leading-snug">
              What&apos;s your studio called?
            </h2>
            <p className="text-zinc-500 text-xs font-mono mb-4">
              This will be your public brand name.
            </p>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">
                Studio Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={handleDisplayNameChange}
                placeholder="e.g. Venganza Studio"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">
                URL Slug
              </label>
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-zinc-600 transition-colors">
                <span className="text-zinc-600 text-xs font-mono px-3 py-3 border-r border-zinc-800 whitespace-nowrap">
                  folio.so/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="your-studio"
                  className="flex-1 bg-transparent px-3 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">
                Location
                <span className="text-zinc-600 ml-1 normal-case">(optional)</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Los Angeles, CA"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Step 2: Instagram */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-white text-xl font-semibold mb-1 leading-snug">
              Connect your Instagram
            </h2>
            <p className="text-zinc-500 text-xs font-mono mb-4">
              We&apos;ll pull your latest premade posts automatically.
            </p>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">
                Instagram Handle
              </label>
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-zinc-600 transition-colors">
                <span className="text-zinc-600 text-sm px-3 py-3 border-r border-zinc-800">
                  @
                </span>
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={(e) =>
                    setInstagramHandle(e.target.value.replace('@', ''))
                  }
                  placeholder="yourstudio"
                  className="flex-1 bg-transparent px-3 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">
                Premade Hashtag
                <span className="text-zinc-600 ml-1 normal-case">(optional)</span>
              </label>
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-zinc-600 transition-colors">
                <span className="text-zinc-600 text-sm px-3 py-3 border-r border-zinc-800">
                  #
                </span>
                <input
                  type="text"
                  value={premadeHashtag}
                  onChange={(e) =>
                    setPremadeHashtag(e.target.value.replace('#', ''))
                  }
                  placeholder="studioPremades"
                  className="flex-1 bg-transparent px-3 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none"
                />
              </div>
              <p className="text-zinc-600 text-xs font-mono mt-2">
                Posts tagged with this hashtag will appear in your shop.
              </p>
            </div>

            <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50">
              <p className="text-zinc-400 text-xs font-mono leading-relaxed">
                We pull your public Instagram posts matching this hashtag
                and display them as premade listings — no manual uploading
                required.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Brand Colors */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-white text-xl font-semibold mb-1 leading-snug">
              Set your brand color
            </h2>
            <p className="text-zinc-500 text-xs font-mono mb-4">
              Choose colors that reflect your aesthetic.
            </p>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-2 uppercase tracking-wider">
                Primary Color
              </label>
              <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 focus-within:border-zinc-600 transition-colors">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                />
                <span className="text-white text-sm font-mono">
                  {primaryColor.toUpperCase()}
                </span>
              </div>
              <p className="text-zinc-600 text-xs font-mono mt-1">
                Used for buttons, accents, and highlights.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-2 uppercase tracking-wider">
                Background Color
              </label>
              <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 focus-within:border-zinc-600 transition-colors">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                />
                <span className="text-white text-sm font-mono">
                  {bgColor.toUpperCase()}
                </span>
              </div>
              <p className="text-zinc-600 text-xs font-mono mt-1">
                The base background of your portfolio.
              </p>
            </div>

            {/* Live preview swatch */}
            <div className="mt-2">
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">
                Preview
              </p>
              <div
                className="w-full h-16 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: bgColor }}
              >
                <span
                  className="text-sm font-mono font-semibold tracking-widest"
                  style={{ color: primaryColor }}
                >
                  FOLIO
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-400 text-xs font-mono text-center mt-4">
            {error}
          </p>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 bg-transparent border border-zinc-700 text-zinc-300 font-mono text-sm tracking-wider uppercase py-3 rounded-lg hover:border-zinc-500 hover:text-white transition-colors"
            >
              Back
            </button>
          )}

          {step < TOTAL_STEPS ? (
            <button
              onClick={handleNext}
              className="flex-1 bg-white text-black font-mono text-sm font-semibold tracking-wider uppercase py-3 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="flex-1 bg-white text-black font-mono text-sm font-semibold tracking-wider uppercase py-3 rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Launching...' : 'Launch My Portfolio →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
