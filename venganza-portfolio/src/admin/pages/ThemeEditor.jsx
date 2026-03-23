import { useEffect, useState, useRef } from 'react';
import { Save, Monitor, Smartphone, Palette, Type, FileText, RefreshCw, ImageIcon, Upload, X } from 'lucide-react';
import { getTheme, saveTheme, triggerDeploy, uploadImage } from '../lib/github';
import { useToast } from '../lib/toast';

const TABS = [
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'colors', label: 'Colors', icon: Palette },
  { id: 'fonts', label: 'Fonts', icon: Type },
  { id: 'texts', label: 'Texts', icon: FileText },
];

const IMAGE_SLOTS = [
  { key: 'heroLeft', label: 'Hero Left (Premades)', desc: 'Fallback if no Instagram premade loaded' },
  { key: 'heroRight', label: 'Hero Right (Brand Identity)', desc: 'Right panel of the homepage hero' },
  { key: 'logo', label: 'Logo', desc: 'Used on service pages (inverted)' },
  { key: 'aboutHero', label: 'About / Bio Image', desc: 'Photo for the about section' },
  { key: 'galleryBg', label: 'Gallery Background', desc: 'Background for VAG page' },
  { key: 'ogImage', label: 'Social Share Image (OG)', desc: 'Preview when sharing links' },
];

function ColorInput({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <span className="font-mono text-xs text-white/60 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg border border-white/10 overflow-hidden cursor-pointer relative">
          <input type="color" value={value} onChange={e => onChange(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          <div className="w-full h-full" style={{ backgroundColor: value }} />
        </div>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 font-mono text-[10px] text-white/60 outline-none focus:border-white/20 transition-colors text-center" />
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange, multiline }) {
  return (
    <div className="py-3 border-b border-white/5 last:border-0">
      <label className="block font-mono text-[10px] text-white/40 uppercase tracking-widest mb-2">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 font-mono text-xs text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors resize-none" />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 font-mono text-xs text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors" />
      )}
    </div>
  );
}

function FontSelect({ label, value, onChange }) {
  const fonts = ['Bebas Neue', 'Inter', 'Space Mono', 'Playfair Display', 'Montserrat', 'Poppins', 'Roboto Mono', 'Oswald', 'Raleway'];
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <span className="font-mono text-xs text-white/60 uppercase tracking-widest">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 font-mono text-xs text-white outline-none focus:border-white/20 transition-colors cursor-pointer">
        {fonts.map(f => <option key={f} value={f} className="bg-[#111] text-white">{f}</option>)}
      </select>
    </div>
  );
}

function ImageSlot({ slot, value, onUpload, onRemove, uploading }) {
  return (
    <div className="py-4 border-b border-white/5 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="font-mono text-xs text-white/60 uppercase tracking-widest block">{slot.label}</span>
          <span className="font-mono text-[9px] text-white/25 tracking-wide">{slot.desc}</span>
        </div>
      </div>
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-white/5">
          <img src={value} alt={slot.label} className="w-full h-32 object-cover" onError={e => { e.target.src = ''; e.target.alt = 'Failed to load'; }} />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <label className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer mr-2">
              <Upload size={14} />
              <input type="file" accept="image/*" onChange={e => onUpload(e, slot.key)} className="hidden" />
            </label>
            <button onClick={() => onRemove(slot.key)} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
              <X size={14} />
            </button>
          </div>
          <div className="px-2 py-1.5">
            <p className="font-mono text-[9px] text-white/30 truncate">{value}</p>
          </div>
        </div>
      ) : (
        <label className={`flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-white/10 hover:border-white/20 bg-white/[0.02] cursor-pointer transition-colors ${uploading === slot.key ? 'opacity-50 pointer-events-none' : ''}`}>
          <Upload size={18} className="text-white/20 mb-2" />
          <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
            {uploading === slot.key ? 'Uploading...' : 'Upload Image'}
          </span>
          <input type="file" accept="image/*" onChange={e => onUpload(e, slot.key)} className="hidden" />
        </label>
      )}
    </div>
  );
}

export default function ThemeEditor() {
  const [theme, setTheme] = useState(null);
  const [sha, setSha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState('images');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [uploading, setUploading] = useState(null);
  const iframeRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    getTheme()
      .then(data => {
        // Ensure images section exists
        const t = data.theme;
        if (!t.images) t.images = {};
        setTheme(t);
        setSha(data.sha);
      })
      .catch(err => toast('Failed to load theme: ' + err.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  const update = (section, key, value) => {
    setTheme(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
    setDirty(true);
  };

  const updateRoot = (key, value) => {
    setTheme(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleImageUpload = async (e, slotKey) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(slotKey);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      const ext = file.name.split('.').pop().toLowerCase();
      const imgPath = `venganza-portfolio/public/theme/${slotKey}.${ext}`;

      try {
        await uploadImage(imgPath, base64, `Upload theme image: ${slotKey}`);
        update('images', slotKey, `/theme/${slotKey}.${ext}`);
        toast(`${slotKey} image uploaded`);
      } catch (err) {
        toast('Upload failed: ' + err.message, 'error');
      }
      setUploading(null);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = (slotKey) => {
    update('images', slotKey, '');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await saveTheme(theme, sha);
      setSha(result.sha);
      setDirty(false);
      toast('Theme saved! Deploy to apply changes.');
    } catch (err) {
      toast('Save failed: ' + err.message, 'error');
    }
    setSaving(false);
  };

  const handleDeploy = async () => {
    if (dirty) {
      toast('Save your changes first', 'error');
      return;
    }
    setDeploying(true);
    try {
      await triggerDeploy();
      toast('Deploy triggered! Site will update in ~1 minute.');
    } catch (err) {
      toast('Deploy failed: ' + err.message, 'error');
    }
    setDeploying(false);
  };

  if (loading || !theme) {
    return (
      <div className="text-center py-20">
        <p className="font-mono text-xs text-white/30 uppercase tracking-widest animate-pulse">Loading theme...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-73px)] -m-8">
      {/* Left Panel — Controls */}
      <div className="w-80 bg-[#0d0d0d] border-r border-white/5 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-white/5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                tab === id ? 'text-white bg-white/5 border-b-2 border-white' : 'text-white/30 hover:text-white/60'
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'images' && (
            <div>
              <h3 className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-3">Site Images</h3>
              {IMAGE_SLOTS.map(slot => (
                <ImageSlot
                  key={slot.key}
                  slot={slot}
                  value={theme.images?.[slot.key] || ''}
                  onUpload={handleImageUpload}
                  onRemove={handleImageRemove}
                  uploading={uploading}
                />
              ))}
            </div>
          )}

          {tab === 'colors' && (
            <div>
              <h3 className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-3">Brand Colors</h3>
              <ColorInput label="Primary" value={theme.colors.primary} onChange={v => update('colors', 'primary', v)} />
              <ColorInput label="Background" value={theme.colors.background} onChange={v => update('colors', 'background', v)} />
              <ColorInput label="Text" value={theme.colors.text} onChange={v => update('colors', 'text', v)} />
              <ColorInput label="Accent" value={theme.colors.accent} onChange={v => update('colors', 'accent', v)} />
            </div>
          )}

          {tab === 'fonts' && (
            <div>
              <h3 className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-3">Typography</h3>
              <FontSelect label="Heading" value={theme.fonts.heading} onChange={v => update('fonts', 'heading', v)} />
              <FontSelect label="Body" value={theme.fonts.body} onChange={v => update('fonts', 'body', v)} />
              <FontSelect label="Mono" value={theme.fonts.mono} onChange={v => update('fonts', 'mono', v)} />
            </div>
          )}

          {tab === 'texts' && (
            <div>
              <h3 className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-3">Site Content</h3>
              <TextInput label="Site Title" value={theme.texts.siteTitle} onChange={v => update('texts', 'siteTitle', v)} />
              <TextInput label="Subtitle" value={theme.texts.subtitle} onChange={v => update('texts', 'subtitle', v)} />
              <TextInput label="Tagline" value={theme.texts.tagline} onChange={v => update('texts', 'tagline', v)} multiline />
              <TextInput label="Location" value={theme.texts.location} onChange={v => update('texts', 'location', v)} />

              <h3 className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-3 mt-6">Premades</h3>
              <TextInput label="Subtitle Line 1" value={theme.texts.premadeSubtitle1} onChange={v => update('texts', 'premadeSubtitle1', v)} />
              <TextInput label="Subtitle Line 2" value={theme.texts.premadeSubtitle2} onChange={v => update('texts', 'premadeSubtitle2', v)} />
              <div className="py-3 border-b border-white/5">
                <label className="block font-mono text-[10px] text-white/40 uppercase tracking-widest mb-2">Default Price (USD)</label>
                <input
                  type="number"
                  value={theme.premadePrice}
                  onChange={e => updateRoot('premadePrice', parseInt(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 font-mono text-xs text-white outline-none focus:border-white/20 transition-colors"
                />
              </div>

              <h3 className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-3 mt-6">Instagram</h3>
              <TextInput label="Handle" value={theme.instagram.handle} onChange={v => update('instagram', 'handle', v)} />
              <TextInput label="Hashtag" value={theme.instagram.hashtag} onChange={v => update('instagram', 'hashtag', v)} />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="w-full flex items-center justify-center gap-2 bg-white text-black px-4 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Save size={14} />
            {saving ? 'Saving...' : dirty ? 'Save Changes' : 'Saved'}
          </button>
          <button
            onClick={handleDeploy}
            disabled={deploying || dirty}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest hover:bg-green-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <RefreshCw size={14} className={deploying ? 'animate-spin' : ''} />
            {deploying ? 'Deploying...' : 'Deploy to Live'}
          </button>
        </div>
      </div>

      {/* Right Panel — Preview */}
      <div className="flex-1 bg-[#1a1a1a] flex flex-col">
        {/* Preview toolbar */}
        <div className="flex items-center justify-center gap-2 py-3 border-b border-white/5">
          <button
            onClick={() => setPreviewMode('desktop')}
            className={`p-2 rounded-lg transition-colors ${previewMode === 'desktop' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}
          >
            <Monitor size={16} />
          </button>
          <button
            onClick={() => setPreviewMode('mobile')}
            className={`p-2 rounded-lg transition-colors ${previewMode === 'mobile' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}
          >
            <Smartphone size={16} />
          </button>
          {dirty && (
            <span className="ml-4 font-mono text-[10px] text-amber-400 uppercase tracking-widest animate-pulse">
              Unsaved changes
            </span>
          )}
        </div>

        {/* Preview iframe */}
        <div className="flex-1 flex items-start justify-center p-6 overflow-auto">
          <div
            className={`bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
              previewMode === 'mobile' ? 'w-[375px] h-[812px]' : 'w-full h-full'
            }`}
          >
            <iframe
              ref={iframeRef}
              src="/"
              className="w-full h-full border-0"
              title="Site Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
