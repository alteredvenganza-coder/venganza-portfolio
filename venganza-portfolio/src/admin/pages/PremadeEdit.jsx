import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { getFile, saveFile, uploadImage } from '../lib/git-gateway';
import { useToast } from '../lib/toast';

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  match[1].split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    if (val === 'true') val = true;
    else if (val === 'false') val = false;
    else if (/^\d+$/.test(val)) val = parseInt(val, 10);
    fm[key] = val;
  });
  return fm;
}

function toFrontmatter(data) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') lines.push(`${key}: "${value}"`);
    else lines.push(`${key}: ${value}`);
  }
  lines.push('---', '');
  return lines.join('\n');
}

export default function PremadeEdit() {
  const { filename } = useParams();
  const isNew = !filename;
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    number: '',
    title: '',
    image: '',
    price: 200,
    available: true,
    instagram_url: '',
  });
  const [sha, setSha] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isNew) return;
    async function load() {
      try {
        const file = await getFile(`venganza-portfolio/content/premades/${filename}`);
        if (file) {
          const data = parseFrontmatter(file.content);
          setForm({
            number: data.number || '',
            title: data.title || '',
            image: data.image || '',
            price: data.price || 200,
            available: data.available !== false,
            instagram_url: data.instagram_url || '',
          });
          setSha(file.sha);
        }
      } catch (e) {
        toast('Failed to load premade', 'error');
      }
      setLoading(false);
    }
    load();
  }, [filename, isNew]);

  // Unsaved changes warning
  useEffect(() => {
    if (!dirty) return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      const ext = file.name.split('.').pop();
      const imgPath = `venganza-portfolio/public/premades/${form.number || 'new'}.${ext}`;

      try {
        toast('Uploading image...', 'info');
        await uploadImage(imgPath, base64, `Upload premade image ${form.number}`);
        update('image', `/premades/${form.number || 'new'}.${ext}`);
        toast('Image uploaded');
      } catch (err) {
        toast('Upload failed: ' + err.message, 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.number) {
      toast('Number is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const content = toFrontmatter(form);
      const slug = `premade-${form.number.padStart(3, '0')}`;
      const path = `venganza-portfolio/content/premades/${slug}.md`;
      const msg = isNew ? `Add premade #${form.number}` : `Update premade #${form.number}`;

      // If editing and filename changed, we save to new path (sha only works for same path)
      const fileSha = (!isNew && path === `venganza-portfolio/content/premades/${filename}`) ? sha : null;

      await saveFile(path, content, msg, fileSha);
      toast(`Premade #${form.number} saved`);
      setDirty(false);
      navigate('/admin/premades');
    } catch (e) {
      toast('Save failed: ' + e.message, 'error');
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="text-center py-20"><p className="font-mono text-xs text-white/30 uppercase tracking-widest animate-pulse">Loading...</p></div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/premades" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="heading-font text-3xl tracking-widest text-white">
            {isNew ? 'New Premade' : `Edit #${form.number}`}
          </h1>
          {dirty && <p className="font-mono text-[10px] text-amber-400 uppercase tracking-widest">Unsaved changes</p>}
        </div>
      </div>

      <div className="space-y-6">
        {/* Number */}
        <div>
          <label className="block font-mono text-[10px] text-white/40 uppercase tracking-widest mb-2">Number *</label>
          <input
            type="text"
            value={form.number}
            onChange={e => update('number', e.target.value)}
            placeholder="001"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-mono text-sm text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block font-mono text-[10px] text-white/40 uppercase tracking-widest mb-2">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={e => update('title', e.target.value)}
            placeholder="Premade #001"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-mono text-sm text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors"
          />
        </div>

        {/* Image */}
        <div>
          <label className="block font-mono text-[10px] text-white/40 uppercase tracking-widest mb-2">Image</label>
          <div className="flex items-start gap-4">
            {form.image ? (
              <div className="w-32 h-32 rounded-xl bg-white/10 overflow-hidden border border-white/10">
                <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                <span className="font-mono text-[10px] text-white/20 uppercase">No image</span>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 font-mono text-xs text-white/60 uppercase tracking-widest cursor-pointer hover:bg-white/10 transition-colors">
                <Upload size={14} />
                Upload
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <input
                type="text"
                value={form.image}
                onChange={e => update('image', e.target.value)}
                placeholder="/premades/001.jpg"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 font-mono text-[10px] text-white/40 outline-none focus:border-white/20 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block font-mono text-[10px] text-white/40 uppercase tracking-widest mb-2">Price (USD)</label>
          <input
            type="number"
            value={form.price}
            onChange={e => update('price', parseInt(e.target.value) || 0)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-mono text-sm text-white outline-none focus:border-white/20 transition-colors"
          />
        </div>

        {/* Available */}
        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3">
          <span className="font-mono text-xs text-white/60 uppercase tracking-widest">Available for purchase</span>
          <button
            onClick={() => update('available', !form.available)}
            className={`w-12 h-6 rounded-full transition-colors relative ${form.available ? 'bg-green-500' : 'bg-white/10'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.available ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* Instagram URL */}
        <div>
          <label className="block font-mono text-[10px] text-white/40 uppercase tracking-widest mb-2">Instagram Post URL</label>
          <input
            type="text"
            value={form.instagram_url}
            onChange={e => update('instagram_url', e.target.value)}
            placeholder="https://instagram.com/p/..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-mono text-sm text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-mono text-xs uppercase tracking-widest hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Save size={14} />
          {saving ? 'Saving...' : 'Save Premade'}
        </button>
      </div>
    </div>
  );
}
