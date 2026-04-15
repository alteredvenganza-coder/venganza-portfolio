import { File, X, Download, ExternalLink, Loader2 } from 'lucide-react';
import { formatBytes } from '../lib/utils';
import { useState } from 'react';

export default function FileItem({ file, onRemove, onDownload }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onDownload(file);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-paper border border-border rounded-lg group hover:border-burgundy-muted transition-all">
      <div className="w-10 h-10 rounded bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
        <File size={20} className="text-muted" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate" title={file.name}>
          {file.name}
        </p>
        <p className="text-[10px] text-subtle font-mono uppercase">
          {formatBytes(file.size)} • {file.name.split('.').pop()}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handleDownload}
          disabled={loading}
          className="p-1.5 text-muted hover:text-burgundy hover:bg-burgundy/5 rounded transition-all"
          title="Scarica file"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        </button>
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-muted hover:text-ink hover:bg-paper-dark rounded transition-all"
          title="Apri in nuova scheda"
        >
          <ExternalLink size={14} />
        </a>
        <button
          onClick={() => onRemove(file)}
          className="p-1.5 text-subtle hover:text-burgundy hover:bg-burgundy/5 rounded transition-all"
          title="Rimuovi"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
