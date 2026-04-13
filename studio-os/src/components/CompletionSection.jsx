import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Mail, Link as LinkIcon, Check, Copy, 
  Send, Archive, PackageCheck, Loader2, Plus
} from 'lucide-react';
import Btn from './Btn';
import Field from './Field';
import FileItem from './FileItem';
import { uploadProjectFile, createSharedLink } from '../lib/db';
import { useProjects } from '../hooks/useStore';
import { formatDate } from '../lib/utils';

export default function CompletionSection({ project, client }) {
  const { updateProject } = useProjects();
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [sharedLink, setSharedLink] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [emailConfig, setEmailConfig] = useState({
    subject: `Materiale finale - ${project.title}`,
    message: `Ciao ${client?.name || 'Cliente'},\n\nIl progetto "${project.title}" è completato. Trovi in allegato/link i file finali.\n\nGrazie per la collaborazione!`,
  });

  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedFiles = await Promise.all(
        files.map(file => uploadProjectFile(project.id, file))
      );
      
      const updatedFiles = [...(project.files || []), ...uploadedFiles];
      await updateProject(project.id, { files: updatedFiles });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Errore durante l\'upload dei file.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = async (fileToRemove) => {
    const updatedFiles = project.files.filter(f => f.path !== fileToRemove.path);
    await updateProject(project.id, { files: updatedFiles });
    // Note: In a production app, we should also delete from Supabase storage,
    // but we'll stick to updating metadata for now as per simple db logic.
  };

  const handleDownloadFile = async (file) => {
    try {
      const url = await createSharedLink(file.path);
      window.open(url, '_blank');
    } catch (err) {
      alert('Errore nella generazione del link di download.');
    }
  };

  const generateGlobalLink = async () => {
    if (!project.files || project.files.length === 0) {
      alert('Carica almeno un file per generare un link condiviso.');
      return;
    }
    
    setGenerating(true);
    try {
      // For now, we sign the first file or wait for a "ZIP all" feature.
      // Alternatively, we could create a public folder view link if storage allowed.
      // Since we want "WeTransfer style", we'll sign the most relevant file or the first one.
      const firstFilePath = project.files[0].path;
      const url = await createSharedLink(firstFilePath, 60 * 60 * 24 * 7); // 7 days
      setSharedLink(url);
    } catch (err) {
      alert('Errore nella generazione del link.');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sharedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async () => {
    setSending(true);
    try {
      // Prepare payload
      const payload = {
        to: client.email,
        subject: emailConfig.subject,
        text: emailConfig.message,
        projectTitle: project.title,
        price: project.price,
        files: project.files,
        sharedLink: sharedLink
      };

      const res = await fetch('/api/send-completion-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Email sending failed');
      
      alert('Email inviata con successo!');
      await updateProject(project.id, { stage: 'delivered' });
    } catch (err) {
      console.error(err);
      alert('Errore nell\'invio dell\'email. Verifica la configurazione API.');
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-2 border-burgundy/10 rounded-xl shadow-xl overflow-hidden"
    >
      <div className="bg-gradient-to-r from-burgundy/5 to-transparent p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full bg-burgundy/10 flex items-center justify-center text-burgundy">
            <PackageCheck size={24} />
          </div>
          <h2 className="font-display text-xl font-bold text-ink">Fase di Consegna</h2>
        </div>
        <p className="text-sm text-muted">Gestisci i file finali e la condivisione con il cliente.</p>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: File Management */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">File di progetto</h3>
              <input 
                type="file" 
                multiple 
                onChange={handleFileUpload} 
                className="hidden" 
                ref={fileInputRef}
              />
              <Btn 
                variant="secondary" 
                size="sm" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Aggiungi file
              </Btn>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              <AnimatePresence mode="popLayout">
                {project.files && project.files.length > 0 ? (
                  project.files.map((file) => (
                    <motion.div
                      key={file.path}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <FileItem 
                        file={file} 
                        onRemove={handleRemoveFile}
                        onDownload={handleDownloadFile}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg py-12 flex flex-col items-center justify-center text-subtle">
                    <Upload size={32} className="mb-2 opacity-20" />
                    <p className="text-sm">Nessun file caricato.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">Link di Download Rapido</h3>
            <div className="flex gap-2">
              <div className="flex-1 bg-paper border border-border rounded px-3 py-2 text-sm font-mono truncate text-muted">
                {sharedLink || 'Link non ancora generato…'}
              </div>
              {sharedLink ? (
                <Btn variant="secondary" onClick={copyToClipboard} className="shrink-0">
                  {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                </Btn>
              ) : (
                <Btn 
                  variant="primary" 
                  onClick={generateGlobalLink} 
                  disabled={generating || !project.files?.length}
                  className="shrink-0"
                >
                  {generating ? <Loader2 size={14} className="animate-spin" /> : <LinkIcon size={14} />}
                  Genera
                </Btn>
              )}
            </div>
            <p className="text-[10px] text-subtle mt-2 italic">Il link scade automaticamente tra 7 giorni.</p>
          </div>
        </div>

        {/* Right: Email & Final Steps */}
        <div className="space-y-6 flex flex-col">
          <div className="flex-1 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">Configurazione Invio</h3>
            
            <Field label="Oggetto Email">
              <input 
                type="text" 
                value={emailConfig.subject}
                onChange={e => setEmailConfig(prev => ({ ...prev, subject: e.target.value }))}
                className="text-sm"
              />
            </Field>

            <Field label="Messaggio Personalizzato">
              <textarea 
                rows={5}
                value={emailConfig.message}
                onChange={e => setEmailConfig(prev => ({ ...prev, message: e.target.value }))}
                className="text-sm resize-none"
              />
            </Field>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-3">
              <Btn 
                variant="primary" 
                className="flex-1 py-3" 
                onClick={handleSendEmail} 
                disabled={sending || !client?.email}
              >
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Invia via Email
              </Btn>
            </div>
            
            <div className="flex gap-2">
              <Btn 
                variant="secondary" 
                className="flex-1"
                onClick={() => updateProject(project.id, { stage: 'delivered' })}
              >
                Segna come Consegnato
              </Btn>
              <Btn 
                variant="ghost" 
                className="px-3"
                onClick={() => updateProject(project.id, { stage: 'archived' })}
                title="Archivia progetto"
              >
                <Archive size={18} />
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
