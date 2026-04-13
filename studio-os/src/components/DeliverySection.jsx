import { useState, useRef } from 'react';
import { Upload, Link2, Trash2, FileText, Copy, Check } from 'lucide-react';
import Btn from './Btn';
import { uploadProjectFile, deleteProjectFile } from '../lib/db';

export default function DeliverySection({ files = [], projectId, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [copiedId,  setCopiedId]  = useState(null);
  const fileRef = useRef(null);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url, path } = await uploadProjectFile(projectId, file);
      const entry = {
        id:         Date.now().toString(),
        name:       file.name,
        url,
        path,
        uploadedAt: new Date().toISOString(),
      };
      onUpdate([...files, entry]);
    } catch (err) {
      alert('Errore upload: ' + err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleDelete(entry) {
    try {
      await deleteProjectFile(entry.path);
      onUpdate(files.filter(f => f.id !== entry.id));
    } catch (err) {
      alert('Errore eliminazione: ' + err.message);
    }
  }

  function copyLink(entry) {
    navigator.clipboard.writeText(entry.url);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="bg-white border border-border rounded-lg shadow-card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-base font-semibold text-ink">Consegna</h3>
        <label className="cursor-pointer">
          <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
          <Btn
            as="span"
            variant="secondary"
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={13} />
            {uploading ? 'Caricamento…' : 'Carica file'}
          </Btn>
        </label>
      </div>

      {files.length === 0 ? (
        <p className="text-sm text-subtle italic">Nessun file caricato.</p>
      ) : (
        <div className="flex flex-col">
          {files.map(entry => (
            <div
              key={entry.id}
              className="flex items-center gap-3 py-2.5 border-b border-border last:border-0"
            >
              <FileText size={14} className="text-muted shrink-0" />
              <span className="text-sm text-ink flex-1 truncate min-w-0">{entry.name}</span>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => copyLink(entry)}
                  className="p-1.5 rounded hover:bg-paper text-muted hover:text-ink transition-colors"
                  title="Copia link"
                >
                  {copiedId === entry.id
                    ? <Check size={13} className="text-[#276749]" />
                    : <Copy size={13} />
                  }
                </button>
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded hover:bg-paper text-muted hover:text-ink transition-colors"
                  title="Apri file"
                >
                  <Link2 size={13} />
                </a>
                <button
                  onClick={() => handleDelete(entry)}
                  className="p-1.5 rounded hover:bg-paper text-muted hover:text-burgundy transition-colors"
                  title="Elimina"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
