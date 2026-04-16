import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Send, Link as LinkIcon, Check, Copy,
  Loader2, FileText, Trash2, Clock, ExternalLink,
  AlertCircle, HardDrive,
} from 'lucide-react';
import Btn from '../components/Btn';
import Field from '../components/Field';
import { useAuth } from '../hooks/useAuth';
import { uploadProjectFile, createDeliveryWithUser, fetchTransfers, fetchUserProfile, updateStorageUsed } from '../lib/db';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('it-IT', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function SendFilePage() {
  const { user } = useAuth();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [files, setFiles]             = useState([]);
  const [title, setTitle]             = useState('');
  const [message, setMessage]         = useState('');
  const [recipient, setRecipient]     = useState('');
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [uploading, setUploading]     = useState(false);
  const [generating, setGenerating]   = useState(false);
  const [sharedLink, setSharedLink]   = useState('');
  const [copied, setCopied]           = useState(false);
  const fileInputRef = useRef(null);

  // ── History ─────────────────────────────────────────────────────────────────
  const [transfers, setTransfers]     = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [copiedId, setCopiedId]       = useState(null);

  // ── Guest storage ───────────────────────────────────────────────────────────
  const [profile, setProfile]         = useState(null);
  const isGuest = profile?.role === 'guest';
  const storageLimitBytes = (isGuest ? 100 : 10000) * 1024 * 1024;

  // ── Drag state ──────────────────────────────────────────────────────────────
  const [dragging, setDragging]       = useState(false);
  const dragCounter = useRef(0);

  // Load profile + history
  useEffect(() => {
    if (!user) return;
    fetchUserProfile(user.id).then(p => setProfile(p)).catch(() => {});
    // Guests only see their own transfers; admin sees all
    fetchTransfers(null) // will load all; guest filtering handled by RLS or below
      .then(setTransfers)
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, [user]);

  // ── File upload handler ─────────────────────────────────────────────────────
  const handleFileUpload = async (fileList) => {
    const incoming = Array.from(fileList);
    if (!incoming.length) return;

    // Check storage limit for guests
    if (isGuest) {
      const totalNewBytes = incoming.reduce((sum, f) => sum + f.size, 0);
      const currentUsed = profile?.storage_used_bytes || 0;
      if (currentUsed + totalNewBytes > storageLimitBytes) {
        alert(`Spazio insufficiente. Hai usato ${formatBytes(currentUsed)} di ${formatBytes(storageLimitBytes)}.`);
        return;
      }
    }

    setUploading(true);
    try {
      const uploaded = await Promise.all(
        incoming.map(f => uploadProjectFile('transfers', f))
      );
      setFiles(prev => [...prev, ...uploaded]);

      // Update storage tracking for guests
      if (isGuest && user) {
        const totalBytes = incoming.reduce((sum, f) => sum + f.size, 0);
        await updateStorageUsed(user.id, totalBytes);
        setProfile(prev => prev ? { ...prev, storage_used_bytes: (prev.storage_used_bytes || 0) + totalBytes } : prev);
      }
    } catch (err) {
      alert('Errore upload: ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e) => handleFileUpload(e.target.files);

  const removeFile = (path) => {
    setFiles(prev => prev.filter(f => f.path !== path));
  };

  // ── Drag & drop ─────────────────────────────────────────────────────────────
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setDragging(false);
    if (e.dataTransfer.files?.length) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, []);

  // ── Generate link ───────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!files.length) {
      alert('Carica almeno un file.');
      return;
    }
    setGenerating(true);
    try {
      const finalTitle = title.trim() || `Transfer ${new Date().toLocaleDateString('it-IT')}`;
      const finalMessage = [
        recipient ? `Per: ${recipient}` : '',
        message,
      ].filter(Boolean).join('\n\n');

      const delivery = await createDeliveryWithUser({
        projectId:     null,
        title:         finalTitle,
        files,
        message:       finalMessage || null,
        bgImages:      [],
        expiresInDays,
        userId:        user?.id || null,
      });

      const link = `${window.location.origin}/transfer/${delivery.token}`;
      setSharedLink(link);

      // Refresh history
      const updated = await fetchTransfers();
      setTransfers(updated);
    } catch (err) {
      alert('Errore: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = (link, id) => {
    navigator.clipboard.writeText(link);
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetForm = () => {
    setFiles([]);
    setTitle('');
    setMessage('');
    setRecipient('');
    setExpiresInDays(7);
    setSharedLink('');
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-ink">Invia File</h1>
        <p className="text-xs sm:text-sm text-muted mt-1">
          Carica file e genera un link di download da condividere con chiunque.
        </p>
      </div>

      {/* Guest storage bar */}
      {isGuest && profile && (
        <div className="glass rounded-lg p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
          <HardDrive size={16} className="text-burgundy-muted shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted">Spazio utilizzato</span>
              <span className="text-xs font-mono text-ink">
                {formatBytes(profile.storage_used_bytes || 0)} / {formatBytes(storageLimitBytes)}
              </span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-burgundy rounded-full transition-all"
                style={{ width: `${Math.min(((profile.storage_used_bytes || 0) / storageLimitBytes) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Left column: Upload form ── */}
        <div className="lg:col-span-3 space-y-5">
          <div className="glass rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-5">

            {/* Drop zone */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg py-6 sm:py-10 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[120px] ${
                dragging
                  ? 'border-burgundy bg-burgundy/10'
                  : 'border-white/20 hover:border-burgundy-muted hover:bg-white/5'
              }`}
            >
              <input
                type="file"
                multiple
                onChange={handleInputChange}
                className="hidden"
                ref={fileInputRef}
              />
              {uploading ? (
                <Loader2 size={28} className="text-burgundy animate-spin mb-2" />
              ) : (
                <Upload size={28} className="text-subtle mb-2" />
              )}
              <p className="text-sm text-muted">
                {uploading ? 'Caricamento in corso...' : 'Trascina i file qui o clicca per selezionare'}
              </p>
              <p className="text-[11px] text-subtle mt-1">Qualsiasi tipo di file</p>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-2 max-h-[240px] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {files.map(file => (
                    <motion.div
                      key={file.path}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center gap-3 px-3 py-2.5 bg-white/5 border border-white/10 rounded-md"
                    >
                      <FileText size={14} className="text-subtle shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink truncate">{file.name}</p>
                        {file.size > 0 && (
                          <p className="text-[11px] text-subtle font-mono">{formatBytes(file.size)}</p>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(file.path); }}
                        className="p-1 text-subtle hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Form fields */}
            <div className="space-y-4 border-t border-white/10 pt-5">
              <Field label="Titolo">
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="es. Materiale fotografico matrimonio"
                  className="text-sm"
                />
              </Field>

              <Field label="Destinatario (opzionale)">
                <input
                  type="text"
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="es. Mario Rossi"
                  className="text-sm"
                />
              </Field>

              <Field label="Messaggio (opzionale)">
                <textarea
                  rows={3}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Aggiungi un messaggio per il destinatario..."
                  className="text-sm resize-none"
                />
              </Field>

              <Field label="Scadenza">
                <select
                  value={expiresInDays}
                  onChange={e => setExpiresInDays(Number(e.target.value))}
                  className="text-sm"
                >
                  <option value={1}>1 giorno</option>
                  <option value={3}>3 giorni</option>
                  <option value={7}>7 giorni</option>
                  <option value={14}>14 giorni</option>
                  <option value={30}>30 giorni</option>
                </select>
              </Field>
            </div>

            {/* Generate / result */}
            {!sharedLink ? (
              <Btn
                variant="primary"
                className="w-full py-3"
                onClick={handleGenerate}
                disabled={generating || !files.length}
              >
                {generating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Genera Link di Download
              </Btn>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/5 border border-white/15 rounded px-3 py-2.5 text-xs sm:text-sm font-mono truncate text-muted min-w-0">
                    {sharedLink}
                  </div>
                  <Btn variant="secondary" onClick={() => copyLink(sharedLink)} className="shrink-0 min-h-[44px] min-w-[44px]">
                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </Btn>
                </div>
                <Btn variant="ghost" className="w-full" onClick={resetForm}>
                  Nuovo trasferimento
                </Btn>
              </div>
            )}
          </div>
        </div>

        {/* ── Right column: History ── */}
        <div className="lg:col-span-2">
          <div className="glass rounded-lg p-3 sm:p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
              Trasferimenti recenti
            </h2>

            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={18} className="text-subtle animate-spin" />
              </div>
            ) : transfers.length === 0 ? (
              <div className="text-center py-8">
                <Send size={24} className="text-subtle mx-auto mb-2 opacity-30" />
                <p className="text-sm text-subtle">Nessun trasferimento ancora.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {transfers.map(t => {
                  const expired = new Date(t.expires_at) < new Date();
                  const daysLeft = Math.ceil(
                    (new Date(t.expires_at) - new Date()) / (1000 * 60 * 60 * 24)
                  );
                  const link = `${window.location.origin}/transfer/${t.token}`;
                  const fileCount = t.files?.length || 0;

                  return (
                    <div
                      key={t.id}
                      className={`p-3 rounded-md border transition-colors ${
                        expired
                          ? 'bg-white/3 border-white/8 opacity-60'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-sm font-medium text-ink truncate">
                          {t.title}
                        </p>
                        <span className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                          expired
                            ? 'bg-red-900/40 text-red-400'
                            : 'bg-green-900/40 text-green-400'
                        }`}>
                          {expired ? 'Scaduto' : 'Attivo'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-subtle mb-2">
                        <span className="flex items-center gap-1">
                          <FileText size={10} />
                          {fileCount} file
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {expired
                            ? `Scaduto il ${formatDate(t.expires_at)}`
                            : `${daysLeft}g rimanenti`
                          }
                        </span>
                      </div>

                      {!expired && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => copyLink(link, t.id)}
                            className="flex items-center gap-1 text-[11px] text-muted hover:text-ink transition-colors min-h-[44px] sm:min-h-0 px-1"
                          >
                            {copiedId === t.id ? (
                              <Check size={11} className="text-green-400" />
                            ) : (
                              <Copy size={11} />
                            )}
                            Copia link
                          </button>
                          <a
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[11px] text-muted hover:text-ink transition-colors ml-1 min-h-[44px] sm:min-h-0 px-1"
                          >
                            <ExternalLink size={11} />
                            Apri
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
