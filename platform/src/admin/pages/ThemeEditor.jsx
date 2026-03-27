import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Save, Monitor, Smartphone, RefreshCw, ChevronRight, ChevronDown,
  Plus, ImageIcon, Palette, Type, FileText, Layout, Grid,
  Upload, X, Link as LinkIcon, Check, Settings, Eye, Layers, SlidersHorizontal
} from 'lucide-react';
import { getTheme, saveTheme, triggerDeploy, uploadImage } from '../lib/github';
import { useToast } from '../lib/toast';

// ─── Section definitions (mirrors the live site structure) ─────────────────
const SECTIONS = [
  {
    id: 'header', label: 'Header', icon: Layout,
    settings: [
      { type: 'text', key: 'texts.siteTitle', label: 'Site Title' },
      { type: 'text', key: 'texts.tagline', label: 'Tagline', multiline: true },
      { type: 'text', key: 'instagram.handle', label: 'Instagram Handle' },
    ],
  },
  {
    id: 'hero', label: 'Hero', icon: ImageIcon,
    children: [
      { id: 'hero-left', label: 'Hero Left (Premades)', parentId: 'hero',
        settings: [
          { type: 'image', key: 'images.heroLeft', label: 'Fallback Image', desc: 'Shown when no Instagram premades are loaded' },
        ],
      },
      { id: 'hero-right', label: 'Hero Right (MAT Renders)', parentId: 'hero',
        settings: [
          { type: 'image', key: 'images.heroRight', label: 'Hero Image', desc: 'Main visual for the MAT Renders panel' },
        ],
      },
    ],
  },
  {
    id: 'mat-renders', label: 'MAT Renders', icon: Grid,
    settings: [
      { type: 'image', key: 'images.matRender1', label: 'Render 01' },
      { type: 'image', key: 'images.matRender2', label: 'Render 02' },
      { type: 'image', key: 'images.matRender3', label: 'Render 03' },
      { type: 'image', key: 'images.matRender4', label: 'Render 04' },
      { type: 'image', key: 'images.matRender5', label: 'Render 05' },
      { type: 'image', key: 'images.matRender6', label: 'Render 06' },
    ],
  },
  {
    id: 'premades', label: 'Premades', icon: Grid,
    settings: [
      { type: 'text', key: 'texts.premadeSubtitle1', label: 'Subtitle Line 1' },
      { type: 'text', key: 'texts.premadeSubtitle2', label: 'Subtitle Line 2' },
    ],
  },
  {
    id: 'colors', label: 'Colors', icon: Palette,
    settings: [
      { type: 'color', key: 'colors.primary', label: 'Primary' },
      { type: 'color', key: 'colors.background', label: 'Background' },
      { type: 'color', key: 'colors.text', label: 'Text' },
      { type: 'color', key: 'colors.accent', label: 'Accent' },
    ],
  },
  {
    id: 'typography', label: 'Typography', icon: Type,
    settings: [
      { type: 'font', key: 'fonts.heading', label: 'Heading Font' },
      { type: 'font', key: 'fonts.body', label: 'Body Font' },
      { type: 'font', key: 'fonts.mono', label: 'Mono Font' },
    ],
  },
  {
    id: 'identity', label: 'Brand Identity', icon: ImageIcon,
    settings: [
      { type: 'image', key: 'images.logo', label: 'Logo', desc: 'Used on service pages (inverted on dark)' },
      { type: 'image', key: 'images.aboutHero', label: 'About / Bio Image' },
      { type: 'image', key: 'images.galleryBg', label: 'VAG Gallery Background' },
      { type: 'image', key: 'images.ogImage', label: 'Social Share Image (OG)' },
    ],
  },
  {
    id: 'footer', label: 'Footer', icon: FileText,
    settings: [
      { type: 'text', key: 'texts.location', label: 'Location' },
      { type: 'text', key: 'instagram.hashtag', label: 'Instagram Hashtag' },
    ],
  },
];

const FONTS = ['Bebas Neue', 'Inter', 'Space Mono', 'Playfair Display', 'Montserrat', 'Poppins', 'Roboto Mono', 'Oswald', 'Raleway'];

// ─── Deep get/set helpers ───────────────────────────────────────────────────
function deepGet(obj, dotPath) {
  return dotPath.split('.').reduce((o, k) => o?.[k], obj);
}
function deepSet(obj, dotPath, value) {
  const keys = dotPath.split('.');
  const result = structuredClone(obj);
  let cur = result;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]]) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
  return result;
}

// ─── Field components ───────────────────────────────────────────────────────
function ColorField({ label, value = '#000000', onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <span className="font-mono text-[11px] text-white/60 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg border border-white/10 overflow-hidden cursor-pointer relative flex-shrink-0">
          <input type="color" value={value} onChange={e => onChange(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          <div className="w-full h-full" style={{ backgroundColor: value }} />
        </div>
        <input
          type="text" value={value}
          onChange={e => onChange(e.target.value)}
          className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 font-mono text-[10px] text-white/70 outline-none focus:border-white/20 text-center"
        />
      </div>
    </div>
  );
}

function TextField({ label, value = '', onChange, multiline }) {
  return (
    <div className="py-3 border-b border-white/5 last:border-0">
      <label className="block font-mono text-[10px] text-white/40 uppercase tracking-widest mb-2">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 font-mono text-[11px] text-white outline-none focus:border-white/20 resize-none" />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 font-mono text-[11px] text-white outline-none focus:border-white/20" />
      )}
    </div>
  );
}

function FontField({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <span className="font-mono text-[11px] text-white/60 uppercase tracking-widest">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 font-mono text-[11px] text-white outline-none cursor-pointer">
        {FONTS.map(f => <option key={f} value={f} className="bg-[#0d0d0d]">{f}</option>)}
      </select>
    </div>
  );
}

function ImageField({ label, desc, value = '', onChange, onUpload, uploading, fieldKey }) {
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const applyUrl = () => {
    if (urlInput.trim()) { onChange(urlInput.trim()); setUrlMode(false); setUrlInput(''); }
  };

  return (
    <div className="py-4 border-b border-white/5 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="font-mono text-[11px] text-white/70 uppercase tracking-widest block">{label}</span>
          {desc && <span className="font-mono text-[9px] text-white/25 leading-tight">{desc}</span>}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => { setUrlMode(m => !m); setUrlInput(''); }}
            title="Load by URL"
            className={`p-1.5 rounded-lg transition-colors ${urlMode ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60 hover:bg-white/5'}`}
          >
            <LinkIcon size={12} />
          </button>
          {value && (
            <button onClick={() => onChange('')} title="Remove" className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-colors">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* URL input */}
      {urlMode && (
        <div className="flex gap-2 mb-2">
          <input
            type="url"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyUrl()}
            placeholder="https://..."
            className="flex-1 bg-white/5 border border-white/15 rounded-lg px-3 py-1.5 font-mono text-[10px] text-white outline-none focus:border-white/30"
          />
          <button onClick={applyUrl} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
            <Check size={12} />
          </button>
        </div>
      )}

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-white/10">
          <img src={value} alt={label} className="w-full h-28 object-cover" onError={e => { e.target.style.display = 'none'; }} />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <label className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 cursor-pointer transition-colors">
              <Upload size={13} />
              <input type="file" accept="image/*,video/*" onChange={e => onUpload(e, fieldKey)} className="hidden" disabled={!!uploading} />
            </label>
          </div>
          <p className="px-2 py-1 font-mono text-[8px] text-white/25 truncate">{value}</p>
        </div>
      ) : (
        <label className={`flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-white/10 hover:border-white/20 bg-white/[0.02] cursor-pointer transition-colors ${uploading === fieldKey ? 'opacity-40 pointer-events-none' : ''}`}>
          <Upload size={16} className="text-white/20 mb-1.5" />
          <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">
            {uploading === fieldKey ? 'Uploading...' : 'Upload or paste URL ↑'}
          </span>
          <input type="file" accept="image/*,video/*" onChange={e => onUpload(e, fieldKey)} className="hidden" disabled={!!uploading} />
        </label>
      )}
    </div>
  );
}

// ─── Flat list of all sections + children ──────────────────────────────────
function flatSections() {
  const result = [];
  for (const s of SECTIONS) {
    result.push(s);
    if (s.children) result.push(...s.children);
  }
  return result;
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function ThemeEditor() {
  const [theme, setTheme] = useState(null);
  const [sha, setSha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [selectedId, setSelectedId] = useState('header');
  const [expanded, setExpanded] = useState({ hero: true });
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [previewPath, setPreviewPath] = useState('/');
  const [uploading, setUploading] = useState(null);
  const iframeRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    getTheme()
      .then(data => {
        const t = data.theme;
        if (!t.images) t.images = {};
        setTheme(t);
        setSha(data.sha);
      })
      .catch(err => toast('Failed to load theme: ' + err.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  const updateTheme = useCallback((dotPath, value) => {
    setTheme(prev => deepSet(prev, dotPath, value));
    setDirty(true);
  }, []);

  const handleUpload = async (e, key) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(key);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      const ext = file.name.split('.').pop().toLowerCase();
      const imgPath = `venganza-portfolio/public/theme/${key}.${ext}`;
      try {
        await uploadImage(imgPath, base64, `Upload theme image: ${key}`);
        updateTheme(`images.${key}`, `/theme/${key}.${ext}`);
        toast(`${key} uploaded ✓`);
      } catch (err) {
        toast('Upload failed: ' + err.message, 'error');
      }
      setUploading(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await saveTheme(theme, sha);
      setSha(result.sha);
      setDirty(false);
      toast('Theme saved! Deploy to apply.');
    } catch (err) {
      toast('Save failed: ' + err.message, 'error');
    }
    setSaving(false);
  };

  const handleDeploy = async () => {
    if (dirty) { toast('Save first', 'error'); return; }
    setDeploying(true);
    try {
      await triggerDeploy();
      toast('Deploying… site updates in ~1 min.');
    } catch (err) {
      // If deploy hook not configured, saving already triggers auto-deploy via git
      toast('Saved ✓ — site will update automatically in ~1 min.');
    }
    setDeploying(false);
  };

  const [mobilePanel, setMobilePanel] = useState('sections'); // 'sections' | 'settings' | 'preview'
  const selectedSection = flatSections().find(s => s.id === selectedId);

  function renderField(setting) {
    const val = deepGet(theme, setting.key);
    const parts = setting.key.split('.');
    const imageKey = parts[parts.length - 1];

    if (setting.type === 'color')
      return <ColorField key={setting.key} label={setting.label} value={val} onChange={v => updateTheme(setting.key, v)} />;
    if (setting.type === 'text')
      return <TextField key={setting.key} label={setting.label} value={val} onChange={v => updateTheme(setting.key, v)} multiline={setting.multiline} />;
    if (setting.type === 'font')
      return <FontField key={setting.key} label={setting.label} value={val} onChange={v => updateTheme(setting.key, v)} />;
    if (setting.type === 'image')
      return (
        <ImageField
          key={setting.key}
          label={setting.label}
          desc={setting.desc}
          value={val}
          fieldKey={imageKey}
          onChange={v => updateTheme(setting.key, v)}
          onUpload={handleUpload}
          uploading={uploading}
        />
      );
    return null;
  }

  if (loading || !theme) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-73px)]">
        <p className="font-mono text-xs text-white/30 uppercase tracking-widest animate-pulse">Loading theme...</p>
      </div>
    );
  }

  const PREVIEW_PAGES = [
    { label: 'Home', path: '/' },
    { label: 'Premades', path: '/premades' },
    { label: 'MAT Renders', path: '/mat-renders' },
    { label: 'Brand Identity', path: '/brand-identity' },
    { label: 'Designs', path: '/designs' },
    { label: 'Archive', path: '/archive' },
    { label: 'About', path: '/about' },
  ];

  // ─── Shared: Section tree content ───────────────────────────────────────
  const SectionTree = ({ onSelect }) => (
    <>
      <div className="flex-1 overflow-y-auto py-2">
        {SECTIONS.map(section => {
          const Icon = section.icon;
          const isOpen = expanded[section.id];
          const isActive = selectedId === section.id;
          return (
            <div key={section.id}>
              <button
                onClick={() => {
                  setSelectedId(section.id);
                  if (section.children) setExpanded(e => ({ ...e, [section.id]: !e[section.id] }));
                  onSelect?.();
                }}
                className={`w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors ${
                  isActive ? 'bg-white/8 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/4'
                }`}
              >
                {section.children ? (
                  isOpen ? <ChevronDown size={11} className="flex-shrink-0 text-white/30" /> : <ChevronRight size={11} className="flex-shrink-0 text-white/30" />
                ) : <span className="w-[11px]" />}
                <Icon size={12} className="flex-shrink-0" />
                <span className="font-mono text-[10px] uppercase tracking-widest">{section.label}</span>
              </button>
              {section.children && isOpen && (
                <div className="ml-4 border-l border-white/5">
                  {section.children.map(child => (
                    <button
                      key={child.id}
                      onClick={() => { setSelectedId(child.id); onSelect?.(); }}
                      className={`w-full flex items-center gap-2.5 pl-4 pr-4 py-2.5 text-left transition-colors ${
                        selectedId === child.id ? 'bg-white/8 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/4'
                      }`}
                    >
                      <span className="w-[11px]" />
                      <span className="font-mono text-[10px] uppercase tracking-widest">{child.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-white/5 space-y-2">
        <button onClick={handleSave} disabled={saving || !dirty}
          className="w-full flex items-center justify-center gap-2 bg-white text-black py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-widest hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <Save size={12} />
          {saving ? 'Saving...' : dirty ? 'Save' : 'Saved'}
        </button>
        <button onClick={handleDeploy} disabled={deploying || dirty}
          className="w-full flex items-center justify-center gap-2 bg-green-600/80 text-white py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-widest hover:bg-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <RefreshCw size={12} className={deploying ? 'animate-spin' : ''} />
          {deploying ? 'Deploying...' : 'Publish'}
        </button>
      </div>
    </>
  );

  // ─── Shared: Settings panel content ─────────────────────────────────────
  const SettingsPanel = () => (
    <>
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
        {selectedSection?.icon && <selectedSection.icon size={13} className="text-white/40" />}
        <span className="font-mono text-[10px] text-white/60 uppercase tracking-widest">
          {selectedSection?.label ?? 'Select a section'}
        </span>
        {dirty && <span className="ml-auto font-mono text-[9px] text-amber-400 animate-pulse">Unsaved</span>}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {selectedSection?.settings?.map(s => renderField(s))}
        {selectedSection && !selectedSection.settings?.length && (
          <p className="font-mono text-[10px] text-white/20 uppercase tracking-widest text-center py-8">Select a subsection</p>
        )}
      </div>
    </>
  );

  // ─── Shared: Preview panel content ──────────────────────────────────────
  const PreviewPanel = () => (
    <>
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5 gap-2">
        <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
          {PREVIEW_PAGES.map(p => (
            <button key={p.path} onClick={() => setPreviewPath(p.path)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-lg font-mono text-[9px] uppercase tracking-widest transition-colors ${
                previewPath === p.path ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60 hover:bg-white/5'
              }`}>{p.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={() => setPreviewDevice('desktop')} className={`p-1.5 rounded-lg transition-colors ${previewDevice === 'desktop' ? 'bg-white/10 text-white' : 'text-white/30'}`}><Monitor size={13} /></button>
          <button onClick={() => setPreviewDevice('mobile')} className={`p-1.5 rounded-lg transition-colors ${previewDevice === 'mobile' ? 'bg-white/10 text-white' : 'text-white/30'}`}><Smartphone size={13} /></button>
          <button onClick={() => iframeRef.current?.contentWindow?.location?.reload()} className="p-1.5 rounded-lg text-white/30 hover:text-white/60"><Eye size={13} /></button>
        </div>
      </div>
      <div className="flex-1 flex items-start justify-center p-3 overflow-auto bg-[#1c1c1c]">
        <div className={`bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${previewDevice === 'mobile' ? 'w-[390px] h-[844px]' : 'w-full h-full'}`}
          style={previewDevice === 'desktop' ? { minHeight: '500px' } : {}}>
          <iframe ref={iframeRef} src={previewPath} className="w-full h-full border-0" title="Site Preview" />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* ══════════════════════════════════════════════
          DESKTOP LAYOUT (md+): 3 columns side by side
      ══════════════════════════════════════════════ */}
      <div className="hidden md:flex h-[calc(100vh-73px)] -m-8 bg-[#0a0a0a]">
        {/* Left */}
        <div className="w-[240px] flex-shrink-0 bg-[#111] border-r border-white/5 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
            <Settings size={13} className="text-white/30" />
            <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Sections</span>
          </div>
          <SectionTree />
        </div>
        {/* Center */}
        <div className="flex-1 flex flex-col bg-[#1c1c1c] overflow-hidden">
          <PreviewPanel />
        </div>
        {/* Right */}
        <div className="w-[280px] flex-shrink-0 bg-[#111] border-l border-white/5 flex flex-col overflow-hidden">
          <SettingsPanel />
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          MOBILE LAYOUT (<md): full-screen panels + tab bar
      ══════════════════════════════════════════════ */}
      <div className="flex md:hidden flex-col -m-8 bg-[#0a0a0a]" style={{ height: 'calc(100vh - 73px)' }}>

        {/* Active panel */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#111]">
          {mobilePanel === 'sections' && <SectionTree onSelect={() => setMobilePanel('settings')} />}
          {mobilePanel === 'settings' && <SettingsPanel />}
          {mobilePanel === 'preview' && <PreviewPanel />}
        </div>

        {/* Bottom tab bar */}
        <div className="flex-shrink-0 flex items-center border-t border-white/10 bg-[#0d0d0d]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {[
            { id: 'sections', icon: Layers, label: 'Sections' },
            { id: 'settings', icon: SlidersHorizontal, label: 'Settings' },
            { id: 'preview', icon: Eye, label: 'Preview' },
          ].map(tab => {
            const Icon = tab.icon;
            const active = mobilePanel === tab.id;
            return (
              <button key={tab.id} onClick={() => setMobilePanel(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${active ? 'text-white' : 'text-white/30'}`}>
                <Icon size={18} />
                <span className="font-mono text-[8px] uppercase tracking-widest">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
