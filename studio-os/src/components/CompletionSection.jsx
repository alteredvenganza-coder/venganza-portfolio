import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Mail, Link as LinkIcon, Check, Copy,
  Send, Archive, PackageCheck, Loader2, Plus,
  Image, X,
} from 'lucide-react';
import Btn from './Btn';
import Field from './Field';
import FileItem from './FileItem';
import { uploadProjectFile, createDelivery } from '../lib/db';
import { useProjects } from '../hooks/useStore';

export default function CompletionSection({ project, client }) {
  const { updateProject } = useProjects();

  // ── File consegna ──────────────────────────────────────────────────────────
  const [uploading,   setUploading]   = useState(false);
  const fileInputRef = useRef(null);

  // ── Sfondi carosello ───────────────────────────────────────────────────────
  const [bgImages,    setBgImages]    = useState([]);
  const [bgUploading, setBgUploading] = useState(false);
  const bgInputRef = useRef(null);

  // ── Link / email ───────────────────────────────────────────────────────────
  const [generating,  setGenerating]  = useState(false);
  const [sending,     setSending]     = useState(false);
  const [sharedLink,  setSharedLink]  = useState('');
  const [copied,      setCopied]      = useState(false);

  const [emailConfig, setEmailConfig] = useState({
    subject: `Materiale finale - ${project.title}`,
    message: `Ciao ${client?.name || 'Cliente'},\n\nIl progetto "${project.title}" è completato. Trovi in allegato/link i file finali.\n\nGrazie per la collaborazione!`,
  });

  // ── Upload file consegna ───────────────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map(f => uploadProjectFile(project.id, f)));
      await updateProject(project.id, { files: [...(project.files || []), ...uploaded] });
    } catch (err) {
      alert('Errore upload: ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = async (fileToRemove) => {
    await updateProject(project.id, {
      files: project.files.filter(f => f.path !== fileToRemove.path),
    });
  };

  const handleDownloadFile = (file) => window.open(file.url, '_blank');

  // ── Upload sfondi carosello ────────────────────────────────────────────────
  const handleBgUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setBgUploading(true);
    try {
      const uploaded = await Promise.all(
        files.map(f => uploadProjectFile(`${project.id}-bg`, f))
      );
      setBgImages(prev => [...prev, ...uploaded]);
    } catch (err) {
      alert('Errore upload sfondo: ' + err.message);
    } finally {
      setBgUploading(false);
      if (bgInputRef.current) bgInputRef.current.value = '';
    }
  };

  const removeBgImage = (path) => setBgImages(prev => prev.filter(i => i.path !== path));

  // ── Genera link ────────────────────────────────────────────────────────────
  const generateGlobalLink = async () => {
    if (!project.files?.length) {
      alert('Carica almeno un file per generare il link.');
      return;
    }
    setGenerating(true);
    try {
      const delivery = await createDelivery({
        projectId:    project.id,
        title:        project.title,
        files:        project.files,
        message:      emailConfig.message,
        bgImages:     bgImages.map(i => i.url),
        expiresInDays: 7,
      });
      setSharedLink(`${window.location.origin}/consegna/${delivery.token}`);
    } catch (err) {
      alert('Errore: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sharedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Invia email ────────────────────────────────────────────────────────────
  const handleSendEmail = async () => {
    setSending(true);
    try {
      const res = await fetch('/api/send-completion-email', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          to:           client.email,
          subject:      emailConfig.subject,
          text:         emailConfig.message,
          projectTitle: project.title,
          price:        project.price,
          files:        project.files,
          sharedLink,
        }),
      });
      if (!res.ok) throw new Error('Invio fallito');
      alert('Email inviata!');
      await updateProject(project.id, { stage: 'delivered' });
    } catch (err) {
      alert('Errore email: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-xl shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-burgundy/20 to-transparent p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full bg-burgundy/10 flex items-center justify-center text-burgundy">
            <PackageCheck size={24} />
          </div>
          <h2 className="font-display text-xl font-bold text-ink">Fase di Consegna</h2>
        </div>
        <p className="text-sm text-muted">Gestisci i file finali e la condivisione con il cliente.</p>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Colonna sinistra ── */}
        <div className="space-y-6">

          {/* File di progetto */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">File di progetto</h3>
              <input type="file" multiple onChange={handleFileUpload} className="hidden" ref={fileInputRef} />
              <Btn variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Aggiungi file
              </Btn>
            </div>
            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {project.files?.length > 0 ? project.files.map(file => (
                  <motion.div key={file.path} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <FileItem file={file} onRemove={handleRemoveFile} onDownload={handleDownloadFile} />
                  </motion.div>
                )) : (
                  <div className="border-2 border-dashed border-white/20 rounded-lg py-10 flex flex-col items-center justify-center text-subtle">
                    <Upload size={28} className="mb-2 opacity-20" />
                    <p className="text-sm">Nessun file caricato.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Sfondi carosello ── */}
          <div className="border-t border-white/10 pt-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">Sfondi carosello</h3>
                <p className="text-[11px] text-subtle mt-0.5">Le foto che vede il cliente aprendo il link</p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleBgUpload}
                className="hidden"
                ref={bgInputRef}
              />
              <Btn variant="secondary" size="sm" onClick={() => bgInputRef.current?.click()} disabled={bgUploading}>
                {bgUploading ? <Loader2 size={14} className="animate-spin" /> : <Image size={14} />}
                Aggiungi foto
              </Btn>
            </div>

            {bgImages.length === 0 ? (
              <div
                onClick={() => bgInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 rounded-lg py-8 flex flex-col items-center justify-center text-subtle cursor-pointer hover:border-burgundy-muted hover:text-ink transition-colors"
              >
                <Image size={28} className="mb-2 opacity-20" />
                <p className="text-sm">Clicca per aggiungere foto di sfondo</p>
                <p className="text-[11px] mt-1 opacity-60">Se non aggiungi foto, verrà usato uno sfondo predefinito</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                <AnimatePresence>
                  {bgImages.map((img) => (
                    <motion.div
                      key={img.path}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative aspect-square rounded-md overflow-hidden group"
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeBgImage(img.path)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={11} />
                      </button>
                    </motion.div>
                  ))}
                  {/* Add more button */}
                  <motion.button
                    onClick={() => bgInputRef.current?.click()}
                    className="aspect-square rounded-md border-2 border-dashed border-white/20 flex items-center justify-center text-subtle hover:border-burgundy-muted hover:text-ink transition-colors"
                  >
                    <Plus size={18} />
                  </motion.button>
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Link */}
          <div className="border-t border-white/10 pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">Link cliente</h3>
            <div className="flex gap-2">
              <div className="flex-1 bg-white/5 border border-white/15 rounded px-3 py-2 text-sm font-mono truncate text-muted">
                {sharedLink || 'Ancora non generato…'}
              </div>
              {sharedLink ? (
                <Btn variant="secondary" onClick={copyToClipboard} className="shrink-0">
                  {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                </Btn>
              ) : (
                <Btn variant="primary" onClick={generateGlobalLink} disabled={generating || !project.files?.length} className="shrink-0">
                  {generating ? <Loader2 size={14} className="animate-spin" /> : <LinkIcon size={14} />}
                  Genera
                </Btn>
              )}
            </div>
            <p className="text-[10px] text-subtle mt-2 italic">Il link scade automaticamente tra 7 giorni.</p>
          </div>
        </div>

        {/* ── Colonna destra ── */}
        <div className="space-y-6 flex flex-col">
          <div className="flex-1 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">Configurazione Email</h3>
            <Field label="Oggetto">
              <input type="text" value={emailConfig.subject} onChange={e => setEmailConfig(p => ({ ...p, subject: e.target.value }))} className="text-sm" />
            </Field>
            <Field label="Messaggio">
              <textarea rows={6} value={emailConfig.message} onChange={e => setEmailConfig(p => ({ ...p, message: e.target.value }))} className="text-sm resize-none" />
            </Field>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/10">
            <Btn variant="primary" className="w-full py-3" onClick={handleSendEmail} disabled={sending || !client?.email}>
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              Invia via Email
            </Btn>
            <div className="flex gap-2">
              <Btn variant="secondary" className="flex-1" onClick={() => updateProject(project.id, { stage: 'delivered' })}>
                Segna come Consegnato
              </Btn>
              <Btn variant="ghost" className="px-3" onClick={() => updateProject(project.id, { stage: 'archived' })} title="Archivia">
                <Archive size={18} />
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
