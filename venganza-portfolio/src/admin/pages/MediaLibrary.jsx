import { useEffect, useState } from 'react';
import { Upload, Trash2, Copy, ImageIcon } from 'lucide-react';
import { listFiles, deleteFile, uploadImage } from '../lib/github';
import { useToast } from '../lib/toast';

export default function MediaLibrary() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  async function loadFiles() {
    setLoading(true);
    try {
      const items = await listFiles('venganza-portfolio/public/premades');
      setFiles(items.filter(f => !f.name?.startsWith('.') && f.type === 'file'));
    } catch (e) {
      console.error(e);
      toast('Failed to load media', 'error');
    }
    setLoading(false);
  }

  useEffect(() => { loadFiles(); }, []);

  const handleUpload = async (e) => {
    const fileList = e.target.files;
    if (!fileList?.length) return;

    setUploading(true);
    for (const file of fileList) {
      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onload = async () => {
          const base64 = reader.result.split(',')[1];
          try {
            await uploadImage(`venganza-portfolio/public/premades/${file.name}`, base64, `Upload media: ${file.name}`);
            toast(`Uploaded ${file.name}`);
          } catch (err) {
            toast(`Failed: ${file.name}`, 'error');
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    setUploading(false);
    loadFiles();
    e.target.value = '';
  };

  const handleDelete = async (file) => {
    if (!window.confirm(`Delete ${file.name}?`)) return;
    try {
      await deleteFile(file.path, file.sha, `Delete media: ${file.name}`);
      toast(`Deleted ${file.name}`);
      loadFiles();
    } catch (e) {
      toast('Delete failed', 'error');
    }
  };

  const copyUrl = (name) => {
    navigator.clipboard.writeText(`/premades/${name}`);
    toast('URL copied');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="heading-font text-4xl tracking-widest text-white mb-1">Media</h1>
          <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">{files.length} files</p>
        </div>
        <label className={`flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-lg text-xs font-mono uppercase tracking-widest cursor-pointer hover:bg-white/90 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <Upload size={14} />
          {uploading ? 'Uploading...' : 'Upload'}
          <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
        </label>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <p className="font-mono text-xs text-white/30 uppercase tracking-widest animate-pulse">Loading...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-xl border border-white/5">
          <ImageIcon size={32} className="mx-auto text-white/10 mb-4" />
          <p className="font-mono text-xs text-white/30 uppercase tracking-widest">No media files yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {files.map((file) => (
            <div key={file.path} className="group bg-white/5 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all">
              <div className="aspect-square bg-white/5 relative">
                <img
                  src={`/premades/${file.name}`}
                  alt={file.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => copyUrl(file.name)}
                    className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                    title="Copy URL"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(file)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="p-2">
                <p className="font-mono text-[10px] text-white/40 truncate">{file.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
