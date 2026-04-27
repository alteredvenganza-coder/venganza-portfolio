import { useRef } from 'react';
import { Image as ImageIcon, Upload, Trash2, X } from 'lucide-react';

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink mb-1.5">{label}</span>
      {children}
      {hint && <span className="block label-meta mt-1">{hint}</span>}
    </label>
  );
}

export function ImageSlotCard({ slot, value, saving, onUpload, onClear, aspect = 'aspect-[4/5]' }) {
  const fileRef = useRef(null);
  function pick() { fileRef.current?.click(); }
  function onChange(e) {
    const f = e.target.files?.[0];
    if (f) onUpload(f);
    e.target.value = '';
  }
  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium text-ink">{slot.label}</p>
        {slot.hint && <p className="label-meta mt-1">{slot.hint}</p>}
      </div>
      <div className={`${aspect} rounded-lg overflow-hidden bg-white/5 border border-white/8 relative`}>
        {value ? (
          <img src={value} alt={slot.label} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-subtle">
            <ImageIcon size={32} />
          </div>
        )}
        {saving && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <p className="label-meta text-ink">Saving…</p>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={pick} disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded text-xs bg-burgundy/15 text-burgundy-muted hover:bg-burgundy/25 transition-colors disabled:opacity-50">
          <Upload size={12} />
          {value ? 'Replace' : 'Upload'}
        </button>
        {value && (
          <button onClick={onClear} disabled={saving} className="px-3 py-2 rounded text-xs bg-white/5 text-muted hover:text-burgundy-muted hover:bg-white/8 transition-colors disabled:opacity-50">
            <Trash2 size={12} />
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onChange} />
    </div>
  );
}

export function ErrorBanner({ error, onClose }) {
  if (!error) return null;
  return (
    <div className="glass rounded-lg p-4 mb-4 border-burgundy/40 flex items-center justify-between">
      <p className="text-sm text-burgundy-muted">{error}</p>
      {onClose && (
        <button onClick={onClose} className="text-muted hover:text-ink"><X size={14} /></button>
      )}
    </div>
  );
}

export function StatusBadge({ status }) {
  return (
    <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
      status === 'published'
        ? 'bg-emerald-500/20 text-emerald-300'
        : 'bg-white/10 text-muted'
    }`}>
      {status}
    </span>
  );
}
